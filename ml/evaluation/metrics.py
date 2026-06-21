"""Classification metrics for offline model evaluation (T-205+, RIA-012)."""

from __future__ import annotations

from dataclasses import asdict, dataclass

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)

DEFAULT_THRESHOLD = 0.5


@dataclass(frozen=True)
class ClassificationMetrics:
    accuracy: float
    recall: float
    precision: float
    f1: float
    roc_auc: float

    def to_dict(self) -> dict[str, float]:
        return asdict(self)


@dataclass(frozen=True)
class ConfusionMatrixCounts:
    true_negative: int
    false_positive: int
    false_negative: int
    true_positive: int

    def to_dict(self) -> dict[str, int]:
        return asdict(self)


def predict_with_threshold(y_score: np.ndarray, threshold: float) -> np.ndarray:
    return (y_score >= threshold).astype(int)


def compute_confusion_matrix_counts(y_true, y_pred) -> ConfusionMatrixCounts:
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    return ConfusionMatrixCounts(
        true_negative=int(tn),
        false_positive=int(fp),
        false_negative=int(fn),
        true_positive=int(tp),
    )


def compute_classification_metrics(
    y_true,
    y_pred,
    y_score,
) -> ClassificationMetrics:
    """Compute standard binary classification metrics on the test split."""
    return ClassificationMetrics(
        accuracy=float(accuracy_score(y_true, y_pred)),
        recall=float(recall_score(y_true, y_pred, zero_division=0)),
        precision=float(precision_score(y_true, y_pred, zero_division=0)),
        f1=float(f1_score(y_true, y_pred, zero_division=0)),
        roc_auc=float(roc_auc_score(y_true, y_score)),
    )


def search_recall_optimized_threshold(
    y_true,
    y_score,
    *,
    thresholds: np.ndarray | None = None,
) -> tuple[float, ClassificationMetrics]:
    """Find the decision threshold that maximizes recall (tie-break: F1, then ROC proxy)."""
    if thresholds is None:
        thresholds = np.round(np.arange(0.10, 0.91, 0.05), 2)

    best_threshold = DEFAULT_THRESHOLD
    best_metrics = compute_classification_metrics(
        y_true,
        predict_with_threshold(y_score, best_threshold),
        y_score,
    )
    best_key = (best_metrics.recall, best_metrics.f1, best_metrics.accuracy)

    for threshold in thresholds:
        y_pred = predict_with_threshold(y_score, float(threshold))
        metrics = compute_classification_metrics(y_true, y_pred, y_score)
        candidate_key = (metrics.recall, metrics.f1, metrics.accuracy)
        if candidate_key > best_key:
            best_threshold = float(threshold)
            best_metrics = metrics
            best_key = candidate_key

    return best_threshold, best_metrics
