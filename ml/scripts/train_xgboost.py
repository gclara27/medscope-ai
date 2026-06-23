"""Train XGBoost and compare with LR/RF baselines (T-213)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from ml.evaluation.extended_compare import (
    build_xgboost_evaluation_report,
    save_xgboost_evaluation_report,
)
from ml.evaluation.metrics import ClassificationMetrics
from ml.preprocessing.constants import DEFAULT_RAW_DATA_PATH
from ml.training.artifacts import load_metrics_from_file
from ml.training.constants import (
    LOGISTIC_REGRESSION_METRICS_PATH,
    RANDOM_FOREST_METRICS_PATH,
    XGBOOST_EVALUATION_PATH,
)
from ml.training.logistic_regression import train_logistic_regression
from ml.training.random_forest import train_random_forest
from ml.training.xgboost_classifier import train_xgboost


def _metrics_from_payload(payload: dict) -> ClassificationMetrics:
    return ClassificationMetrics(**payload["metrics"])


def _print_metrics(label: str, metrics: ClassificationMetrics) -> None:
    print(f"{label}")
    print(f"  accuracy : {metrics.accuracy:.4f}")
    print(f"  recall   : {metrics.recall:.4f}")
    print(f"  precision: {metrics.precision:.4f}")
    print(f"  f1       : {metrics.f1:.4f}")
    print(f"  roc_auc  : {metrics.roc_auc:.4f}")


def _load_or_train_logistic(*, retrain: bool, no_save: bool) -> ClassificationMetrics:
    if retrain or not LOGISTIC_REGRESSION_METRICS_PATH.exists():
        return train_logistic_regression(save=not no_save).metrics
    return _metrics_from_payload(load_metrics_from_file(LOGISTIC_REGRESSION_METRICS_PATH))


def _load_or_train_random_forest(*, retrain: bool, no_save: bool) -> ClassificationMetrics:
    if retrain or not RANDOM_FOREST_METRICS_PATH.exists():
        return train_random_forest(save=not no_save).metrics
    return _metrics_from_payload(load_metrics_from_file(RANDOM_FOREST_METRICS_PATH))


def main() -> int:
    parser = argparse.ArgumentParser(description="Train optional XGBoost baseline and compare with LR/RF (T-213).")
    parser.add_argument(
        "--no-save",
        action="store_true",
        help="Train without writing artifacts to models/xgboost/.",
    )
    parser.add_argument(
        "--retrain-baselines",
        action="store_true",
        help="Retrain LR and RF before comparison instead of loading saved metrics.",
    )
    args = parser.parse_args()

    if not DEFAULT_RAW_DATA_PATH.exists():
        print(
            f"Dataset not found at {DEFAULT_RAW_DATA_PATH}. Run: python ml/scripts/download_dataset.py",
            file=sys.stderr,
        )
        return 1

    logistic_metrics = _load_or_train_logistic(retrain=args.retrain_baselines, no_save=args.no_save)
    random_forest_metrics = _load_or_train_random_forest(
        retrain=args.retrain_baselines,
        no_save=args.no_save,
    )
    xgboost_artifacts = train_xgboost(save=not args.no_save)

    report = build_xgboost_evaluation_report(
        logistic_metrics,
        random_forest_metrics,
        xgboost_artifacts.metrics,
    )

    print("XGBoost training complete.")
    _print_metrics("Logistic Regression:", logistic_metrics)
    print()
    _print_metrics("Random Forest:", random_forest_metrics)
    print()
    _print_metrics("XGBoost:", xgboost_artifacts.metrics)
    print()
    print(report.summary)
    for line in report.rationale:
        print(f"  - {line}")

    if not args.no_save:
        save_xgboost_evaluation_report(report)
        print(f"  evaluation: {XGBOOST_EVALUATION_PATH}")
        print("  artifacts : models/xgboost/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
