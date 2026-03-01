import os
import shutil

BASE = "/Users/pheonix/Documents/Minor Project/LunaSurface-AI/Backend/Moon_Data"

FOLDERS_TO_DELETE = [
    "patches",
    "extracted_zips",
    "lunasurface_data/ohrc"
]

def delete_folder(path):
    if os.path.exists(path):
        try:
            shutil.rmtree(path)
            print(f"🗑 Deleted: {path}")
        except Exception as e:
            print(f"❌ Failed to delete {path}: {e}")
    else:
        print(f"⚠ Not found: {path}")

if __name__ == "__main__":
    print("\n🔥 Cleaning Generated Data...\n")

    for folder in FOLDERS_TO_DELETE:
        full_path = os.path.join(BASE, folder)
        delete_folder(full_path)

    print("\n✅ Cleanup Complete. Raw zips are safe.")
