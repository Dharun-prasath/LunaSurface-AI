import os
import numpy as np
import json
import csv
from collections import defaultdict
import xml.etree.ElementTree as ET

# -------- CONFIG --------
INPUT_DIR = "/Users/pheonix/Documents/Minor Project/LunaSurface-AI/Backend/Moon_Data/lunasurface_data/ohrc"
OUTPUT_DIR = "/Users/pheonix/Documents/Minor Project/LunaSurface-AI/Backend/Moon_Data/patches"
PATCH_SIZE = 512

os.makedirs(OUTPUT_DIR, exist_ok=True)

# -------- READ IMAGE SIZE FROM XML --------
def get_img_size_from_metadata(folder_path):
    for file in os.listdir(folder_path):
        if file.endswith(".xml") and "meta" in file.lower():
            xml_path = os.path.join(folder_path, file)
            try:
                tree = ET.parse(xml_path) 
                root = tree.getroot()
                ns = {'pds': 'http://pds.nasa.gov/pds4/pds/v1'}
                width = height = None

                for axis in root.findall(".//pds:Axis_Array", ns):
                    name = axis.find("pds:axis_name", ns)
                    elements = axis.find("pds:elements", ns)
                    if name is not None and elements is not None:
                        if name.text.lower() == "sample":
                            width = int(elements.text)
                        elif name.text.lower() == "line":
                            height = int(elements.text)

                if width and height:
                    return width, height

            except Exception as e:
                print(f"❌ XML parse error: {e}")
    return None

# -------- CONVERT .IMG --------
def convert_img_to_array(folder_path):
    img_path = os.path.join(folder_path, "image.img")
    if not os.path.exists(img_path):
        return None

    size = get_img_size_from_metadata(folder_path)
    if not size:
        print(f"❌ Cannot determine size for: {img_path}")
        return None

    width, height = size
    try:
        return np.fromfile(img_path, dtype=np.uint8).reshape((height, width))
    except Exception as e:
        print(f"❌ Failed to load raw .img: {e}")
        return None

# -------- METADATA LOADERS --------
def load_spm(folder):
    for file in os.listdir(folder):
        if file.endswith(".spm"):
            try:
                with open(os.path.join(folder, file), encoding='utf-8', errors='replace') as f:
                    for line in f:
                        parts = line.strip().split()
                        if len(parts) >= 14:
                            return float(parts[13]), float(parts[12])
            except:
                pass
    return None, None

def load_oat(folder):
    for file in os.listdir(folder):
        if file.endswith(".oat"):
            try:
                with open(os.path.join(folder, file), encoding='utf-8', errors='replace') as f:
                    for line in f:
                        parts = line.strip().split()
                        if len(parts) >= 35:
                            return float(parts[32]), float(parts[33]), float(parts[34])
            except:
                pass
    return None, None, None

def load_csv_coords(folder):
    coords = defaultdict(dict)
    for file in os.listdir(folder):
        if file.endswith(".csv"):
            try:
                with open(os.path.join(folder, file), encoding='utf-8', errors='replace') as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        try:
                            px = int(row['Pixel'])
                            py = int(row['Scan'])
                            lon = float(row['Longitude'])
                            lat = float(row.get('Lattitude', row.get('Latitude')))
                            coords[py][px] = (lon, lat)
                        except:
                            pass
            except:
                pass
    return coords

def interpolate_coords(coords_map, x, y):
    if not coords_map:
        return None, None
    if y not in coords_map:
        y = min(coords_map.keys(), key=lambda yy: abs(yy - y))

    line = coords_map[y]
    if x in line:
        return line[x]

    xs = sorted(line.keys())
    for i in range(len(xs) - 1):
        if xs[i] <= x <= xs[i + 1]:
            x0, x1 = xs[i], xs[i + 1]
            lon0, lat0 = line[x0]
            lon1, lat1 = line[x1]
            r = (x - x0) / (x1 - x0)
            return lon0 + r * (lon1 - lon0), lat0 + r * (lat1 - lat0)
    return None, None

# -------- PROCESS OHRC FOLDER --------
def process_folder(folder_path, folder_name):
    patch_dir = os.path.join(OUTPUT_DIR, folder_name)
    os.makedirs(patch_dir, exist_ok=True)

    data = convert_img_to_array(folder_path)
    if data is None:
        print(f"⚠️ Skipping {folder_name}")
        return

    sun_elev, sun_azim = load_spm(folder_path)
    yaw, roll, pitch = load_oat(folder_path)
    coords_map = load_csv_coords(folder_path)

    height, width = data.shape
    count = 0

    for y in range(0, height, PATCH_SIZE):
        for x in range(0, width, PATCH_SIZE):
            patch = data[y:y+PATCH_SIZE, x:x+PATCH_SIZE]
            if patch.shape != (PATCH_SIZE, PATCH_SIZE):
                continue

            patch_id = f"{folder_name}_patch_{count:04d}"
            patch.astype(np.uint8).tofile(
                os.path.join(patch_dir, f"{patch_id}.img")
            )

            meta = {
                "patch_id": patch_id,
                "pixel_x": x,
                "pixel_y": y
            }
            center = PATCH_SIZE // 2
            lon, lat = interpolate_coords(coords_map, x+center, y+center)
            if lon is not None:
                meta["longitude"] = lon
                meta["latitude"] = lat
            if sun_elev is not None:
                meta["sun_elevation"] = sun_elev
            if yaw is not None:
                meta["satellite_yaw"] = yaw

            with open(os.path.join(patch_dir, f"{patch_id}.json"), "w") as jf:
                json.dump(meta, jf, indent=2)

            count += 1

    print(f"✅ {folder_name}: {count} patches")


# -------- MAIN --------
if __name__ == "__main__":
    for folder in sorted(os.listdir(INPUT_DIR)):
        folder_path = os.path.join(INPUT_DIR, folder)
        if os.path.isdir(folder_path):
            print(f"\n🔍 Processing: {folder}")
            process_folder(folder_path, folder)

    print("\n🎉 Done generating OHRC patches + metadata.")
