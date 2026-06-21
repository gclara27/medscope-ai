"""Formal evaluation report tests (T-207, RIA-012)."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
import pytest
from sklearn.linear_model import LogisticRegression

from ml.evaluation.constants import TARGET_ACCURACY
from ml.evaluation.metrics import (
    compute_confusion_matrix_counts,
    predict_with_threshold,
    search_recall_optimized_threshold,
)
from ml.evaluation.report import (
    build_evaluation_report,
    evaluate_fitted_model,
    save_evaluation_report,
)
from ml.preprocessing.constants import DEFAULT_RAW_DATA_PATH
from ml.preprocessing.pipeline import Diabetes130Preprocessor, train_test_split_data
from ml.training.constants import LOGISTIC_REGRESSION_MODEL_ID, RANDOM_FOREST_MODEL_ID


def test_predict_with_threshold_bins_scores() -> None:
    scores = np.array([0.2, 0.5, 0.8])
    assert predict_with_threshold(scores, 0.5).tolist() == [0, 1, 1]


def test_confusion_matrix_counts_shape() -> None:
    y_true = np.array([0, 0, 1, 1])
    y_pred = np.array([0, 1, 1, 0])
    matrix = compute_confusion_matrix_counts(y_true, y_pred)
    assert matrix.true_negative == 1
    assert matrix.false_positive == 1
    assert matrix.false_negative == 1
    assert matrix.true_positive == 1


def test_search_recall_optimized_threshold_prefers_higher_recall() -> None:
    y_true = np.array([0, 0, 0, 0, 1, 1, 1, 1])
    y_score = np.array([0.9, 0.8, 0.3, 0.2, 0.7, 0.6, 0.4, 0.1])
    threshold, metrics = search_recall_optimized_threshold(y_true, y_score)
    assert threshold <= 0.5
    assert metrics.recall >= 0.5


def test_evaluate_fitted_model_returns_default_and_tuned_blocks(
    synthetic_training_frame: pd.DataFrame,
) -> None:
    x_train, x_test, y_train, y_test = train_test_split_data(synthetic_training_frame)
    preprocessor = Diabetes130Preprocessor().fit(x_train)
    x_train_t = preprocessor.transform(x_train)
    model = LogisticRegression(max_iter=500, random_state=42)
    model.fit(x_train_t, y_train)

    report = evaluate_fitted_model(
        model,
        preprocessor,
        x_test,
        y_test,
        model_id=LOGISTIC_REGRESSION_MODEL_ID,
    )
    assert report.default_threshold.threshold == 0.5
    assert 0.0 <= report.default_threshold.metrics.recall <= 1.0
    assert report.recall_optimized.metrics.recall >= report.default_threshold.metrics.recall


def test_save_evaluation_report_writes_json(
    synthetic_training_frame: pd.DataFrame,
    tmp_path: Path,
) -> None:
    report = build_evaluation_report(synthetic_training_frame)
    output = tmp_path / "evaluation_report.json"
    save_evaluation_report(report, output)
    payload = json.loads(output.read_text(encoding="utf-8"))
    assert "recommended_model" in payload
    assert LOGISTIC_REGRESSION_MODEL_ID in payload["models"]
    assert RANDOM_FOREST_MODEL_ID in payload["models"]
    assert "recall_optimized" in payload["models"][LOGISTIC_REGRESSION_MODEL_ID]


def test_build_evaluation_report_integration() -> None:
    if not DEFAULT_RAW_DATA_PATH.exists():
        pytest.skip("Raw dataset not downloaded")

    report = build_evaluation_report()
    assert report.targets["accuracy_min"] == TARGET_ACCURACY
    assert report.targets["primary_metric"] == "recall"
    assert len(report.models) == 2
    for model_report in report.models.values():
        assert "accuracy" in model_report.default_threshold.metrics.to_dict()
        assert model_report.recall_optimized.metrics.recall >= 0.0
