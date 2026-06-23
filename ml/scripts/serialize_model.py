"""Publish production model.pkl and preprocessor.pkl for backend inference."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from ml.training.constants import (
    MODEL_MANIFEST_PATH,
    PRODUCTION_MODEL_PATH,
    PRODUCTION_PREPROCESSOR_PATH,
)
from ml.training.serialize import serialize_production_model, validate_production_artifacts


def main() -> int:
    parser = argparse.ArgumentParser(description="Serialize production ML artifacts to models/ (T-209, RIA-020).")
    parser.add_argument(
        "--skip-validation",
        action="store_true",
        help="Skip post-serialization smoke test.",
    )
    args = parser.parse_args()

    try:
        manifest = serialize_production_model()
    except FileNotFoundError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    if not args.skip_validation:
        validate_production_artifacts()

    print("Production model serialization complete.")
    print(f"  model_id     : {manifest.model_id} v{manifest.model_version}")
    print(f"  threshold    : {manifest.production_threshold}")
    print(f"  shap         : {manifest.shap_explainer}")
    print(f"  features     : {len(manifest.feature_columns)}")
    print(f"  model        : {PRODUCTION_MODEL_PATH}")
    print(f"  preprocessor : {PRODUCTION_PREPROCESSOR_PATH}")
    print(f"  manifest     : {MODEL_MANIFEST_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
