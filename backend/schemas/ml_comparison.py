"""ML model comparison response schemas — RF-076, RF-077, T-X07-03."""

from __future__ import annotations

from pydantic import BaseModel, Field

from services.ml_comparison_service import (
    ModelComparisonItem as ServiceModelComparisonItem,
    ModelComparisonResult,
    ModelMetricsSnapshot as ServiceModelMetricsSnapshot,
)


class ModelMetricsSnapshot(BaseModel):
    """Offline evaluation metrics for a single model candidate."""

    accuracy: float = Field(ge=0.0, le=1.0)
    recall: float = Field(ge=0.0, le=1.0)
    precision: float = Field(ge=0.0, le=1.0)
    f1: float = Field(ge=0.0, le=1.0)
    roc_auc: float = Field(ge=0.0, le=1.0)


class ModelComparisonItem(BaseModel):
    """Single model row in the offline comparison table."""

    model_id: str
    display_name: str
    version: str | None = None
    is_production: bool
    metrics: ModelMetricsSnapshot | None = None
    available: bool


class ModelComparisonResponse(BaseModel):
    """Offline ML model comparison payload (UC-084, RBE-017)."""

    is_available: bool
    primary_metric: str
    recall_winner: str | None = None
    baseline_winner: str | None = None
    production_model_id: str | None = None
    production_model_version: str | None = None
    summary: str | None = None
    rationale: list[str] = Field(default_factory=list)
    offline_note: str
    missing_artifacts: list[str] = Field(default_factory=list)
    models: list[ModelComparisonItem]


def _metrics_from_service(
    metrics: ServiceModelMetricsSnapshot | None,
) -> ModelMetricsSnapshot | None:
    if metrics is None:
        return None
    return ModelMetricsSnapshot(
        accuracy=metrics.accuracy,
        recall=metrics.recall,
        precision=metrics.precision,
        f1=metrics.f1,
        roc_auc=metrics.roc_auc,
    )


def _item_from_service(item: ServiceModelComparisonItem) -> ModelComparisonItem:
    return ModelComparisonItem(
        model_id=item.model_id,
        display_name=item.display_name,
        version=item.version,
        is_production=item.is_production,
        metrics=_metrics_from_service(item.metrics),
        available=item.available,
    )


def model_comparison_response_from_result(result: ModelComparisonResult) -> ModelComparisonResponse:
    """Map service dataclasses to API response (T-X07-02)."""
    return ModelComparisonResponse(
        is_available=result.is_available,
        primary_metric=result.primary_metric,
        recall_winner=result.recall_winner,
        baseline_winner=result.baseline_winner,
        production_model_id=result.production_model_id,
        production_model_version=result.production_model_version,
        summary=result.summary,
        rationale=list(result.rationale),
        offline_note=result.offline_note,
        missing_artifacts=list(result.missing_artifacts),
        models=[_item_from_service(item) for item in result.models],
    )
