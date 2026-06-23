"""Clinical simulation logic — compare original vs simulated risk (T-303, T-309, UC-042–044)."""

from __future__ import annotations

import time
from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.ml_registry import MLRegistry
from repositories.prediction_repository import PredictionRepository
from repositories.simulation_repository import SimulationRepository
from schemas.simulation import SimulateRequest, SimulateResponse
from services.prediction_mapper import request_to_feature_frame
from services.simulation_mapper import (
    apply_simulation_modifications,
    build_simulation_summary,
    detect_simulation_changes,
    patient_input_to_predict_request,
)


class SimulationService:
    def __init__(self, db: Session, registry: MLRegistry) -> None:
        self.db = db
        self.registry = registry
        self.prediction_repository = PredictionRepository(db)
        self.simulation_repository = SimulationRepository(db)

    def simulate(self, user_id: UUID, request: SimulateRequest) -> SimulateResponse:
        """Recalculate risk with modified variables, persist, and compare (RF-042, UC-044)."""
        if not self.registry.is_ready or self.registry.explainer_service is None:
            detail = self.registry.load_error or "ML prediction service is unavailable"
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=detail,
            )

        prediction = self.prediction_repository.get_with_patient_input(request.prediction_id)
        if prediction is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prediction not found",
            )
        if prediction.patient_input is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient input not found for prediction",
            )

        baseline = patient_input_to_predict_request(prediction.patient_input)
        simulated_request = apply_simulation_modifications(baseline, request.modifications)
        changes = detect_simulation_changes(baseline, simulated_request)

        original_risk_percent = float(prediction.risk_score)
        original_risk_score = round(original_risk_percent / 100, 4)

        started = time.perf_counter()
        features = request_to_feature_frame(simulated_request)
        simulated_risk_score, simulated_risk_level = self.registry.explainer_service.predict_risk(
            features
        )
        elapsed_ms = int((time.perf_counter() - started) * 1000)

        simulated_risk_percent = round(simulated_risk_score * 100, 2)
        delta_risk_percent = round(simulated_risk_percent - original_risk_percent, 2)
        summary = build_simulation_summary(delta_risk_percent, changes)

        simulation = self.simulation_repository.create_with_details(
            prediction_id=prediction.id,
            user_id=user_id,
            original_risk_percent=Decimal(str(original_risk_percent)),
            simulated_risk_percent=Decimal(str(simulated_risk_percent)),
            delta_risk_percent=Decimal(str(delta_risk_percent)),
            simulation_summary=summary,
            input_rows=[
                {
                    "feature_name": change.feature_name,
                    "original_value": change.original_value,
                    "simulated_value": change.simulated_value,
                }
                for change in changes
            ],
        )

        return SimulateResponse(
            id=simulation.id,
            prediction_id=prediction.id,
            original_risk_score=original_risk_score,
            original_risk_percent=original_risk_percent,
            original_risk_level=prediction.risk_level,  # type: ignore[arg-type]
            simulated_risk_score=simulated_risk_score,
            simulated_risk_percent=simulated_risk_percent,
            simulated_risk_level=simulated_risk_level,  # type: ignore[arg-type]
            delta_risk_percent=delta_risk_percent,
            simulation_summary=summary,
            changes=changes,
            simulation_time_ms=elapsed_ms,
            model_version=prediction.model_version,
            created_at=simulation.created_at,
        )
