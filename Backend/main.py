"""
LunaSurface AI — FastAPI Backend
---------------------------------
POST /upload              → save zip to raw_zips/
POST /run-pipeline        → run run_all.py
POST /run-analysis        → run crater detection on all patches/ PNGs
GET  /status              → SSE log stream
GET  /results             → raw patch metadata + image URLs
GET  /results-analyzed    → analyzed patch metadata + image URLs
GET  /patch-image/{path}  → serve PNG from patches/
GET  /analyzed-image/{path} → serve PNG from patches_analyzed/
GET  /health              → health check
"""

import os
import sys
import io
import json
import asyncio
from pathlib import Path
from typing import AsyncGenerator

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Circle
from scipy import ndimage
from PIL import Image

import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware

# ─── PATHS ───────────────────────────────────────────────────────────────────
BASE_DIR     = Path("/Users/pheonix/Documents/Minor Project/LunaSurface-AI/Backend/Moon_Data")
RAW_ZIPS     = BASE_DIR / "raw_zips"
PATCHES_DIR  = BASE_DIR / "patches"
ANALYZED_DIR = BASE_DIR / "patches_analyzed"
RUN_ALL      = BASE_DIR / "run_all.py"
MODEL_PATH   = "/Users/pheonix/Documents/Minor Project/LunaSurface-AI/Backend/lunar_ssl_segmentation_advanced.pth"

RAW_ZIPS.mkdir(parents=True, exist_ok=True)
ANALYZED_DIR.mkdir(parents=True, exist_ok=True)

# ─── DEVICE ──────────────────────────────────────────────────────────────────
DEVICE = (
    "mps"  if torch.backends.mps.is_available()  else
    "cuda" if torch.cuda.is_available()           else
    "cpu"
)

# ─── MODEL DEFINITION (copied exactly from training notebook) ─────────────
IMG_SIZE   = 512
NUM_CLASSES = 2


class Encoder(nn.Module):
    def __init__(self):
        super().__init__()

        # Stage 1  512 → 256
        self.stage1 = nn.Sequential(
            nn.Conv2d(1, 32, 3, padding=1), nn.BatchNorm2d(32), nn.ReLU(),
            nn.Conv2d(32, 32, 3, padding=1), nn.ReLU(),
            nn.MaxPool2d(2),
        )
        # Stage 2  256 → 128
        self.stage2 = nn.Sequential(
            nn.Conv2d(32, 64, 3, padding=1), nn.BatchNorm2d(64), nn.ReLU(),
            nn.Conv2d(64, 64, 3, padding=1), nn.ReLU(),
            nn.MaxPool2d(2),
        )
        # Stage 3  128 → 128
        self.stage3 = nn.Sequential(
            nn.Conv2d(64, 128, 3, padding=1), nn.BatchNorm2d(128), nn.ReLU(),
            nn.Conv2d(128, 128, 3, padding=1), nn.ReLU(),
        )

    def forward(self, x):
        c1 = self.stage1(x)   # [B, 32,  H/2, W/2]
        c2 = self.stage2(c1)  # [B, 64,  H/4, W/4]
        c3 = self.stage3(c2)  # [B, 128, H/4, W/4]
        return c1, c2, c3


class MultiScaleSegModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.encoder = Encoder()
        self.fusion = nn.Sequential(
            nn.Conv2d(32 + 64 + 128, 128, 3, padding=1),
            nn.ReLU(),
            nn.Conv2d(128, NUM_CLASSES, 1),
        )

    def forward(self, x):
        c1, c2, c3 = self.encoder(x)
        c2_up = F.interpolate(c2, size=c1.shape[2:], mode="bilinear", align_corners=False)
        c3_up = F.interpolate(c3, size=c1.shape[2:], mode="bilinear", align_corners=False)
        fused = torch.cat([c1, c2_up, c3_up], dim=1)
        mask  = self.fusion(fused)
        mask  = F.interpolate(mask, size=(IMG_SIZE, IMG_SIZE),
                              mode="bilinear", align_corners=False)
        return mask


# ─── LAZY MODEL LOADER ───────────────────────────────────────────────────────
_seg_model = None

def _get_model() -> MultiScaleSegModel:
    global _seg_model
    if _seg_model is not None:
        return _seg_model

    model = MultiScaleSegModel()
    state = torch.load(MODEL_PATH, map_location=DEVICE)

    # unwrap common checkpoint wrappers just in case
    if isinstance(state, dict):
        for key in ("state_dict", "model_state_dict", "model"):
            if key in state:
                state = state[key]
                break

    model.load_state_dict(state, strict=True)
    model.to(DEVICE)
    model.eval()
    _seg_model = model
    return _seg_model


