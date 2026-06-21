"""Final model selection tests (T-208, EP-2.8)."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from ml.evaluation.metrics import ClassificationMetrics, ConfusionMatrixCounts
from ml.evaluation.report import EvaluationReport, ModelEvaluationReport, ThresholdEvaluation
from ml.evaluation.selection import (
    promote_final_model_artifacts,
    run_final_model_selection,
    select_final_model,
)
from ml.training.constants import (
    FINAL_MODEL_DIR,
    LOGISTIC_REGRESSION_MODEL_ID,
    LOGISTIC_REGRESSION_MODEL_PATH,
    RANDOM_FOREST_MODEL_ID,
)


def _threshold_evaluation(
    *,
    accuracy: float,
    recall: float,
    precision: float = 0.1,
    f1: float = 0.2,
    roc_auc: float = 0.6,
    threshold: float = 0.5,
    meets_accuracy_target: bool = False,
) -> ThresholdEvaluation:
    return ThresholdEvaluation(
        threshold=threshold,
        metrics=ClassificationMetrics(
            accuracy=accuracy,
            recall=recall,
            precision=precision,
            f1=f1,
            roc_auc=roc_auc,
        ),
        confusion_matrix=ConfusionMatrixCounts(10, 5, 4, 6),
        meets_accuracy_target=meets_accuracy_target,
    )


def _sample_report(
    *,
    logistic_recall: float = 0.54,
    random_forest_recall: float = 0.20,
    random_forest_accuracy: float = 0.82,
) -> EvaluationReport:
    return EvaluationReport(
        targets={"accuracy_min": 0.75, "primary_metric": "recall"},
        split={"random_state": 42, "test_size": 0.2, "stratified": True},
        models={
            LOGISTIC_REGRESSION_MODEL_ID: ModelEvaluationReport(
                model_id=LOGISTIC_REGRESSION_MODEL_ID,
                default_threshold=_threshold_evaluation(recall=logistic_recall, accuracy=0.61),
                recall_optimized=_threshold_evaluation(
                    recall=1.0,
                    accuracy=0.09,
                    threshold=0.3,
                ),
            ),
            RANDOM_FOREST_MODEL_ID: ModelEvaluationReport(
                model_id=RANDOM_FOREST_MODEL_ID,
                default_threshold=_threshold_evaluation(
                    recall=random_forest_recall,
                    accuracy=random_forest_accuracy,
                    meets_accuracy_target=True,
                ),
                recall_optimized=_threshold_evaluation(
                    recall=1.0,
                    accuracy=0.09,
                    threshold=0.1,
                ),
            ),
        },
        recommended_model=LOGISTIC_REGRESSION_MODEL_ID,
        recommendation_reason="sample",
    )


def test_select_final_model_prefers_logistic_regression_for_recall() -> None:
    selection = select_final_model(_sample_report())
    assert selection.model_id == LOGISTIC_REGRESSION_MODEL_ID
    assert selection.production_threshold == 0.5
    assert selection.shap_explainer == "linear"
    assert RANDOM_FOREST_MODEL_ID in selection.rejected_models


def test_select_final_model_can_pick_random_forest_when_recall_higher() -> None:
    selection = select_final_model(
        _sample_report(logistic_recall=0.30, random_forest_recall=0.65)
    )
    assert selection.model_id == RANDOM_FOREST_MODEL_ID
    assert selection.shap_explainer == "tree"


def test_run_final_model_selection_writes_json(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    selection_path = tmp_path / "final_model_selection.json"
    final_dir = tmp_path / "final"

    monkeypatch.setattr("ml.evaluation.selection.FINAL_MODEL_SELECTION_PATH", selection_path)
    monkeypatch.setattr("ml.evaluation.selection.FINAL_MODEL_DIR", final_dir)

    if not LOGISTIC_REGRESSION_MODEL_PATH.exists():
        pytest.skip("Trained logistic regression artifacts not available")

    selection = run_final_model_selection(_sample_report(), promote_artifacts=False)
    payload = json.loads(selection_path.read_text(encoding="utf-8"))
    assert payload["model_id"] == LOGISTIC_REGRESSION_MODEL_ID
    assert "rationale" in payload
    assert selection.metrics.recall == pytest.approx(0.54)


def test_promote_final_model_artifacts_copies_files(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    if not LOGISTIC_REGRESSION_MODEL_PATH.exists():
        pytest.skip("Trained logistic regression artifacts not available")

    final_dir = tmp_path / "final"
    monkeypatch.setattr("ml.evaluation.selection.FINAL_MODEL_DIR", final_dir)

    selection = select_final_model(_sample_report())
    promote_final_model_artifacts(selection)

    assert (final_dir / "model.pkl").exists()
    assert (final_dir / "preprocessor.pkl").exists()
