"""XGBoost optional baseline tests (T-213)."""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
import pytest

pytest.importorskip("xgboost")

from ml.evaluation.extended_compare import (  # noqa: E402
    build_xgboost_evaluation_report,
    save_xgboost_evaluation_report,
    select_best_recall_model,
)
from ml.evaluation.metrics import ClassificationMetrics  # noqa: E402
from ml.preprocessing.constants import DEFAULT_RAW_DATA_PATH, FEATURE_COLUMNS  # noqa: E402
from ml.preprocessing.pipeline import Diabetes130Preprocessor  # noqa: E402
from ml.training.artifacts import load_xgboost_artifacts, save_xgboost_artifacts  # noqa: E402
from ml.training.constants import (  # noqa: E402
    LOGISTIC_REGRESSION_MODEL_ID,
    PRODUCTION_MODEL_ID,
    RANDOM_FOREST_MODEL_ID,
    XGBOOST_MODEL_ID,
)
from ml.training.logistic_regression import train_logistic_regression  # noqa: E402
from ml.training.random_forest import train_random_forest  # noqa: E402
from ml.training.xgboost_classifier import build_xgboost_model, train_xgboost  # noqa: E402


def test_build_xgboost_model_uses_binary_logistic_objective() -> None:
    model = build_xgboost_model(scale_pos_weight=7.5)
    assert model.objective == "binary:logistic"
    assert model.scale_pos_weight == 7.5
    assert model.n_estimators == 200


def test_train_xgboost_on_synthetic_data(
    synthetic_training_frame: pd.DataFrame,
    tmp_path: Path,
) -> None:
    model_path = tmp_path / "model.pkl"
    preprocessor_path = tmp_path / "preprocessor.pkl"
    metrics_path = tmp_path / "metrics.json"

    artifacts = train_xgboost(synthetic_training_frame, save=False)
    save_xgboost_artifacts(
        artifacts,
        model_path=model_path,
        preprocessor_path=preprocessor_path,
        metrics_path=metrics_path,
    )

    model, preprocessor = load_xgboost_artifacts(
        model_path=model_path,
        preprocessor_path=preprocessor_path,
    )
    assert hasattr(model, "predict_proba")
    assert isinstance(preprocessor, Diabetes130Preprocessor)
    assert preprocessor.is_fitted_

    payload = json.loads(metrics_path.read_text(encoding="utf-8"))
    assert payload["model_id"] == XGBOOST_MODEL_ID
    assert "recall" in payload["metrics"]


def test_select_best_recall_model_across_three_baselines() -> None:
    metrics_by_model = {
        LOGISTIC_REGRESSION_MODEL_ID: ClassificationMetrics(0.6, 0.55, 0.12, 0.2, 0.61),
        RANDOM_FOREST_MODEL_ID: ClassificationMetrics(0.82, 0.20, 0.14, 0.17, 0.59),
        XGBOOST_MODEL_ID: ClassificationMetrics(0.70, 0.48, 0.13, 0.21, 0.63),
    }
    assert select_best_recall_model(metrics_by_model) == LOGISTIC_REGRESSION_MODEL_ID


def test_build_xgboost_evaluation_report_keeps_production_model() -> None:
    logistic = ClassificationMetrics(0.61, 0.54, 0.12, 0.20, 0.61)
    random_forest = ClassificationMetrics(0.82, 0.20, 0.14, 0.17, 0.59)
    xgboost = ClassificationMetrics(0.70, 0.48, 0.13, 0.21, 0.63)

    report = build_xgboost_evaluation_report(logistic, random_forest, xgboost)
    assert report.recall_winner == LOGISTIC_REGRESSION_MODEL_ID
    assert report.production_model == PRODUCTION_MODEL_ID
    assert report.changes_production_model is False
    assert "XGBoost" in report.summary


def test_save_xgboost_evaluation_report_writes_json(tmp_path: Path) -> None:
    report = build_xgboost_evaluation_report(
        ClassificationMetrics(0.6, 0.5, 0.1, 0.2, 0.6),
        ClassificationMetrics(0.65, 0.4, 0.12, 0.18, 0.58),
        ClassificationMetrics(0.68, 0.45, 0.11, 0.19, 0.60),
    )
    output = tmp_path / "xgboost_evaluation.json"
    save_xgboost_evaluation_report(report, output)
    payload = json.loads(output.read_text(encoding="utf-8"))
    assert payload["recall_winner"] == LOGISTIC_REGRESSION_MODEL_ID
    assert XGBOOST_MODEL_ID in payload["models"]


def test_train_xgboost_integration_on_real_dataset() -> None:
    if not DEFAULT_RAW_DATA_PATH.exists():
        pytest.skip("Raw dataset not downloaded")

    xgboost = train_xgboost(save=False)
    assert set(FEATURE_COLUMNS).issubset(xgboost.preprocessor.feature_columns_)
    assert 0.0 <= xgboost.metrics.recall <= 1.0
    assert xgboost.metrics.accuracy > 0.5

    logistic = train_logistic_regression(save=False)
    random_forest = train_random_forest(save=False)
    report = build_xgboost_evaluation_report(
        logistic.metrics,
        random_forest.metrics,
        xgboost.metrics,
    )
    assert report.recall_winner in {
        LOGISTIC_REGRESSION_MODEL_ID,
        RANDOM_FOREST_MODEL_ID,
        XGBOOST_MODEL_ID,
    }