# ─── IMAGE TRANSFORM (same as training) ──────────────────────────────────────
_TRANSFORM = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.Grayscale(1),
    transforms.ToTensor(),
])

# ─── APP ─────────────────────────────────────────────────────────────────────
app = FastAPI(title="LunaSurface AI API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

log_queue: asyncio.Queue = asyncio.Queue()


# ─── HEALTH ──────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "device": DEVICE}


# ─── UPLOAD ZIP ──────────────────────────────────────────────────────────────
@app.post("/upload")
async def upload_zip(file: UploadFile = File(...)):
    if not file.filename.endswith(".zip"):
        raise HTTPException(400, "Only .zip files accepted.")
    dest     = RAW_ZIPS / file.filename
    contents = await file.read()
    dest.write_bytes(contents)
    await log_queue.put(
        f"📥 Saved {file.filename} ({len(contents)/1024/1024:.1f} MB) → raw_zips/"
    )
    return {"message": "Upload successful", "path": str(dest)}


# ─── RUN PIPELINE ────────────────────────────────────────────────────────────
@app.post("/run-pipeline")
async def run_pipeline():
    if not RUN_ALL.exists():
        raise HTTPException(404, f"run_all.py not found at {RUN_ALL}")
    asyncio.create_task(_run_script())
    return {"message": "Pipeline started"}


async def _run_script():
    await log_queue.put("🔧 Starting pipeline — running run_all.py…")
    try:
        proc = await asyncio.create_subprocess_exec(
            sys.executable, str(RUN_ALL),
            cwd=str(BASE_DIR),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
        )
        async for raw_line in proc.stdout:
            line = raw_line.decode("utf-8", errors="replace").rstrip()
            if line:
                await log_queue.put(line)
        await proc.wait()
        code = proc.returncode
        if code == 0:
            await log_queue.put("✅ Pipeline complete — click ◫ Patches to load results")
        else:
            await log_queue.put(f"❌ Pipeline exited with code {code}")
    except Exception as e:
        await log_queue.put(f"❌ Error: {e}")


# ─── RUN ANALYSIS ────────────────────────────────────────────────────────────
@app.post("/run-analysis")
async def run_analysis():
    asyncio.create_task(_run_analysis())
    return {"message": "Analysis started"}


async def _run_analysis():
    await log_queue.put("🔬 Starting crater analysis…")

    exts = {".png", ".jpg", ".jpeg"}
    all_files = sorted(
        [p for p in PATCHES_DIR.rglob("*") if p.suffix.lower() in exts],
        key=lambda p: str(p.relative_to(PATCHES_DIR)),
    )

    if not all_files:
        await log_queue.put("⚠ No patch images found — run pipeline first")
        return

    await log_queue.put(f"📂 Found {len(all_files)} patch(es)")

    # load model in thread so event loop stays free
    try:
        model = await asyncio.get_event_loop().run_in_executor(None, _get_model)
    except Exception as e:
        await log_queue.put(f"❌ Model load failed: {e}")
        return

    await log_queue.put(f"✅ Model ready on {DEVICE.upper()}")

    processed = errors = 0

    for idx, fpath in enumerate(all_files, 1):
        rel      = fpath.relative_to(PATCHES_DIR)
        out_dir  = ANALYZED_DIR / rel.parent
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / (rel.stem + "_analyzed.png")

        await log_queue.put(f"[{idx}/{len(all_files)}] ◎ {rel.name}")

        try:
            png_bytes = await asyncio.get_event_loop().run_in_executor(
                None, _analyse_single, model, fpath
            )
            out_path.write_bytes(png_bytes)
            processed += 1
        except Exception as e:
            await log_queue.put(f"  ⚠ Skipped {rel.name}: {e}")
            errors += 1

    await log_queue.put(
        f"✅ Analysis complete — {processed} saved, {errors} error(s) → patches_analyzed/"
    )


def _analyse_single(model: MultiScaleSegModel, fpath: Path) -> bytes:
    """
    Exactly the same logic as the working test cell in the notebook:
      - open as grayscale
      - resize to IMG_SIZE (512)
      - run seg_model
      - label connected components of class==1
      - draw red Circle patches + yellow CN labels
      - return PNG bytes
    """
    # ── load & transform (identical to training) ─────────────────────────────
    img_pil    = Image.open(fpath).convert("L")
    img_tensor = _TRANSFORM(img_pil).unsqueeze(0).to(DEVICE)   # [1,1,512,512]

    # ── inference ─────────────────────────────────────────────────────────────
    with torch.no_grad():
        pred       = model(img_tensor)
        pred_class = torch.argmax(F.softmax(pred, dim=1), dim=1)  # [1,512,512]

    # ── numpy ─────────────────────────────────────────────────────────────────
    img_np  = img_tensor[0, 0].cpu().numpy()          # (512,512) float
    pred_np = pred_class[0].cpu().numpy()              # (512,512) int

    binary         = (pred_np == 1).astype(np.uint8)  # crater mask
    labeled, num   = ndimage.label(binary)

    # ── draw (identical to notebook) ─────────────────────────────────────────
    fig, ax = plt.subplots(figsize=(6, 6), dpi=100)
    ax.imshow(img_np, cmap="gray")

    count = 0
    for i in range(1, num + 1):
        ys, xs = np.where(labeled == i)
        area   = len(xs)
        if area < 30:
            continue

        cx     = xs.mean()
        cy     = ys.mean()
        radius = np.sqrt(area / np.pi)

        ax.add_patch(Circle(
            (cx, cy), radius,
            edgecolor="red",
            facecolor=(1, 0, 0, 0.25),
            linewidth=1.5,
        ))
        count += 1
        ax.text(cx, cy, f"C{count}",
                color="yellow", fontsize=8, ha="center", va="center")

    ax.set_title(f"Rounded Crater Detection: {count}",
                 color="#a9e2ff", fontsize=10)
    ax.axis("off")
    fig.patch.set_facecolor("#050a10")
    ax.set_facecolor("#050a10")

    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight",
                facecolor=fig.get_facecolor(), dpi=100)
    plt.close(fig)
    buf.seek(0)
    return buf.read()


