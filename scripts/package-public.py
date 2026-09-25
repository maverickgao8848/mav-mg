"""Build a reproducible public MAV-MG archive from the Git index."""

import argparse
import hashlib
import json
import re
import subprocess
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_STYLES = {"cobalt-grid", "editorial-forest"}
PUBLIC_SHOWCASE = {"cobalt-grid.jpg", "editorial-forest.jpg"}


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()

    tracked = subprocess.check_output(["git", "ls-files", "-z"], cwd=ROOT).decode().split("\0")
    files = sorted(path for path in tracked if path)
    style_paths = [Path(name) for name in files if name.startswith("assets/styles/")]
    showcase_paths = [Path(name) for name in files if name.startswith("assets/showcase/styles/")]
    assert {path.parts[2] for path in style_paths} == PUBLIC_STYLES, "Public styles must be exactly the approved two"
    assert {path.name for path in showcase_paths} == PUBLIC_SHOWCASE, "Public showcase must be exactly the approved two"
    for style in PUBLIC_STYLES:
        assert f"assets/styles/{style}/FRAME.md" in files
        assert f"assets/styles/{style}/metadata.json" in files
    for name in files:
        assert (ROOT / name).is_file(), f"Tracked file missing: {name}"
        assert not (ROOT / name).is_symlink(), f"Linked file forbidden: {name}"

    skill = (ROOT / "SKILL.md").read_text(encoding="utf-8")
    match = re.search(r'^\s+version: "([^"]+)"$', skill, re.MULTILINE)
    assert match, "SKILL.md metadata.version is missing"
    version = match.group(1)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    archive = args.output_dir / f"mav-mg-{version}.zip"
    entries = []
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for name in files:
            data = (ROOT / name).read_bytes()
            info = zipfile.ZipInfo(f"mav-mg/{name}", date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            zf.writestr(info, data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
            entries.append({"path": name, "sha256": sha256(data)})
    archive_bytes = archive.read_bytes()
    manifest = {
        "schemaVersion": 1,
        "release": {"skillId": "mav-mg", "version": version, "publicStyles": sorted(PUBLIC_STYLES)},
        "archive": {"name": archive.name, "bytes": len(archive_bytes), "sha256": sha256(archive_bytes)},
        "files": entries,
    }
    manifest_path = args.output_dir / f"mav-mg-{version}.manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{archive} ({len(files)} files, sha256 {manifest['archive']['sha256']})")
    print(manifest_path)


if __name__ == "__main__":
    main()
