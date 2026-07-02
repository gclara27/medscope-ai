"""Pinned demo predictions for T-902 — deterministic scores for defense scenarios."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from ml.training.constants import MODELS_DIR

DEMO_GOLDEN_PATH = MODELS_DIR / "demo_golden_predictions.json"


def load_demo_golden(path: Path = DEMO_GOLDEN_PATH) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(
            f"Demo golden predictions not found at {path}. Regenerate after model serialize.",
        )
    return json.loads(path.read_text(encoding="utf-8"))


def assert_manifest_matches_golden(manifest: dict[str, Any], golden: dict[str, Any]) -> None:
    for key in ("model_id", "model_version"):
        if manifest.get(key) != golden.get(key):
            raise AssertionError(
                f"Manifest {key}={manifest.get(key)!r} does not match golden {golden.get(key)!r}",
            )


def score_within_tolerance(actual: float, expected: float, tolerance: float) -> bool:
    return abs(actual - expected) <= tolerance
