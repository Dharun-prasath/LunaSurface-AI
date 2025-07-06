import os
import glob
import json
import numpy as np
import matplotlib.pyplot as plt
import rasterio

# -------- CONFIG --------
PATCH_FOLDER = "/Users/dharunprasath/Documents/Kalki/Moon_Data/patches/ohr_004"  # 👈 Change this
PATCH_SIZE = 512

# -------- DETECT PATCH TYPE --------
if any(fname.endswith(".img") for fname in os.listdir(PATCH_FOLDER)):
    EXT = ".img"
    IS_RAW = True
else:
    EXT = ".tif"
    IS_RAW = False

# -------- LOAD PATCHES --------
patch_paths = sorted(glob.glob(os.path.join(PATCH_FOLDER, f"*{EXT}")))[:1000]

for patch_path in patch_paths:
    patch_id = os.path.splitext(os.path.basename(patch_path))[0]
    json_path = os.path.join(PATCH_FOLDER, patch_id + ".json")

    # -------- LOAD IMAGE --------
    try:
        if IS_RAW:
            # Read raw .img as 512x512 uint8
            image = np.fromfile(patch_path, dtype=np.uint8).reshape((PATCH_SIZE, PATCH_SIZE))
        else:
            with rasterio.open(patch_path) as src:
                image = src.read(1)
    except Exception as e:
        print(f"❌ Failed to read {patch_path}: {e}")
        continue

    # -------- LOAD METADATA --------
    meta = {}
    if os.path.exists(json_path):
        with open(json_path) as jf:
            meta = json.load(jf)

    # -------- DISPLAY --------
    plt.figure(figsize=(6, 6))
    plt.imshow(image, cmap='gray', vmin=np.percentile(image, 2), vmax=np.percentile(image, 98), interpolation='none')
    plt.title(patch_id, fontsize=10)
    plt.axis("off")

    # -------- OVERLAY METADATA --------
    overlay = ""
    if "latitude" in meta and "longitude" in meta:
        overlay += f"Lat: {meta['latitude']:.4f}, Lon: {meta['longitude']:.4f}\n"
    if "sun_elevation" in meta:
        overlay += f"☀️ Sun: {meta['sun_elevation']}°, Azim: {meta.get('sun_azimuth', '?')}°\n"
    if "satellite_yaw" in meta:
        overlay += f"🛰️ Yaw: {meta['satellite_yaw']} | Roll: {meta['satellite_roll']} | Pitch: {meta['satellite_pitch']}"

    if overlay:
        plt.gcf().text(0.05, 0.05, overlay, fontsize=8, color='yellow', bbox=dict(facecolor='black', alpha=0.5))

    plt.tight_layout()
    plt.show()
