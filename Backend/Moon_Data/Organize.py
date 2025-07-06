import os
import zipfile
import shutil
import re

# ----------- CONFIG PATHS ------------
RAW_ZIP_DIR = "/Users/dharunprasath/Documents/Kalki/Moon_Data/raw_zips"
EXTRACTED_DIR = "/Users/dharunprasath/Documents/Kalki/Moon_Data/extracted_zips"
TARGET_OHRC = "/Users/dharunprasath/Documents/Kalki/Moon_Data/lunasurface_data/ohrc"
TARGET_TMC = "/Users/dharunprasath/Documents/Kalki/Moon_Data/lunasurface_data/tmc"
TARGET_DTM = "/Users/dharunprasath/Documents/Kalki/Moon_Data/lunasurface_data/dtm"

# ----------- STEP 1: EXTRACT ZIPS ------------
os.makedirs(EXTRACTED_DIR, exist_ok=True)
for file in os.listdir(RAW_ZIP_DIR):
    if file.endswith(".zip"):
        zip_path = os.path.join(RAW_ZIP_DIR, file)
        folder_name = os.path.splitext(file)[0]
        extract_path = os.path.join(EXTRACTED_DIR, folder_name)
        os.makedirs(extract_path, exist_ok=True)
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)
        print(f"✅ Extracted: {file}")

# ----------- STEP 2: ORGANIZE TMC + DTM -----------

def extract_timestamp(filename):
    match = re.search(r'(\d{8}T\d+)', filename)
    return match.group(1) if match else None

tmc_map, dtm_map = {}, {}

for root, _, files in os.walk(EXTRACTED_DIR):
    for file in files:
        path = os.path.join(root, file)
        lower = file.lower()
        timestamp = extract_timestamp(file)

        if not timestamp:
            continue

        if 'tmc' in lower and 'oth' in lower and file.endswith('.tif'):
            tmc_map.setdefault(timestamp, {})['image'] = path
        elif 'tmc' in lower and ('dtm' in lower or 'dem' in lower) and file.endswith('.tif'):
            dtm_map.setdefault(timestamp, {})['image'] = path
        elif 'tmc' in lower and file.endswith('.xml'):
            if timestamp in tmc_map and 'meta' not in tmc_map[timestamp]:
                tmc_map[timestamp]['meta'] = path
            elif timestamp in dtm_map and 'meta' not in dtm_map[timestamp]:
                dtm_map[timestamp]['meta'] = path

matched_ts = sorted(set(tmc_map.keys()) & set(dtm_map.keys()))
for idx, ts in enumerate(matched_ts):
    tmc_folder = os.path.join(TARGET_TMC, f"tmc_{idx:03d}")
    dtm_folder = os.path.join(TARGET_DTM, f"dtm_{idx:03d}")
    os.makedirs(tmc_folder, exist_ok=True)
    os.makedirs(dtm_folder, exist_ok=True)

    shutil.copy(tmc_map[ts]['image'], os.path.join(tmc_folder, "image.tif"))
    if 'meta' in tmc_map[ts]:
        shutil.copy(tmc_map[ts]['meta'], os.path.join(tmc_folder, "meta.xml"))

    shutil.copy(dtm_map[ts]['image'], os.path.join(dtm_folder, "image.tif"))
    if 'meta' in dtm_map[ts]:
        shutil.copy(dtm_map[ts]['meta'], os.path.join(dtm_folder, "meta.xml"))

print(f"✅ Saved {len(matched_ts)} matched TMC + DTM pairs.")

# ----------- STEP 3: ORGANIZE OHRC FILES -----------

count_ohrc = 0
ohrc_folders = {}

# First: create folders for .img files
for root, _, files in os.walk(EXTRACTED_DIR):
    for file in files:
        if file.lower().endswith('.img') and 'ohr' in file.lower():
            timestamp = extract_timestamp(file)
            if not timestamp:
                continue
            folder = os.path.join(TARGET_OHRC, f"ohr_{count_ohrc:03d}")
            os.makedirs(folder, exist_ok=True)
            shutil.copy(os.path.join(root, file), os.path.join(folder, "image.img"))
            ohrc_folders[timestamp] = folder
            count_ohrc += 1

# Second: move metadata into correct folder
for root, _, files in os.walk(EXTRACTED_DIR):
    for file in files:
        if 'ohr' not in file.lower():
            continue
        filepath = os.path.join(root, file)
        timestamp = extract_timestamp(file)
        if not timestamp or timestamp not in ohrc_folders:
            continue
        matched_folder = ohrc_folders[timestamp]

        if file.endswith('.xml') and 'data' in root:
            shutil.copy(filepath, os.path.join(matched_folder, "meta.xml"))
        elif file.endswith('.csv') and 'geometry' in root:
            shutil.copy(filepath, os.path.join(matched_folder, "coords.csv"))
        elif file.endswith('.xml') and 'geometry' in root:
            shutil.copy(filepath, os.path.join(matched_folder, "coords.xml"))
        elif file.endswith('.spm'):
            shutil.copy(filepath, os.path.join(matched_folder, "sun.spm"))
        elif file.endswith('.oat'):
            shutil.copy(filepath, os.path.join(matched_folder, "orbit.oat"))

print(f"✅ Saved {count_ohrc} OHRC folders.")
print("\n🎉 All lunar files extracted, matched, and organized cleanly.")
