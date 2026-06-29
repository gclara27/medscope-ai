"""Publish production model.pkl and preprocessor.pkl for backend inference."""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from ml.logging_config import configure_logging, get_logger
from ml.training.constants import (
    MODEL_MANIFEST_PATH,
    PRODUCTION_MODEL_PATH,
    PRODUCTION_PREPROCESSOR_PATH,
)
from ml.training.serialize import serialize_production_model, validate_production_artifacts

configure_logging(service="medscope-ml")
logger = get_logger(__name__)


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
        logger.error("serialize_failed", extra={"reason": str(exc)})
        return 1

    if not args.skip_validation:
        validate_production_artifacts()

    logger.info(
        "serialize_complete",
        extra={
            "model_id": manifest.model_id,
            "model_version": manifest.model_version,
            "feature_count": len(manifest.feature_columns),
            "model_path": str(PRODUCTION_MODEL_PATH),
            "preprocessor_path": str(PRODUCTION_PREPROCESSOR_PATH),
            "manifest_path": str(MODEL_MANIFEST_PATH),
        },
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
