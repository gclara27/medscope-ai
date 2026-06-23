"""Formal model evaluation reports (T-207, RIA-012, UC-111)."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import pandas as pd

from ml.evaluation.compare import compare_baselines, select_baseline_winner
from ml.evaluation.constants import (
    DEFAULT_THRESHOLD,
    EVALUATION_REPORT_PATH,
    PRIMARY_METRIC,
    TARGET_ACCURACY,
)
from ml.evaluation.metrics import (
    ClassificationMetrics,
    ConfusionMatrixCounts,
    compute_classification_metrics,
    compute_confusion_matrix_counts,
    predict_with_threshold,
    search_recall_optimized_threshold,
)
from ml.preprocessing.constants import RANDOM_STATE, TEST_SIZE
from ml.preprocessing.pipeline import train_test_split_data
from ml.training.constants import (
    LOGISTIC_REGRESSION_MODEL_ID,
    LOGISTIC_REGRESSION_MODEL_PATH,
    RANDOM_FOREST_MODEL_ID,
    RANDOM_FOREST_MODEL_PATH,
)


@dataclass(frozen=True)
class ThresholdEvaluation:
    threshold: float
    metrics: ClassificationMetrics
    confusion_matrix: ConfusionMatrixCounts
    meets_accuracy_target: bool

    def to_dict(self) -> dict[str, Any]:
        return {
            "threshold": self.threshold,
            "metrics": self.metrics.to_dict(),
            "confusion_matrix": self.confusion_matrix.to_dict(),
            "meets_accuracy_target": self.meets_accuracy_target,
        }


@dataclass(frozen=True)
class ModelEvaluationReport:
    model_id: str
    default_threshold: ThresholdEvaluation
    recall_optimized: ThresholdEvaluation

    def to_dict(self) -> dict[str, Any]:
        return {
            "model_id": self.model_id,
            "default_threshold": self.default_threshold.to_dict(),
            "recall_optimized": self.recall_optimized.to_dict(),
        }


@dataclass(frozen=True)
class EvaluationReport:
    targets: dict[str, Any]
    split: dict[str, Any]
    models: dict[str, ModelEvaluationReport]
    recommended_model: str
    recommendation_reason: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "targets": self.targets,
            "split": self.split,
            "models": {key: value.to_dict() for key, value in self.models.items()},
            "recommended_model": self.recommended_model,
            "recommendation_reason": self.recommendation_reason,
        }


def _evaluate_at_threshold(y_true, y_score: Any, threshold: float) -> ThresholdEvaluation:
    y_pred = predict_with_threshold(y_score, threshold)
    metrics = compute_classification_metrics(y_true, y_pred, y_score)
    return ThresholdEvaluation(
        threshold=threshold,
        metrics=metrics,
        confusion_matrix=compute_confusion_matrix_counts(y_true, y_pred),
        meets_accuracy_target=metrics.accuracy >= TARGET_ACCURACY,
    )


def evaluate_fitted_model(
    model: Any,
    preprocessor: Any,
    x_test: pd.DataFrame,
    y_test: pd.Series,
    *,
    model_id: str,
) -> ModelEvaluationReport:
    """Evaluate a fitted model on the held-out test split."""
    x_test_transformed = preprocessor.transform(x_test)
    y_score = model.predict_proba(x_test_transformed)[:, 1]

    default_evaluation = _evaluate_at_threshold(y_test, y_score, DEFAULT_THRESHOLD)
    optimal_threshold, _ = search_recall_optimized_threshold(y_test, y_score)
    recall_optimized = _evaluate_at_threshold(y_test, y_score, optimal_threshold)

    return ModelEvaluationReport(
        model_id=model_id,
        default_threshold=default_evaluation,
        recall_optimized=recall_optimized,
    )


def evaluate_saved_model(
    *,
    model_path: Path,
    preprocessor_path: Path,
    model_id: str,
    frame: pd.DataFrame | None = None,
) -> ModelEvaluationReport:
    from ml.training.artifacts import load_model_artifacts

    model, preprocessor = load_model_artifacts(
        model_path=model_path,
        preprocessor_path=preprocessor_path,
    )
    _, x_test, _, y_test = train_test_split_data(frame)
    return evaluate_fitted_model(model, preprocessor, x_test, y_test, model_id=model_id)


def build_evaluation_report(frame: pd.DataFrame | None = None) -> EvaluationReport:
    """Evaluate both baseline models on the same reproducible test split."""
    if LOGISTIC_REGRESSION_MODEL_PATH.exists() and RANDOM_FOREST_MODEL_PATH.exists():
        logistic_report = evaluate_saved_model(
            model_path=LOGISTIC_REGRESSION_MODEL_PATH,
            preprocessor_path=LOGISTIC_REGRESSION_MODEL_PATH.parent / "preprocessor.pkl",
            model_id=LOGISTIC_REGRESSION_MODEL_ID,
            frame=frame,
        )
        random_forest_report = evaluate_saved_model(
            model_path=RANDOM_FOREST_MODEL_PATH,
            preprocessor_path=RANDOM_FOREST_MODEL_PATH.parent / "preprocessor.pkl",
            model_id=RANDOM_FOREST_MODEL_ID,
            frame=frame,
        )
    else:
        from ml.training.logistic_regression import train_logistic_regression
        from ml.training.random_forest import train_random_forest

        _, x_test, _, y_test = train_test_split_data(frame)
        logistic_artifacts = train_logistic_regression(frame, save=False)
        random_forest_artifacts = train_random_forest(frame, save=False)
        logistic_report = evaluate_fitted_model(
            logistic_artifacts.model,
            logistic_artifacts.preprocessor,
            x_test,
            y_test,
            model_id=LOGISTIC_REGRESSION_MODEL_ID,
        )
        random_forest_report = evaluate_fitted_model(
            random_forest_artifacts.model,
            random_forest_artifacts.preprocessor,
            x_test,
            y_test,
            model_id=RANDOM_FOREST_MODEL_ID,
        )

    models = {
        LOGISTIC_REGRESSION_MODEL_ID: logistic_report,
        RANDOM_FOREST_MODEL_ID: random_forest_report,
    }

    comparison = compare_baselines(
        logistic_report.recall_optimized.metrics,
        random_forest_report.recall_optimized.metrics,
        primary_metric=PRIMARY_METRIC,
    )
    recommended = select_baseline_winner(
        logistic_report.recall_optimized.metrics,
        random_forest_report.recall_optimized.metrics,
        primary_metric=PRIMARY_METRIC,
    )
    accuracy_notes = []
    for model_id, report in models.items():
        if report.recall_optimized.meets_accuracy_target:
            accuracy_notes.append(f"{model_id} meets accuracy target with tuned threshold.")
        elif report.default_threshold.meets_accuracy_target:
            accuracy_notes.append(f"{model_id} meets accuracy target at threshold 0.5.")

    reason = comparison.summary
    if accuracy_notes:
        reason = f"{reason} {' '.join(accuracy_notes)}"
    else:
        reason = (
            f"{comparison.summary} Neither model reaches accuracy >= {TARGET_ACCURACY:.0%} "
            "with recall-optimized thresholds; further tuning required in T-208."
        )

    return EvaluationReport(
        targets={
            "accuracy_min": TARGET_ACCURACY,
            "primary_metric": PRIMARY_METRIC,
        },
        split={
            "random_state": RANDOM_STATE,
            "test_size": TEST_SIZE,
            "stratified": True,
        },
        models=models,
        recommended_model=recommended,
        recommendation_reason=reason,
    )


def save_evaluation_report(
    report: EvaluationReport,
    path: Path = EVALUATION_REPORT_PATH,
) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report.to_dict(), indent=2), encoding="utf-8")
