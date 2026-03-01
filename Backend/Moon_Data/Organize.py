import os
import zipfile
import shutil
import re

# ----------- CONFIG PATHS ------------
RAW_ZIP_DIR   = "/Users/pheonix/Documents/Minor Project/LunaSurface-AI/Backend/Moon_Data/raw_zips"
EXTRACTED_DIR = "/Users/pheonix/Documents/Minor Project/LunaSurface-AI/Backend/Moon_Data/extracted_zips"
TARGET_OHRC   = "/Users/pheonix/Documents/Minor Project/LunaSurface-AI/Backend/Moon_Data/lunasurface_data/ohrc"

os.makedirs(EXTRACTED_DIR, exist_ok=True)
os.makedirs(TARGET_OHRC, exist_ok=True)

# ----------- STEP 1: EXTRACT ZIPS ------------
for file in os.listdir(RAW_ZIP_DIR):
    if file.endswith(".zip"):
        zip_path = os.path.join(RAW_ZIP_DIR, file)
        folder_name = os.path.splitext(file)[0]
        extract_path = os.path.join(EXTRACTED_DIR, folder_name)

        os.makedirs(extract_path, exist_ok=True)
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)

        print(f"✅ Extracted: {file}")

# ----------- HELPER ------------
def extract_timestamp(filename):
    match = re.search(r'(\d{8}T\d+)', filename)
    return match.group(1) if match else None


# ----------- ORGANIZE OHRC FILES ------------
count_ohrc = 0
ohrc_folders = {}

# FIRST: CREATE FOLDERS FOR OHRC IMAGES
for root, _, files in os.walk(EXTRACTED_DIR):
    for file in files:
        lower = file.lower()

        if lower.endswith('.img') and 'ohr' in lower:
            timestamp = extract_timestamp(file)
            if not timestamp:
                continue

            folder = os.path.join(TARGET_OHRC, f"ohr_{count_ohrc:03d}")
            os.makedirs(folder, exist_ok=True)

            shutil.copy(os.path.join(root, file),
                        os.path.join(folder, "image.img"))

            ohrc_folders[timestamp] = folder
            count_ohrc += 1

# SECOND: MOVE METADATA INTO SAME FOLDER
for root, _, files in os.walk(EXTRACTED_DIR):
    for file in files:
        lower = file.lower()
        if 'ohr' not in lower:
            continue

        filepath = os.path.join(root, file)
        timestamp = extract_timestamp(file)

        if not timestamp or timestamp not in ohrc_folders:
            continue

        matched_folder = ohrc_folders[timestamp]

        if lower.endswith('.xml'):
            shutil.copy(filepath, os.path.join(matched_folder, "meta.xml"))

        elif lower.endswith('.csv'):
            shutil.copy(filepath, os.path.join(matched_folder, "coords.csv"))

        elif lower.endswith('.spm'):
            shutil.copy(filepath, os.path.join(matched_folder, "sun.spm"))

        elif lower.endswith('.oat'):
            shutil.copy(filepath, os.path.join(matched_folder, "orbit.oat"))

print(f"✅ Saved {count_ohrc} OHRC folders.")
print("\n🎉 OHRC Files Extracted and Organized Successfully.")
