"""Logistic Regression baseline trainer (T-205, RIA-011)."""

from __future__ import annotations

from typing import Any

import pandas as pd
from sklearn.linear_model import LogisticRegression

from ml.preprocessing.constants import RANDOM_STATE
from ml.training.artifacts import save_logistic_regression_artifacts
from ml.training.base import train_classifier
from ml.training.constants import (
    LOGISTIC_REGRESSION_MODEL_ID,
    LOGISTIC_REGRESSION_MODEL_VERSION,
)


def build_logistic_regression_model(
    *,
    random_state: int = RANDOM_STATE,
    class_weight: str | dict[int, float] = "balanced",
    max_iter: int = 1000,
) -> LogisticRegression:
    """Create an unfitted Logistic Regression tuned for recall on imbalanced data."""
    return LogisticRegression(
        random_state=random_state,
        class_weight=class_weight,
        max_iter=max_iter,
        solver="lbfgs",
    )


def train_logistic_regression(
    frame: pd.DataFrame | None = None,
    *,
    save: bool = True,
    model_kwargs: dict[str, Any] | None = None,
):
    """Train baseline Logistic Regression on the stratified train split."""
    model = build_logistic_regression_model(**(model_kwargs or {}))
    return train_classifier(
        model,
        frame,
        model_id=LOGISTIC_REGRESSION_MODEL_ID,
        model_version=LOGISTIC_REGRESSION_MODEL_VERSION,
        save=save,
        save_fn=save_logistic_regression_artifacts if save else None,
    )
