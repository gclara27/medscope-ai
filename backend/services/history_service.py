"""Prediction history queries (T-306, UC-050–051)."""

from __future__ import annotations

from datetime import date
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.prediction import Prediction
from repositories.history_repository import HistoryRepository
from schemas.history import (
    HistoryListItem,
    HistoryListResponse,
    HistoryPatientSummary,
    HistoryUserSummary,
)
from schemas.prediction import RiskLevel
from services.risk_format import api_risk_from_stored_percent


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
    ) -> HistoryListResponse:
        if date_from and date_to and date_from > date_to:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="date_from must be on or before date_to",
            )

        predictions, total = self.repository.list_predictions(
            risk_level=risk_level,
            user_id=user_id,
            date_from=date_from,
            date_to=date_to,
            limit=limit,
            offset=offset,
        )

        return HistoryListResponse(
            items=[self._to_list_item(prediction) for prediction in predictions],
            total=total,
            limit=limit,
            offset=offset,
        )

    def _to_list_item(self, prediction: Prediction) -> HistoryListItem:
        risk_score, risk_percent = api_risk_from_stored_percent(prediction.risk_score)
        confidence = float(prediction.confidence_score) if prediction.confidence_score is not None else None
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
