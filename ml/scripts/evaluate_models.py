"""Evaluate trained baseline models and store metrics report."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from ml.evaluation.constants import EVALUATION_REPORT_PATH, TARGET_ACCURACY
from ml.evaluation.report import build_evaluation_report, save_evaluation_report
from ml.preprocessing.constants import DEFAULT_RAW_DATA_PATH


def _print_threshold_block(label: str, block: dict) -> None:
    metrics = block["metrics"]
    print(f"  {label} (threshold={block['threshold']:.2f})")
    print(f"    accuracy : {metrics['accuracy']:.4f}")
    print(f"    recall   : {metrics['recall']:.4f}")
    print(f"    precision: {metrics['precision']:.4f}")
    print(f"    f1       : {metrics['f1']:.4f}")
    print(f"    roc_auc  : {metrics['roc_auc']:.4f}")
    print(f"    accuracy target (>={TARGET_ACCURACY:.0%}): {'PASS' if block['meets_accuracy_target'] else 'FAIL'}")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Evaluate baseline models and write models/evaluation_report.json (T-207)."
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=EVALUATION_REPORT_PATH,
        help="Path for the JSON evaluation report.",
    )
    args = parser.parse_args()

    if not DEFAULT_RAW_DATA_PATH.exists():
        print(
            f"Dataset not found at {DEFAULT_RAW_DATA_PATH}. Run: python ml/scripts/download_dataset.py",
            file=sys.stderr,
        )
        return 1

    report = build_evaluation_report()
    save_evaluation_report(report, args.output)

    print("Model evaluation complete.")
    print(f"  primary metric: {report.targets['primary_metric']}")
    print(f"  recommended   : {report.recommended_model}")
    print(f"  reason        : {report.recommendation_reason}")
    print()
    for model_id, model_report in report.models.items():
        print(model_id)
        payload = model_report.to_dict()
        _print_threshold_block("default", payload["default_threshold"])
        _print_threshold_block("recall optimized", payload["recall_optimized"])
        print()
    print(f"  report: {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
