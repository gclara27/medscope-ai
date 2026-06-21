"""Shared training utilities for offline classifiers."""

from __future__ import annotations

from typing import Any, Callable

import pandas as pd

from ml.evaluation.metrics import ClassificationMetrics, compute_classification_metrics
from ml.preprocessing.pipeline import Diabetes130Preprocessor, train_test_split_data
from ml.training.artifacts import TrainingArtifacts


def train_classifier(
    model: Any,
    frame: pd.DataFrame | None,
    *,
    model_id: str,
    model_version: str,
    save: bool = True,
    save_fn: Callable[[TrainingArtifacts], None] | None = None,
) -> TrainingArtifacts:
    """Fit preprocessor + classifier on train split and evaluate on held-out test."""
    x_train, x_test, y_train, y_test = train_test_split_data(frame)
    preprocessor = Diabetes130Preprocessor().fit(x_train)

    x_train_transformed = preprocessor.transform(x_train)
    x_test_transformed = preprocessor.transform(x_test)

    model.fit(x_train_transformed, y_train)

    y_pred = model.predict(x_test_transformed)
    y_score = model.predict_proba(x_test_transformed)[:, 1]
    metrics = compute_classification_metrics(y_test, y_pred, y_score)

    artifacts = TrainingArtifacts(
        model=model,
        preprocessor=preprocessor,
        metrics=metrics,
        model_id=model_id,
        model_version=model_version,
    )
    if save and save_fn is not None:
        save_fn(artifacts)
    return artifacts
