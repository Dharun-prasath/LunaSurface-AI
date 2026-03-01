import subprocess
import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
organize_script = os.path.join(BASE_DIR, "Organize.py")
generate_script = os.path.join(BASE_DIR, "Generate.py")
img_to_png_script = os.path.join(BASE_DIR, "img_to_png.py")


def run_script(script_name):
    print(f"\n🚀 Running {script_name} ...\n")
    result = subprocess.run([sys.executable, script_name])
    if result.returncode != 0:
        print(f"\n❌ Error while running {script_name}")
        sys.exit(1)
    else:
        print(f"\n✅ Finished {script_name}")

if __name__ == "__main__":
    run_script(organize_script)
    run_script(generate_script)
    run_script(img_to_png_script)
    print("\n🎉 All Steps Completed Successfully!")