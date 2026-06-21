"""Train Random Forest and compare with Logistic Regression baseline."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from ml.evaluation.compare import compare_baselines, save_baseline_comparison
from ml.evaluation.metrics import ClassificationMetrics
from ml.preprocessing.constants import DEFAULT_RAW_DATA_PATH
from ml.training.artifacts import load_metrics_from_file
from ml.training.constants import LOGISTIC_REGRESSION_METRICS_PATH
from ml.training.logistic_regression import train_logistic_regression
from ml.training.random_forest import train_random_forest


def _metrics_from_payload(payload: dict) -> ClassificationMetrics:
    return ClassificationMetrics(**payload["metrics"])


def _print_metrics(label: str, metrics: ClassificationMetrics) -> None:
    print(f"{label}")
    print(f"  accuracy : {metrics.accuracy:.4f}")
    print(f"  recall   : {metrics.recall:.4f}")
    print(f"  precision: {metrics.precision:.4f}")
    print(f"  f1       : {metrics.f1:.4f}")
    print(f"  roc_auc  : {metrics.roc_auc:.4f}")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Train Random Forest baseline and compare with Logistic Regression (T-206)."
    )
    parser.add_argument(
        "--no-save",
        action="store_true",
        help="Train without writing artifacts to models/random_forest/",
    )
    parser.add_argument(
        "--retrain-logistic",
        action="store_true",
        help="Retrain logistic regression before comparison instead of loading saved metrics.",
    )
    args = parser.parse_args()

    if not DEFAULT_RAW_DATA_PATH.exists():
        print(
            f"Dataset not found at {DEFAULT_RAW_DATA_PATH}. "
            "Run: python ml/scripts/download_dataset.py",
            file=sys.stderr,
        )
        return 1

    if args.retrain_logistic or not LOGISTIC_REGRESSION_METRICS_PATH.exists():
        logistic_artifacts = train_logistic_regression(save=not args.no_save)
        logistic_metrics = logistic_artifacts.metrics
    else:
        logistic_metrics = _metrics_from_payload(load_metrics_from_file(LOGISTIC_REGRESSION_METRICS_PATH))

    rf_artifacts = train_random_forest(save=not args.no_save)
    comparison = compare_baselines(logistic_metrics, rf_artifacts.metrics)

    print("Random Forest training complete.")
    _print_metrics("Logistic Regression:", logistic_metrics)
    print()
    _print_metrics("Random Forest:", rf_artifacts.metrics)
    print()
    print(comparison.summary)
    if not args.no_save:
        save_baseline_comparison(comparison)
        print("  comparison: models/baseline_comparison.json")
        print("  artifacts : models/random_forest/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
