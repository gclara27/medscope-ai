"""Download the Diabetes 130-US hospitals dataset from UCI (T-201, RIA-001)."""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DATASETS_DIR = REPO_ROOT / "datasets"
MANIFEST_PATH = DATASETS_DIR / "manifest.json"
DEFAULT_OUTPUT = DATASETS_DIR / "diabetes130" / "raw" / "data.csv"

UCI_DATA_URL = "https://archive.ics.uci.edu/static/public/296/data.csv"
UCI_DATASET_PAGE = "https://archive.ics.uci.edu/dataset/296/diabetes+130-us+hospitals+for+years+1999+2008"
USER_AGENT = "MedScope-AI/1.0 (TFM; dataset bootstrap)"


def load_manifest() -> dict:
    if not MANIFEST_PATH.exists():
        raise FileNotFoundError(f"Missing manifest at {MANIFEST_PATH}. Run from a complete repo checkout.")
    return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def download_file(url: str, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            data = response.read()
    except urllib.error.URLError as exc:
        raise SystemExit(f"Download failed: {exc}") from exc

    destination.write_bytes(data)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Download Diabetes 130-US hospitals CSV into datasets/.")
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"Output CSV path (default: {DEFAULT_OUTPUT})",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-download even if the file already exists.",
    )
    args = parser.parse_args(argv)

    manifest = load_manifest()
    output_path: Path = args.output

    if output_path.exists() and not args.force:
        print(f"Dataset already present: {output_path}")
        print(f"SHA-256: {sha256_file(output_path)}")
        print("Use --force to re-download.")
        return 0

    print(f"Downloading from {UCI_DATA_URL}")
    download_file(UCI_DATA_URL, output_path)

    file_hash = sha256_file(output_path)
    size_bytes = output_path.stat().st_size
    print(f"Saved to {output_path}")
    print(f"Size: {size_bytes:,} bytes")
    print(f"SHA-256: {file_hash}")

    expected_hash = manifest.get("files", {}).get("raw_csv", {}).get("sha256")
    if expected_hash and file_hash != expected_hash:
        print(
            "WARNING: SHA-256 does not match datasets/manifest.json. "
            "UCI may have updated the file; refresh the manifest if intentional.",
            file=sys.stderr,
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
