"""Select the final production model and document the decision."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from ml.evaluation.report import build_evaluation_report, save_evaluation_report
from ml.evaluation.selection import run_final_model_selection
from ml.evaluation.constants import EVALUATION_REPORT_PATH
from ml.preprocessing.constants import DEFAULT_RAW_DATA_PATH
from ml.training.constants import FINAL_MODEL_SELECTION_PATH


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Select final ML model for MedScope AI MVP (T-208, EP-2.8)."
    )
    parser.add_argument(
        "--no-promote",
        action="store_true",
        help="Write selection JSON without copying artifacts to models/final/.",
    )
    parser.add_argument(
        "--refresh-evaluation",
        action="store_true",
        help="Rebuild models/evaluation_report.json before selecting.",
    )
    args = parser.parse_args()

    if not DEFAULT_RAW_DATA_PATH.exists():
        print(
            f"Dataset not found at {DEFAULT_RAW_DATA_PATH}. "
            "Run: python ml/scripts/download_dataset.py",
            file=sys.stderr,
        )
        return 1

    if args.refresh_evaluation or not EVALUATION_REPORT_PATH.exists():
        report = build_evaluation_report()
        save_evaluation_report(report)
    else:
        report = build_evaluation_report()

    selection = run_final_model_selection(report, promote_artifacts=not args.no_promote)

    print("Final model selection complete.")
    print(f"  selected model : {selection.model_id} v{selection.model_version}")
    print(f"  threshold      : {selection.production_threshold}")
    print(f"  recall         : {selection.metrics.recall:.4f}")
    print(f"  accuracy       : {selection.metrics.accuracy:.4f}")
    print(f"  roc_auc        : {selection.metrics.roc_auc:.4f}")
    print(f"  shap explainer : {selection.shap_explainer}")
    print()
    for line in selection.rationale:
        print(f"  - {line}")
    print()
    for rejected_id, reason in selection.rejected_models.items():
        print(f"  rejected {rejected_id}: {reason}")
    print()
    print(f"  selection: {FINAL_MODEL_SELECTION_PATH}")
    if not args.no_promote:
        print("  artifacts: models/final/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
