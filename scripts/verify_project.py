import os
import re
import sys

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def verify_project():
    print(f"[*] Verifying Cosmic Horizons Project in: {PROJECT_DIR}")
    errors = []
    warnings = []

    # 1. Check all scenes exist
    expected_scenes = [
        "MainMenu.tscn",
        "MissionSelect.tscn",
        "SatelliteBuilder.tscn",
        "RocketSelector.tscn",
        "AstronautSelector.tscn",
        "AstronautTraining.tscn",
        "LaunchSimulation.tscn",
        "EarthOrbitOps.tscn",
        "MoonSurface.tscn",
        "MarsSurface.tscn",
        "SunOrbitOps.tscn",
        "MissionResults.tscn"
    ]
    scenes_dir = os.path.join(PROJECT_DIR, "scenes")
    for s in expected_scenes:
        p = os.path.join(scenes_dir, s)
        if not os.path.exists(p):
            errors.append(f"Missing Scene File: {s}")
        else:
            print(f"  [OK] Scene exists: {s}")

    # 2. Check scene references in scripts
    scripts_dir = os.path.join(PROJECT_DIR, "scripts")
    res_pattern = re.compile(r'res://([a-zA-Z0-9_/.]+\.tscn)')
    for root, _, files in os.walk(scripts_dir):
        for f in files:
            if f.endswith(".gd"):
                gd_path = os.path.join(root, f)
                with open(gd_path, "r", encoding="utf-8") as file:
                    content = file.read()
                    matches = res_pattern.findall(content)
                    for m in matches:
                        target = os.path.join(PROJECT_DIR, m.replace("/", os.sep))
                        if not os.path.exists(target):
                            errors.append(f"Broken Scene Reference in {f}: res://{m}")
                        else:
                            print(f"  [OK] Valid reference in {f} -> res://{m}")

    # 3. Check @onready node paths in scripts against .tscn files
    onready_pattern = re.compile(r'@onready\s+var\s+\w+:\s*[\w\d]+\s*=\s*\$([^\s\n#]+)')
    for s in expected_scenes:
        tscn_path = os.path.join(scenes_dir, s)
        if not os.path.exists(tscn_path):
            continue
        with open(tscn_path, "r", encoding="utf-8") as file:
            tscn_content = file.read()

        # Find linked script
        script_match = re.search(r'path="res://([^"]+\.gd)"', tscn_content)
        if script_match:
            script_path = os.path.join(PROJECT_DIR, script_match.group(1).replace("/", os.sep))
            if os.path.exists(script_path):
                with open(script_path, "r", encoding="utf-8") as s_file:
                    s_content = s_file.read()
                onreadies = onready_pattern.findall(s_content)
                for node_path in onreadies:
                    # Check if the node path or leaf node name exists in tscn
                    leaf = node_path.split("/")[-1]
                    if f'name="{leaf}"' not in tscn_content:
                        warnings.append(f"Node path check in {s}: '${node_path}' leaf '{leaf}' not explicitly found in {s}")
                    else:
                        print(f"  [OK] Node match in {s}: ${node_path}")

    print("\n" + "="*50)
    print("VERIFICATION AUDIT SUMMARY:")
    if errors:
        print(f"[!] Found {len(errors)} ERROR(S):")
        for e in errors:
            print(f"    - {e}")
    else:
        print("[✓] ZERO ERRORS DETECTED! All scenes and cross-references are valid.")

    if warnings:
        print(f"[?] Found {len(warnings)} Warning(s):")
        for w in warnings:
            print(f"    - {w}")
    else:
        print("[✓] ZERO WARNINGS DETECTED! Node trees are perfectly aligned.")
    print("="*50)

if __name__ == "__main__":
    verify_project()
