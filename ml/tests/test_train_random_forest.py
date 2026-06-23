"""Random Forest training and baseline comparison tests (T-206)."""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
import pytest

from ml.evaluation.compare import (
    compare_baselines,
    save_baseline_comparison,
    select_baseline_winner,
)
from ml.evaluation.metrics import ClassificationMetrics
from ml.preprocessing.constants import DEFAULT_RAW_DATA_PATH, FEATURE_COLUMNS
from ml.preprocessing.pipeline import Diabetes130Preprocessor
from ml.training.artifacts import load_random_forest_artifacts, save_random_forest_artifacts
from ml.training.constants import RANDOM_FOREST_MODEL_ID
from ml.training.logistic_regression import train_logistic_regression
from ml.training.random_forest import build_random_forest_model, train_random_forest


def test_build_random_forest_model_uses_balanced_class_weight() -> None:
    model = build_random_forest_model()
    assert model.class_weight == "balanced"
    assert model.n_estimators == 200


def test_train_random_forest_on_synthetic_data(
    synthetic_training_frame: pd.DataFrame,
    tmp_path: Path,
) -> None:
    model_path = tmp_path / "model.pkl"
    preprocessor_path = tmp_path / "preprocessor.pkl"
    metrics_path = tmp_path / "metrics.json"

    artifacts = train_random_forest(synthetic_training_frame, save=False)
    save_random_forest_artifacts(
        artifacts,
        model_path=model_path,
        preprocessor_path=preprocessor_path,
        metrics_path=metrics_path,
    )

    model, preprocessor = load_random_forest_artifacts(
        model_path=model_path,
        preprocessor_path=preprocessor_path,
    )
    assert hasattr(model, "predict")
    assert isinstance(preprocessor, Diabetes130Preprocessor)
    assert preprocessor.is_fitted_

    payload = json.loads(metrics_path.read_text(encoding="utf-8"))
    assert payload["model_id"] == RANDOM_FOREST_MODEL_ID
    assert "recall" in payload["metrics"]


def test_compare_baselines_prefers_recall() -> None:
    logistic_metrics = ClassificationMetrics(
        accuracy=0.80,
        recall=0.50,
        precision=0.20,
        f1=0.30,
        roc_auc=0.70,
    )
    random_forest_metrics = ClassificationMetrics(
        accuracy=0.78,
        recall=0.62,
        precision=0.18,
        f1=0.28,
        roc_auc=0.72,
    )
    comparison = compare_baselines(logistic_metrics, random_forest_metrics)
    assert comparison.winner == RANDOM_FOREST_MODEL_ID
    assert "recall" in comparison.summary


def test_select_baseline_winner_uses_tie_breakers() -> None:
    logistic_metrics = ClassificationMetrics(0.7, 0.6, 0.2, 0.3, 0.65)
    random_forest_metrics = ClassificationMetrics(0.7, 0.6, 0.2, 0.35, 0.70)
    assert select_baseline_winner(logistic_metrics, random_forest_metrics) == RANDOM_FOREST_MODEL_ID


def test_random_forest_beats_or_matches_logistic_on_synthetic_data(
    synthetic_training_frame: pd.DataFrame,
) -> None:
    logistic = train_logistic_regression(synthetic_training_frame, save=False)
    random_forest = train_random_forest(synthetic_training_frame, save=False)
    comparison = compare_baselines(logistic.metrics, random_forest.metrics)
    assert comparison.winner in {logistic.model_id, random_forest.model_id}


def test_save_baseline_comparison_writes_json(tmp_path: Path) -> None:
    comparison = compare_baselines(
        ClassificationMetrics(0.6, 0.5, 0.1, 0.2, 0.6),
        ClassificationMetrics(0.65, 0.55, 0.12, 0.22, 0.62),
    )
    output = tmp_path / "baseline_comparison.json"
    save_baseline_comparison(comparison, output)
    payload = json.loads(output.read_text(encoding="utf-8"))
    assert payload["winner"] == RANDOM_FOREST_MODEL_ID


def test_train_random_forest_integration_on_real_dataset() -> None:
    if not DEFAULT_RAW_DATA_PATH.exists():
        pytest.skip("Raw dataset not downloaded")

    logistic = train_logistic_regression(save=False)
    random_forest = train_random_forest(save=False)
    assert set(FEATURE_COLUMNS).issubset(random_forest.preprocessor.feature_columns_)
    assert random_forest.metrics.accuracy > 0.5
    assert random_forest.metrics.recall > 0.0

    comparison = compare_baselines(logistic.metrics, random_forest.metrics)
    assert comparison.winner in {logistic.model_id, random_forest.model_id}
