import xml.etree.ElementTree as ET
import numpy as np
import matplotlib.pyplot as plt

# ---- PATHS ----
xml_path = "/Users/dharunprasath/Documents/Kalki/Moon_Data/lunasurface_data/ohrc/ohr_004/meta.xml"
img_path = "/Users/dharunprasath/Documents/Kalki/Moon_Data/lunasurface_data/ohrc/ohr_004/image.img"

# ---- PARSE meta.xml ----
tree = ET.parse(xml_path)
root = tree.getroot()

# Remove namespaces for easier tag access
def remove_namespace(tag):
    return tag.split('}')[-1]

# Recursive tag text finder
def find_text_by_tag(root, tag):
    for elem in root.iter():
        if remove_namespace(elem.tag) == tag:
            return elem.text
    return None

# Get axis sizes
axis_elements = [int(e.text) for e in root.findall(".//{*}Axis_Array/{*}elements")]
if len(axis_elements) != 2:
    raise ValueError("Could not determine image dimensions from XML.")

height, width = axis_elements  # Line (rows), Sample (columns)

# Get data type
data_type = find_text_by_tag(root, "data_type")
dtype_map = {
    "UnsignedByte": np.uint8,
    "UnsignedMSB2": np.uint16,
    "SignedMSB2": np.int16,
}
dtype = dtype_map.get(data_type, np.uint8)

print(f"✅ Parsed from XML:\n  → Width: {width}\n  → Height: {height}\n  → Dtype: {dtype.__name__}")

# ---- READ .img FILE ----
img_data = np.fromfile(img_path, dtype=dtype)

expected = width * height
if img_data.size != expected:
    raise ValueError(f"❌ Mismatch in data size: got {img_data.size}, expected {expected}")

# ---- RESHAPE INTO 2D IMAGE ----
img_data = img_data.reshape((height, width))

# ---- CROP CENTER 512×512 PATCH ----
center_y, center_x = height // 2, width // 2
half = 256
patch = img_data[center_y - half:center_y + half, center_x - half:center_x + half]

# ---- NORMALIZE PATCH FOR DISPLAY ----
patch_min, patch_max = patch.min(), patch.max()
normalized_patch = (patch - patch_min) / (patch_max - patch_min)

# ---- DISPLAY PATCH ----
plt.figure(figsize=(6, 6))
plt.imshow(normalized_patch, cmap='gray')
plt.title("Center 512×512 OHRC Patch")
plt.axis("off")
plt.tight_layout()
plt.show()
