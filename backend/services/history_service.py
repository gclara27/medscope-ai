"""Prediction history queries (T-306, UC-050–051)."""

from __future__ import annotations

from datetime import date
from uuid import UUID

from fastapi import HTTPException, status

from core.api_errors import DATE_RANGE_INVALID, PREDICTION_INPUTS_NOT_FOUND, PREDICTION_NOT_FOUND
from sqlalchemy.orm import Session

from models.prediction import Prediction
from models.shap_explanation import ShapExplanation
from repositories.history_repository import HistoryRepository
from schemas.history import (
    HistoryDetailResponse,
    HistoryListItem,
    HistoryListResponse,
    HistoryPatientDetail,
    HistoryPatientSummary,
    HistorySimulationItem,
    HistoryUserSummary,
)
from schemas.prediction import PredictRequest, RiskLevel, ShapExplanationItem
from services.risk_format import api_risk_from_stored_percent
from services.simulation_mapper import patient_input_to_predict_request


class HistoryService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repository = HistoryRepository(db)

    def list_history(
        self,
        *,
        risk_level: RiskLevel | None = None,
        user_id: UUID | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
        limit: int = 50,
        offset: int = 0,
        include_total: bool = True,
    ) -> HistoryListResponse:
        if date_from and date_to and date_from > date_to:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=DATE_RANGE_INVALID,
            )

        predictions, total = self.repository.list_predictions(
            risk_level=risk_level,
            user_id=user_id,
            date_from=date_from,
            date_to=date_to,
            limit=limit,
            offset=offset,
            include_total=include_total,
        )

        return HistoryListResponse(
            items=[self._to_list_item(prediction) for prediction in predictions],
            total=total,
            limit=limit,
            offset=offset,
        )

    def get_prediction_detail(self, prediction_id: UUID) -> HistoryDetailResponse:
        prediction = self.repository.get_prediction_detail(prediction_id)
        if prediction is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=PREDICTION_NOT_FOUND,
            )

        patient = prediction.patient_input
        if patient is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=PREDICTION_INPUTS_NOT_FOUND,
            )

        risk_score, risk_percent = api_risk_from_stored_percent(prediction.risk_score)
        confidence = self._confidence_as_fraction(prediction.confidence_score)
        shap_items = [
            self._to_shap_item(row)
            for row in sorted(
                prediction.shap_explanations,
                key=lambda item: item.importance_rank or 0,
            )
        ]
        simulations = [
            self._to_simulation_item(simulation)
            for simulation in sorted(
                prediction.simulations,
                key=lambda item: item.created_at,
                reverse=True,
            )
        ]

        return HistoryDetailResponse(
            id=prediction.id,
            risk_score=risk_score,
            risk_percent=risk_percent,
            risk_level=prediction.risk_level,  # type: ignore[arg-type]
            confidence_score=confidence,
            summary=prediction.summary,
            model_version=prediction.model_version,
            prediction_time_ms=prediction.prediction_time_ms,
            created_at=prediction.created_at,
            user=HistoryUserSummary(
                id=prediction.user.id,
                email=prediction.user.email,
                first_name=prediction.user.first_name,
                last_name=prediction.user.last_name,
                role=prediction.user.role.name,
            ),
            patient_input=self._to_patient_detail(patient),
            baseline_request=patient_input_to_predict_request(patient),
            shap_explanations=shap_items,
            simulations=simulations,
        )

    def _confidence_as_fraction(self, value) -> float | None:
        if value is None:
            return None
        confidence = float(value)
        return confidence / 100 if confidence > 1 else confidence

    def _to_patient_detail(self, patient) -> HistoryPatientDetail:
        return HistoryPatientDetail(
            age=patient.age,
            gender=patient.gender,
            glucose=float(patient.glucose) if patient.glucose is not None else None,
            blood_pressure=float(patient.blood_pressure) if patient.blood_pressure is not None else None,
            medications_count=patient.medications_count,
            previous_admissions=patient.previous_admissions,
            hospital_stay_days=patient.hospital_stay_days,
            bmi=float(patient.bmi) if patient.bmi is not None else None,
        )

    def _to_shap_item(self, row: ShapExplanation) -> ShapExplanationItem:
        return ShapExplanationItem(
            feature_name=row.feature_name,
            feature_value=row.feature_value,
            shap_value=float(row.shap_value),
            importance_rank=row.importance_rank or 0,
            direction=row.direction or "",
            impact_direction=row.impact_direction or "positive",  # type: ignore[arg-type]
        )

    def _to_simulation_item(self, simulation) -> HistorySimulationItem:
        original = float(simulation.original_risk)
        simulated = float(simulation.simulated_risk)
        return HistorySimulationItem(
            id=simulation.id,
            created_at=simulation.created_at,
            original_risk_percent=original,
            simulated_risk_percent=simulated,
            delta_risk_percent=float(simulation.delta_risk),
            simulation_summary=simulation.simulation_summary,
        )

    def _to_list_item(self, prediction: Prediction) -> HistoryListItem:
        risk_score, risk_percent = api_risk_from_stored_percent(prediction.risk_score)
        confidence = self._confidence_as_fraction(prediction.confidence_score)
        patient = prediction.patient_input
        patient_summary = (
            HistoryPatientSummary(
                age=patient.age,
                gender=patient.gender,
                glucose=float(patient.glucose) if patient.glucose is not None else None,
                hospital_stay_days=patient.hospital_stay_days,
            )
            if patient is not None
            else None
        )

        return HistoryListItem(
            id=prediction.id,
            risk_score=risk_score,
            risk_percent=risk_percent,
            risk_level=prediction.risk_level,  # type: ignore[arg-type]
            confidence_score=confidence,
            summary=prediction.summary,
            model_version=prediction.model_version,
            prediction_time_ms=prediction.prediction_time_ms,
            created_at=prediction.created_at,
            user=HistoryUserSummary(
                id=prediction.user.id,
                email=prediction.user.email,
                first_name=prediction.user.first_name,
                last_name=prediction.user.last_name,
                role=prediction.user.role.name,
            ),
            patient_input=patient_summary,
        )
