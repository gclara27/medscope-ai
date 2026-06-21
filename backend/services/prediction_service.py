"""Prediction pipeline — preprocess, infer, SHAP, persist (T-302, UC-083)."""

from __future__ import annotations

import time
from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.ml_registry import MLRegistry
from repositories.prediction_repository import PredictionRepository
from schemas.prediction import PredictRequest, PredictResponse, ShapExplanationItem
from services.prediction_mapper import request_to_feature_frame, request_to_patient_input_fields

_SHAP_DIRECTION_TO_IMPACT = {
    "increases_risk": "positive",
    "decreases_risk": "negative",
}


class PredictionService:
    def __init__(self, db: Session, registry: MLRegistry) -> None:
        self.db = db
        self.registry = registry
        self.repository = PredictionRepository(db)

    def predict(self, user_id: UUID, request: PredictRequest) -> PredictResponse:
        if not self.registry.is_ready or self.registry.explainer_service is None:
            detail = self.registry.load_error or "ML prediction service is unavailable"
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=detail,
            )

        started = time.perf_counter()
        features = request_to_feature_frame(request)
        result = self.registry.explainer_service.explain(features, top_n=10)
        elapsed_ms = int((time.perf_counter() - started) * 1000)

        risk_percent = Decimal(str(round(result.risk_score * 100, 2)))
        confidence = Decimal(str(round(max(result.risk_score, 1 - result.risk_score), 4)))

        shap_rows: list[dict] = []
        shap_items: list[ShapExplanationItem] = []
        for contribution in result.contributions:
            impact = _SHAP_DIRECTION_TO_IMPACT.get(contribution.direction, "positive")
            shap_rows.append(
                {
                    "feature_name": contribution.feature_name,
                    "feature_value": str(contribution.feature_value),
                    "shap_value": Decimal(str(round(contribution.shap_value, 5))),
                    "direction": contribution.direction,
                    "impact_direction": impact,
                    "importance_rank": contribution.importance_rank,
                }
            )
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

        prediction = self.repository.create_with_details(
            user_id=user_id,
            risk_score_percent=risk_percent,
            risk_level=result.risk_level,
            confidence_score=confidence,
            summary=result.summary,
            model_version=result.model_version,
            prediction_time_ms=elapsed_ms,
            patient_input_fields=request_to_patient_input_fields(request),
            shap_rows=shap_rows,
        )

        return PredictResponse(
            id=prediction.id,
            risk_score=result.risk_score,
            risk_percent=float(risk_percent),
            risk_level=result.risk_level,  # type: ignore[arg-type]
            confidence_score=float(confidence),
            summary=result.summary,
            model_version=result.model_version,
            prediction_time_ms=elapsed_ms,
            shap_explanations=shap_items,
            created_at=prediction.created_at,
        )
