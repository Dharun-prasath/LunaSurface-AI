import os
import numpy as np
import rasterio
from rasterio.windows import Window
from rasterio.transform import Affine
import json
import csv
from collections import defaultdict
import xml.etree.ElementTree as ET

# -------- CONFIG --------
INPUT_DIR = "/Users/dharunprasath/Documents/Kalki/Moon_Data/lunasurface_data"
OUTPUT_DIR = "/Users/dharunprasath/Documents/Kalki/Moon_Data/patches"
PATCH_SIZE = 512
FORMATS = ['ohrc', 'tmc', 'dtm']


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

# -------- CONVERT .img (only for OHRC) --------
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
        data = np.fromfile(img_path, dtype=np.uint8).reshape((height, width))
        return data
    except Exception as e:
        print(f"❌ Failed to load raw .img: {e}")
        return None

# -------- METADATA UTILS --------
def generate_metadata(transform, row_off, col_off):
    return Affine(
        transform.a, transform.b, transform.c + col_off * transform.a,
        transform.d, transform.e, transform.f + row_off * transform.e
    )

def load_spm(folder):
    for file in os.listdir(folder):
        if file.endswith(".spm"):
            path = os.path.join(folder, file)
            try:
                with open(path, mode='r', encoding='utf-8', errors='replace') as f:
                    for line in f:
                        parts = line.strip().split()
                        if len(parts) >= 14:
                            try:
                                return float(parts[13]), float(parts[12])
                            except ValueError:
                                continue
            except Exception as e:
                print(f"❌ Error reading .spm file: {path}\n    {e}")
    return None, None

def load_oat(folder):
    for file in os.listdir(folder):
        if file.endswith(".oat"):
            path = os.path.join(folder, file)
            try:
                with open(path, mode='r', encoding='utf-8', errors='replace') as f:
                    for line in f:
                        parts = line.strip().split()
                        if len(parts) >= 35:
                            try:
                                return float(parts[32]), float(parts[33]), float(parts[34])
                            except ValueError:
                                continue
            except Exception as e:
                print(f"❌ Error reading .oat file: {path}\n    {e}")
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
                            continue
            except Exception as e:
                print(f"❌ Error reading .csv: {e}")
    return coords

def interpolate_coords(coords_map, x, y):
    if y not in coords_map:
        if not coords_map:
            return None, None
        all_y = sorted(coords_map.keys())
        y = min(all_y, key=lambda yy: abs(yy - y))

    line = coords_map.get(y, {})
    if x in line:
        return line[x]

    xs = sorted(line.keys())
    for i in range(len(xs) - 1):
        if xs[i] <= x <= xs[i + 1]:
            x0, x1 = xs[i], xs[i + 1]
            lon0, lat0 = line[x0]
            lon1, lat1 = line[x1]
            ratio = (x - x0) / (x1 - x0)
            lon = lon0 + ratio * (lon1 - lon0)
            lat = lat0 + ratio * (lat1 - lat0)
            return lon, lat
    return None, None

# -------- PROCESS EACH FOLDER --------
def process_folder(folder_path, folder_name):
    patch_dir = os.path.join(OUTPUT_DIR, folder_name)
    os.makedirs(patch_dir, exist_ok=True)

    is_ohr = "ohr" in folder_name
    sun_elev, sun_azim = load_spm(folder_path) if is_ohr else (None, None)
    yaw, roll, pitch = load_oat(folder_path) if is_ohr else (None, None, None)
    coords_map = load_csv_coords(folder_path) if is_ohr else {}

    if is_ohr:
        data = convert_img_to_array(folder_path)
        if data is None:
            print(f"⚠️ Skipping {folder_name} (img not loaded)")
            return
        height, width = data.shape
        transform = Affine.identity()
    else:
        image_path = os.path.join(folder_path, "image.tif")
        if not os.path.exists(image_path):
            print(f"⚠️ Missing image.tif in {folder_name}")
            return
        with rasterio.open(image_path) as src:
            data = src.read(1)
            height, width = src.height, src.width
            transform = src.transform

    count = 0
    for y in range(0, height, PATCH_SIZE):
        for x in range(0, width, PATCH_SIZE):
            patch = data[y:y+PATCH_SIZE, x:x+PATCH_SIZE]
            if patch.shape != (PATCH_SIZE, PATCH_SIZE):
                continue

            patch_id = f"{folder_name}_patch_{count:04d}"
            patch_meta = {
                "patch_id": patch_id,
                "pixel_x": x,
                "pixel_y": y
            }

            if is_ohr:
                patch_path = os.path.join(patch_dir, f"{patch_id}.img")
                patch.astype(np.uint8).tofile(patch_path)
            else:
                patch_path = os.path.join(patch_dir, f"{patch_id}.tif")
                meta = {
                    "driver": "GTiff",
                    "height": PATCH_SIZE,
                    "width": PATCH_SIZE,
                    "count": 1,
                    "dtype": data.dtype,
                    "transform": generate_metadata(transform, y, x)
                }
                with rasterio.open(patch_path, "w", **meta) as dst:
                    dst.write(patch, 1)
                patch_meta["transform"] = list(meta["transform"])

            # OHRC extras
            if is_ohr:
                if sun_elev is not None:
                    patch_meta["sun_elevation"] = sun_elev
                    patch_meta["sun_azimuth"] = sun_azim
                if yaw is not None:
                    patch_meta["satellite_yaw"] = yaw
                    patch_meta["satellite_roll"] = roll
                    patch_meta["satellite_pitch"] = pitch
                lon, lat = interpolate_coords(coords_map, x + PATCH_SIZE//2, y + PATCH_SIZE//2)
                if lon is not None:
                    patch_meta["longitude"] = lon
                    patch_meta["latitude"] = lat

            with open(os.path.join(patch_dir, f"{patch_id}.json"), "w", encoding='utf-8') as jf:
                json.dump(patch_meta, jf, indent=2)

            count += 1
    print(f"✅ {folder_name}: {count} patches")

# -------- MAIN --------
if __name__ == "__main__":
    for fmt in FORMATS:
        folder_root = os.path.join(INPUT_DIR, fmt)
        for folder in sorted(os.listdir(folder_root)):
            folder_path = os.path.join(folder_root, folder)
            if os.path.isdir(folder_path):
                print(f"\n🔍 Processing: {folder}")
                process_folder(folder_path, folder)

    print("\n🎉 Done generating patches and enriched metadata JSONs.")
