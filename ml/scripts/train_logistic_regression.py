"""Train Logistic Regression baseline from the command line."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from ml.preprocessing.constants import DEFAULT_RAW_DATA_PATH
from ml.training.logistic_regression import train_logistic_regression


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Train MedScope AI Logistic Regression baseline (T-205)."
    )
    parser.add_argument(
        "--no-save",
        action="store_true",
        help="Train without writing artifacts to models/logistic_regression/",
    )
    args = parser.parse_args()

    if not DEFAULT_RAW_DATA_PATH.exists():
        print(
            f"Dataset not found at {DEFAULT_RAW_DATA_PATH}. "
            "Run: python ml/scripts/download_dataset.py",
            file=sys.stderr,
        )
        return 1

    artifacts = train_logistic_regression(save=not args.no_save)
    metrics = artifacts.metrics
    print("Logistic Regression training complete.")
    print(f"  accuracy : {metrics.accuracy:.4f}")
    print(f"  recall   : {metrics.recall:.4f}")
    print(f"  precision: {metrics.precision:.4f}")
    print(f"  f1       : {metrics.f1:.4f}")
    print(f"  roc_auc  : {metrics.roc_auc:.4f}")
    if not args.no_save:
        print("  artifacts: models/logistic_regression/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
