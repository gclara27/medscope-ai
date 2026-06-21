"""Evaluation package — offline model metrics."""

from ml.evaluation.compare import BaselineComparison, compare_baselines, save_baseline_comparison
from ml.evaluation.constants import EVALUATION_REPORT_PATH, PRIMARY_METRIC, TARGET_ACCURACY
from ml.evaluation.metrics import (
    ClassificationMetrics,
    ConfusionMatrixCounts,
    compute_classification_metrics,
    compute_confusion_matrix_counts,
    predict_with_threshold,
    search_recall_optimized_threshold,
)
from ml.evaluation.report import (
    EvaluationReport,
    ModelEvaluationReport,
    build_evaluation_report,
    evaluate_fitted_model,
    save_evaluation_report,
)
from ml.evaluation.selection import (
    FinalModelSelection,
    promote_final_model_artifacts,
    run_final_model_selection,
    save_final_model_selection,
    select_final_model,
)

__all__ = [
    "BaselineComparison",
    "ClassificationMetrics",
    "ConfusionMatrixCounts",
    "EVALUATION_REPORT_PATH",
    "EvaluationReport",
    "ModelEvaluationReport",
    "PRIMARY_METRIC",
    "TARGET_ACCURACY",
    "build_evaluation_report",
    "compare_baselines",
    "compute_classification_metrics",
    "compute_confusion_matrix_counts",
    "evaluate_fitted_model",
    "FinalModelSelection",
    "predict_with_threshold",
    "promote_final_model_artifacts",
    "run_final_model_selection",
    "save_baseline_comparison",
    "save_evaluation_report",
    "save_final_model_selection",
    "search_recall_optimized_threshold",
    "select_final_model",
]
