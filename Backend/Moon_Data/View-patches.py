import os
import glob
import json
import numpy as np
import matplotlib.pyplot as plt
import rasterio

# -------- CONFIG --------
PATCH_FOLDER = "/Users/pheonix/Documents/Minor Project/LunaSurface-AI/Backend/Moon_Data/patches/ohr_001"
PATCH_SIZE = 512

# -------- DETECT PATCH TYPE --------
if any(fname.endswith(".img") for fname in os.listdir(PATCH_FOLDER)):
    EXT = ".img"
    IS_RAW = True
else:
    EXT = ".tif"
    IS_RAW = False

# -------- LOAD PATCH PATHS --------
patch_paths = sorted(glob.glob(os.path.join(PATCH_FOLDER, f"*{EXT}")))[:1000]

if len(patch_paths) == 0:
    print("No patches found!")
    exit()

index = 0  # current image index

# -------- FUNCTION TO SHOW IMAGE --------
def show_image(i):
    patch_path = patch_paths[i]
    patch_id = os.path.splitext(os.path.basename(patch_path))[0]
    json_path = os.path.join(PATCH_FOLDER, patch_id + ".json")

    # -------- LOAD IMAGE --------
    try:
        if IS_RAW:
            image = np.fromfile(patch_path, dtype=np.uint8).reshape((PATCH_SIZE, PATCH_SIZE))
        else:
            with rasterio.open(patch_path) as src:
                image = src.read(1)
    except Exception as e:
        print(f"❌ Failed to read {patch_path}: {e}")
        return

    # -------- LOAD METADATA --------
    meta = {}
    if os.path.exists(json_path):
        with open(json_path) as jf:
            meta = json.load(jf)

    # -------- CLEAR OLD IMAGE --------
    plt.clf()

    # -------- DISPLAY IMAGE --------
    plt.imshow(
        image,
        cmap='gray',
        vmin=np.percentile(image, 2),
        vmax=np.percentile(image, 98),
        interpolation='none'
    )
    plt.title(f"{patch_id}  ({i+1}/{len(patch_paths)})", fontsize=10)
    plt.axis("off")

    # -------- OVERLAY METADATA --------
    overlay = ""
    if "latitude" in meta and "longitude" in meta:
        overlay += f"Lat: {meta['latitude']:.4f}, Lon: {meta['longitude']:.4f}\n"
    if "sun_elevation" in meta:
        overlay += f"Sun: {meta['sun_elevation']}°, Azim: {meta.get('sun_azimuth', '?')}°\n"
    if "satellite_yaw" in meta:
        overlay += f"Yaw: {meta['satellite_yaw']} | Roll: {meta.get('satellite_roll','?')} | Pitch: {meta.get('satellite_pitch','?')}"

    if overlay:
        plt.gcf().text(
            0.02, 0.02, overlay,
            fontsize=8,
            color='yellow',
            bbox=dict(facecolor='black', alpha=0.5)
        )

    plt.tight_layout()
    plt.draw()


# -------- KEYBOARD CONTROLS --------
def on_key(event):
    global index

    if event.key == 'right':  # Next
        index = (index + 1) % len(patch_paths)
        show_image(index)

    elif event.key == 'left':  # Previous
        index = (index - 1) % len(patch_paths)
        show_image(index)

    elif event.key == 'escape':  # Exit
        plt.close()


# -------- START VIEWER --------
plt.figure(figsize=(6, 6))
show_image(index)
plt.gcf().canvas.mpl_connect('key_press_event', on_key)
plt.show()
