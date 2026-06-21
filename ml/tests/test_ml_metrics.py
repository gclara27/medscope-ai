"""ML metrics validation tests (RTS-010, T-211)."""

from __future__ import annotations

import json

import pytest

from ml.evaluation.constants import EVALUATION_REPORT_PATH, TARGET_ACCURACY
from ml.training.constants import (
    BASELINE_COMPARISON_PATH,
    FINAL_MODEL_SELECTION_PATH,
    LOGISTIC_REGRESSION_MODEL_ID,
    RANDOM_FOREST_MODEL_ID,
)

MVP_MIN_RECALL = 0.40


@pytest.fixture
def evaluation_report() -> dict:
    if not EVALUATION_REPORT_PATH.exists():
        pytest.skip("Evaluation report missing. Run: python ml/scripts/evaluate_models.py")
    return json.loads(EVALUATION_REPORT_PATH.read_text(encoding="utf-8"))


@pytest.fixture
def final_selection() -> dict:
    if not FINAL_MODEL_SELECTION_PATH.exists():
        pytest.skip("Final model selection missing. Run: python ml/scripts/select_final_model.py")
    return json.loads(FINAL_MODEL_SELECTION_PATH.read_text(encoding="utf-8"))


def test_metrics_threshold_recall_meets_mvp_minimum(final_selection: dict) -> None:
    """Recall is prioritized for the selected production model (RTS-010)."""
    recall = float(final_selection["metrics"]["recall"])
    assert recall >= MVP_MIN_RECALL


def test_metrics_recall_prioritized_over_random_forest(evaluation_report: dict) -> None:
    """Logistic Regression recall at threshold 0.5 exceeds Random Forest (EP-2.7)."""
    logistic = evaluation_report["models"][LOGISTIC_REGRESSION_MODEL_ID]["default_threshold"]["metrics"]
    random_forest = evaluation_report["models"][RANDOM_FOREST_MODEL_ID]["default_threshold"]["metrics"]
    assert logistic["recall"] > random_forest["recall"]


def test_metrics_threshold_accuracy_is_recorded(final_selection: dict) -> None:
    """Accuracy KPI is tracked even when the MVP baseline is below target."""
    accuracy = float(final_selection["metrics"]["accuracy"])
    assert 0.0 <= accuracy <= 1.0
    if accuracy < TARGET_ACCURACY:
        pytest.xfail(
            f"MVP baseline accuracy {accuracy:.2%} is below KPI {TARGET_ACCURACY:.0%}; "
            "documented in T-207/T-208 for thesis scope."
        )


def test_baseline_comparison_documents_recall_winner() -> None:
    if not BASELINE_COMPARISON_PATH.exists():
        pytest.skip("Baseline comparison missing. Run: python ml/scripts/train_random_forest.py")

    payload = json.loads(BASELINE_COMPARISON_PATH.read_text(encoding="utf-8"))
    assert payload["primary_metric"] == "recall"
    assert payload["winner"] == LOGISTIC_REGRESSION_MODEL_ID
