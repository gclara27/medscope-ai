"""Logistic Regression training tests (T-205, RIA-011)."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

from ml.evaluation.metrics import compute_classification_metrics
from ml.preprocessing.constants import DEFAULT_RAW_DATA_PATH, FEATURE_COLUMNS
from ml.preprocessing.pipeline import Diabetes130Preprocessor
from ml.training.artifacts import load_logistic_regression_artifacts, save_logistic_regression_artifacts
from ml.training.constants import LOGISTIC_REGRESSION_MODEL_ID
from ml.training.logistic_regression import build_logistic_regression_model, train_logistic_regression


def test_build_logistic_regression_model_uses_balanced_class_weight() -> None:
    model = build_logistic_regression_model()
    assert model.class_weight == "balanced"
    assert model.max_iter == 1000


def test_compute_classification_metrics_returns_expected_keys() -> None:
    y_true = np.array([0, 1, 1, 0, 1])
    y_pred = np.array([0, 1, 0, 0, 1])
    y_score = np.array([0.1, 0.9, 0.4, 0.2, 0.8])
    metrics = compute_classification_metrics(y_true, y_pred, y_score)
    assert 0.0 <= metrics.accuracy <= 1.0
    assert 0.0 <= metrics.recall <= 1.0
    assert 0.0 <= metrics.roc_auc <= 1.0


def test_train_logistic_regression_on_synthetic_data(
    synthetic_training_frame: pd.DataFrame,
    tmp_path: Path,
) -> None:
    model_path = tmp_path / "model.pkl"
    preprocessor_path = tmp_path / "preprocessor.pkl"
    metrics_path = tmp_path / "metrics.json"

    artifacts = train_logistic_regression(synthetic_training_frame, save=False)
    save_logistic_regression_artifacts(
        artifacts,
        model_path=model_path,
        preprocessor_path=preprocessor_path,
        metrics_path=metrics_path,
    )

    model, preprocessor = load_logistic_regression_artifacts(
        model_path=model_path,
        preprocessor_path=preprocessor_path,
    )
    assert hasattr(model, "predict")
    assert isinstance(preprocessor, Diabetes130Preprocessor)
    assert preprocessor.is_fitted_

    payload = json.loads(metrics_path.read_text(encoding="utf-8"))
    assert payload["model_id"] == LOGISTIC_REGRESSION_MODEL_ID
    assert "recall" in payload["metrics"]


def test_train_logistic_regression_evaluates_on_held_out_split(
    synthetic_training_frame: pd.DataFrame,
) -> None:
    artifacts = train_logistic_regression(synthetic_training_frame, save=False)
    assert artifacts.metrics.accuracy > 0.0
    assert artifacts.metrics.roc_auc >= 0.0


def test_train_logistic_regression_integration_on_real_dataset() -> None:
    if not DEFAULT_RAW_DATA_PATH.exists():
        pytest.skip("Raw dataset not downloaded")

    artifacts = train_logistic_regression(save=False)
    assert set(FEATURE_COLUMNS).issubset(artifacts.preprocessor.feature_columns_)
    assert artifacts.metrics.accuracy > 0.5
    assert artifacts.metrics.recall > 0.0