# ─── SSE STATUS ──────────────────────────────────────────────────────────────
@app.get("/status")
async def status_stream():
    async def event_generator() -> AsyncGenerator[str, None]:
        while True:
            try:
                msg = await asyncio.wait_for(log_queue.get(), timeout=25.0)
                yield f"data: {json.dumps({'log': msg})}\n\n"
            except asyncio.TimeoutError:
                yield ": ping\n\n"
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ─── RESULTS HELPERS ─────────────────────────────────────────────────────────
def _scan_folder(folder: Path, base_url: str):
    if not folder.exists():
        return JSONResponse({"results": [], "message": f"{folder.name}/ not found"})

    exts = {".png", ".jpg", ".jpeg"}
    all_files = sorted(
        [p for p in folder.rglob("*") if p.suffix.lower() in exts and p.exists()],
        key=lambda p: str(p.relative_to(folder)),
    )
    if not all_files:
        return JSONResponse({"results": [], "message": "No images found"})

    results = []
    for idx, fpath in enumerate(all_files):
        rel     = fpath.relative_to(folder)
        rel_str = str(rel).replace("\\", "/")
        results.append({
            "patch_id":  str(rel.with_suffix("")),
            "filename":  fpath.name,
            "rel_path":  rel_str,
            "image_url": f"{base_url}/{rel_str}",
            "index":     idx + 1,
            "total":     len(all_files),
        })
    return JSONResponse({"results": results, "count": len(results)})


@app.get("/results")
async def get_results():
    return _scan_folder(PATCHES_DIR, "http://localhost:8000/patch-image")


@app.get("/results-analyzed")
async def get_results_analyzed():
    return _scan_folder(ANALYZED_DIR, "http://localhost:8000/analyzed-image")


# ─── SERVE IMAGES ────────────────────────────────────────────────────────────
@app.get("/patch-image/{rel_path:path}")
async def patch_image(rel_path: str):
    safe = (PATCHES_DIR / rel_path).resolve()
    if not str(safe).startswith(str(PATCHES_DIR.resolve())):
        raise HTTPException(403, "Forbidden")
    if not safe.exists():
        raise HTTPException(404, f"Not found: {rel_path}")
    media = "image/jpeg" if safe.suffix.lower() in (".jpg", ".jpeg") else "image/png"
    return FileResponse(str(safe), media_type=media)


@app.get("/analyzed-image/{rel_path:path}")
async def analyzed_image(rel_path: str):
    safe = (ANALYZED_DIR / rel_path).resolve()
    if not str(safe).startswith(str(ANALYZED_DIR.resolve())):
        raise HTTPException(403, "Forbidden")
    if not safe.exists():
        raise HTTPException(404, f"Not found: {rel_path}")
    return FileResponse(str(safe), media_type="image/png")


# ─── RUN ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)