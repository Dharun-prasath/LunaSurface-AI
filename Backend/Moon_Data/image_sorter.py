import os
import glob
import shutil
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image

# -------- CONFIG --------
PATCH_FOLDER = "/Users/pheonix/Documents/Minor Project/LunaSurface-AI/Backend/Moon_Data/patches"
OUTPUT_BASE = "/Users/pheonix/Documents/Minor Project/LunaSurface-AI/Backend/Moon_Data/ManualSelected"

CRATER_DIR = os.path.join(OUTPUT_BASE, "crater_images")
MOUNTAIN_DIR = os.path.join(OUTPUT_BASE, "mountain_images")

for folder in [CRATER_DIR, MOUNTAIN_DIR]:
    os.makedirs(folder, exist_ok=True)

# -------- LOAD PATCHES --------
patch_paths = sorted(glob.glob(os.path.join(PATCH_FOLDER, "**/*.png"), recursive=True))

if len(patch_paths) == 0:
    print("No PNG images found!")
    exit()

print("Total images found:", len(patch_paths))

index = 0

# -------- COUNTERS --------
def count_images(folder):
    return len(os.listdir(folder))

# -------- DISPLAY FUNCTION --------
def show_image(i):
    plt.clf()

    img_path = patch_paths[i]
    img = np.array(Image.open(img_path))

    plt.imshow(img, cmap='gray')
    plt.axis("off")

    title = f"{os.path.basename(img_path)}  ({i+1}/{len(patch_paths)})"
    plt.title(title, fontsize=10)

    # overlay counters
    overlay = (
        f"Crater: {count_images(CRATER_DIR)}\n"
        f"Mountain: {count_images(MOUNTAIN_DIR)}\n\n"
        "Keys:\n"
        "→ next | ← prev\n"
        "c = crater\n"
        "m = mountain\n"
        "esc = exit"
    )

    plt.gcf().text(
        0.02, 0.02,
        overlay,
        fontsize=9,
        color='yellow',
        bbox=dict(facecolor='black', alpha=0.6)
    )

    plt.draw()

# -------- KEYBOARD EVENTS --------
def on_key(event):
    global index

    img_path = patch_paths[index]

    if event.key == 'right':
        index = (index + 1) % len(patch_paths)
        show_image(index)

    elif event.key == 'left':
        index = (index - 1) % len(patch_paths)
        show_image(index)

    elif event.key == 'c':
        shutil.copy(img_path, CRATER_DIR)
        print("Saved to crater")
        index = (index + 1) % len(patch_paths)
        show_image(index)

    elif event.key == 'm':
        shutil.copy(img_path, MOUNTAIN_DIR)
        print("Saved to mountain")
        index = (index + 1) % len(patch_paths)
        show_image(index)

    elif event.key == 'escape':
        plt.close()

# -------- START VIEWER --------
plt.figure(figsize=(6,6))
show_image(index)
plt.gcf().canvas.mpl_connect('key_press_event', on_key)
plt.show()