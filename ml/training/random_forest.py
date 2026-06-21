"""Random Forest trainer (T-206, EP-2.6)."""

from __future__ import annotations

from typing import Any

import pandas as pd
from sklearn.ensemble import RandomForestClassifier

from ml.preprocessing.constants import RANDOM_STATE
from ml.training.artifacts import save_random_forest_artifacts
from ml.training.base import train_classifier
from ml.training.constants import RANDOM_FOREST_MODEL_ID, RANDOM_FOREST_MODEL_VERSION


def build_random_forest_model(
    *,
    random_state: int = RANDOM_STATE,
    class_weight: str | dict[int, float] = "balanced",
    n_estimators: int = 200,
    min_samples_leaf: int = 5,
    n_jobs: int = -1,
) -> RandomForestClassifier:
    """Create an unfitted Random Forest tuned for recall on imbalanced data."""
    return RandomForestClassifier(
        random_state=random_state,
        class_weight=class_weight,
        n_estimators=n_estimators,
        min_samples_leaf=min_samples_leaf,
        n_jobs=n_jobs,
    )


def train_random_forest(
    frame: pd.DataFrame | None = None,
    *,
    save: bool = True,
    model_kwargs: dict[str, Any] | None = None,
):
    """Train Random Forest on the same stratified split as the LR baseline."""
    model = build_random_forest_model(**(model_kwargs or {}))
    return train_classifier(
        model,
        frame,
        model_id=RANDOM_FOREST_MODEL_ID,
        model_version=RANDOM_FOREST_MODEL_VERSION,
        save=save,
        save_fn=save_random_forest_artifacts if save else None,
    )
