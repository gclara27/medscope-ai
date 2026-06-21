"""Export EDA figures for thesis defense (T-214, RAC-001)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from ml.eda.constants import DEFAULT_EXPORT_DIR
from ml.eda.figures import export_all_eda_figures
from ml.preprocessing.constants import DEFAULT_RAW_DATA_PATH


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Export Diabetes 130-US EDA figures for thesis defense (T-214)."
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_EXPORT_DIR,
        help=f"Directory for PNG exports (default: {DEFAULT_EXPORT_DIR})",
    )
    parser.add_argument("--dpi", type=int, default=150, help="Figure resolution (default: 150)")
    args = parser.parse_args()

    if not DEFAULT_RAW_DATA_PATH.exists():
        print(
            f"Dataset not found at {DEFAULT_RAW_DATA_PATH}. "
            "Run: python ml/scripts/download_dataset.py",
            file=sys.stderr,
        )
        return 1

    manifest = export_all_eda_figures(args.output_dir, dpi=args.dpi)
    print(f"Exported {len(manifest['figures'])} EDA figures to {args.output_dir}")
    for item in manifest["figures"]:
        print(f"  - {item['file']}")
    print(f"  manifest: {args.output_dir / 'manifest.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
