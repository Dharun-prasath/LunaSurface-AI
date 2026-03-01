import os
import numpy as np
from PIL import Image
import xml.etree.ElementTree as ET

# -------- CONFIG --------
PATCH_DIR = "/Users/pheonix/Documents/Minor Project/LunaSurface-AI/Backend/Moon_Data/patches"
OUTPUT_SUFFIX = "_png"

# -------- READ SIZE FROM XML --------
def get_img_size_from_meta(folder_path):
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
                print("XML error:", e)
    return None


# -------- CONVERT PATCH IMG → PNG --------
def convert_patch_img(img_path, patch_size=512):
    try:
        data = np.fromfile(img_path, dtype=np.uint8)
        data = data.reshape((patch_size, patch_size))

        #normalize optional
        data = (data - data.min()) / (data.max() - data.min()) * 255
        data = data.astype(np.uint8)

        img = Image.fromarray(data, mode='L')  # grayscale
        png_path = img_path.replace(".img", ".png")
        img.save(png_path)

        print(f"✅ Converted: {os.path.basename(img_path)}")
    except Exception as e:
        print(f"❌ Failed: {img_path}", e)


# -------- MAIN --------
for root, _, files in os.walk(PATCH_DIR):
    for file in files:
        if file.endswith(".img"):
            convert_patch_img(os.path.join(root, file))

print("\n🎉 All IMG patches converted to PNG.")
