"""Ephemeral demo inference — real ML, no database persistence (public playground)."""

from __future__ import annotations

import time
from datetime import UTC, datetime
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.api_errors import ML_SERVICE_UNAVAILABLE
from core.ml_registry import MLRegistry
from schemas.demo import DemoSimulateRequest
from schemas.prediction import PredictRequest, PredictResponse, ShapExplanationItem
from schemas.simulation import SimulateResponse
from services.prediction_mapper import request_to_feature_frame
from services.risk_classification import classify_risk_level
from services.simulation_mapper import (
    apply_simulation_modifications,
    build_simulation_summary,
    detect_simulation_changes,
)
from services.system_settings_service import SystemSettingsService

_SHAP_DIRECTION_TO_IMPACT = {
    "increases_risk": "positive",
    "decreases_risk": "negative",
}


class DemoService:
    """Run predict/simulate for anonymous demo users without persisting records."""

    def __init__(self, db: Session, registry: MLRegistry) -> None:
        self.db = db
        self.registry = registry

    def _ensure_ml_ready(self) -> None:
        if not self.registry.is_ready or self.registry.explainer_service is None:
            detail = self.registry.load_error or ML_SERVICE_UNAVAILABLE
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=detail,
            )

    def _thresholds(self) -> tuple[float, float]:
        return SystemSettingsService(self.db).get_risk_thresholds()

    def predict(self, request: PredictRequest) -> PredictResponse:
        self._ensure_ml_ready()
        high_threshold, medium_threshold = self._thresholds()

        started = time.perf_counter()
        features = request_to_feature_frame(request)
        result = self.registry.explainer_service.explain(features, top_n=10)
        risk_level = classify_risk_level(
            result.risk_score,
            high_threshold=high_threshold,
            medium_threshold=medium_threshold,
        )
        elapsed_ms = int((time.perf_counter() - started) * 1000)

        risk_percent = round(result.risk_score * 100, 2)
        confidence = round(max(result.risk_score, 1 - result.risk_score), 4)

        shap_items: list[ShapExplanationItem] = []
        for contribution in result.contributions:
            impact = _SHAP_DIRECTION_TO_IMPACT.get(contribution.direction, "positive")
            shap_items.append(
                ShapExplanationItem(
                    feature_name=contribution.feature_name,
                    feature_value=contribution.feature_value,
                    shap_value=contribution.shap_value,
                    importance_rank=contribution.importance_rank,
                    direction=contribution.direction,
                    impact_direction=impact,  # type: ignore[arg-type]
                )
            )

        return PredictResponse(
            id=uuid4(),
            risk_score=result.risk_score,
            risk_percent=risk_percent,
            risk_level=risk_level,  # type: ignore[arg-type]
            confidence_score=confidence,
            summary=result.summary,
            model_version=result.model_version,
            prediction_time_ms=elapsed_ms,
            shap_explanations=shap_items,
            created_at=datetime.now(UTC),
        )

    def simulate(self, request: DemoSimulateRequest) -> SimulateResponse:
        self._ensure_ml_ready()
        high_threshold, medium_threshold = self._thresholds()

        baseline = request.baseline
        simulated_request = apply_simulation_modifications(baseline, request.modifications)
        changes = detect_simulation_changes(baseline, simulated_request)

        started = time.perf_counter()
        baseline_features = request_to_feature_frame(baseline)
        original_risk_score, _ = self.registry.explainer_service.predict_risk(baseline_features)
        original_risk_level = classify_risk_level(
            original_risk_score,
            high_threshold=high_threshold,
            medium_threshold=medium_threshold,
        )
        original_risk_percent = round(original_risk_score * 100, 2)

        simulated_features = request_to_feature_frame(simulated_request)
        simulated_risk_score, _ = self.registry.explainer_service.predict_risk(simulated_features)
        simulated_risk_level = classify_risk_level(
            simulated_risk_score,
            high_threshold=high_threshold,
            medium_threshold=medium_threshold,
        )
        elapsed_ms = int((time.perf_counter() - started) * 1000)

        simulated_risk_percent = round(simulated_risk_score * 100, 2)
        delta_risk_percent = round(simulated_risk_percent - original_risk_percent, 2)
        summary = build_simulation_summary(delta_risk_percent, changes)

        manifest = self.registry.manifest or {}
        model_version = str(manifest.get("model_version", "unknown"))

        return SimulateResponse(
            id=uuid4(),
            prediction_id=uuid4(),
            original_risk_score=original_risk_score,
            original_risk_percent=original_risk_percent,
            original_risk_level=original_risk_level,  # type: ignore[arg-type]
            simulated_risk_score=simulated_risk_score,
            simulated_risk_percent=simulated_risk_percent,
            simulated_risk_level=simulated_risk_level,  # type: ignore[arg-type]
            delta_risk_percent=delta_risk_percent,
            simulation_summary=summary,
            changes=changes,
            simulation_time_ms=elapsed_ms,
            model_version=model_version,
            created_at=datetime.now(UTC),
        )
