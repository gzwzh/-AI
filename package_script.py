import os
import zipfile
import json
import sys
import traceback

def zip_dir(path, ziph, ignore_dirs=['node_modules', '.git', 'dist', 'build', 'release', 'release_output']):
    for root, dirs, files in os.walk(path):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, path)
            ziph.write(file_path, arcname)

def main():
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        print(f"Base dir: {base_dir}")
        output_dir = os.path.join(base_dir, 'release_output')
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            print(f"Created {output_dir}")

        # 1. Package 1.0.0
        print("Packaging 1.0.0...")
        pkg_path = os.path.join(base_dir, 'package.json')
        with open(pkg_path, 'r', encoding='utf-8') as f:
            pkg_data = json.load(f)
        
        pkg_data['version'] = '1.0.0'
        with open(pkg_path, 'w', encoding='utf-8') as f:
            json.dump(pkg_data, f, indent=2)

        zip_100 = os.path.join(output_dir, 'calculator_v1.0.0.zip')
        print(f"Zipping to {zip_100}")
        with zipfile.ZipFile(zip_100, 'w', zipfile.ZIP_DEFLATED) as zipf:
            zip_dir(base_dir, zipf)
        
        print(f"Created {zip_100}")

        # 2. Package 1.0.1 Update
        print("Packaging 1.0.1 Update...")
        pkg_data['version'] = '1.0.1'
        with open(pkg_path, 'w', encoding='utf-8') as f:
            json.dump(pkg_data, f, indent=2)
        
        zip_101 = os.path.join(output_dir, 'update_v1.0.1.zip')
        print(f"Zipping to {zip_101}")
        with zipfile.ZipFile(zip_101, 'w', zipfile.ZIP_DEFLATED) as zipf:
            zip_dir(base_dir, zipf)

        print(f"Created {zip_101}")
        print("Done.")
    except Exception:
        traceback.print_exc()

if __name__ == '__main__':
    main()
