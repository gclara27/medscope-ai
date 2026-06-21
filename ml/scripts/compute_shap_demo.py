"""Demo SHAP explanation for a sample patient."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from ml.explainability.explainer import ShapExplainerService, build_demo_patient_features
from ml.training.constants import MODEL_MANIFEST_PATH, PRODUCTION_MODEL_PATH


def main() -> int:
    parser = argparse.ArgumentParser(description="Compute SHAP explanation demo (T-210, UC-030).")
    parser.add_argument(
        "--top-n",
        type=int,
        default=10,
        help="Number of ranked features to return.",
    )
    args = parser.parse_args()

    if not PRODUCTION_MODEL_PATH.exists() or not MODEL_MANIFEST_PATH.exists():
        print(
            "Production model not found. Run: python ml/scripts/serialize_model.py",
            file=sys.stderr,
        )
        return 1

    features = build_demo_patient_features()
    result = ShapExplainerService().explain(features, top_n=args.top_n)

    print("SHAP explanation demo")
    print(f"  model       : {result.model_id} v{result.model_version}")
    print(f"  risk_score  : {result.risk_score:.4f}")
    print(f"  risk_level  : {result.risk_level}")
    print(f"  summary     : {result.summary}")
    print("  top features:")
    for item in result.contributions:
        sign = "+" if item.shap_value >= 0 else ""
        print(
            f"    #{item.importance_rank} {item.feature_name}={item.feature_value!r} "
            f"shap={sign}{item.shap_value:.4f} ({item.direction})"
        )
    print()
    print(json.dumps(result.to_dict(), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
