"""Prediction, patient input, and SHAP persistence (T-113, T-308)."""

from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from models.patient_input import PatientInput
from models.prediction import Prediction
from models.shap_explanation import ShapExplanation


class PredictionRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_with_patient_input(self, prediction_id: UUID) -> Prediction | None:
        """Load a prediction with its patient_inputs row (UC-040)."""
        return self.db.scalar(
            select(Prediction)
            .options(joinedload(Prediction.patient_input))
            .where(Prediction.id == prediction_id)
        )

    def create_with_details(
        self,
        *,
        user_id: UUID,
        risk_score_percent: Decimal,
        risk_level: str,
        confidence_score: Decimal | None,
        summary: str | None,
        model_version: str,
        prediction_time_ms: int,
        patient_input_fields: dict,
        shap_rows: list[dict],
    ) -> Prediction:
        """Persist prediction + patient_inputs + shap_explanations atomically (UC-023)."""
        try:
            prediction = Prediction(
                user_id=user_id,
                risk_score=risk_score_percent,
                risk_level=risk_level,
                confidence_score=confidence_score,
                summary=summary,
                model_version=model_version,
                prediction_time_ms=prediction_time_ms,
            )
            self.db.add(prediction)
            self.db.flush()

            patient_input = PatientInput(
                prediction_id=prediction.id,
                **patient_input_fields,
            )
            self.db.add(patient_input)

            for row in shap_rows:
                self.db.add(
                    ShapExplanation(
                        prediction_id=prediction.id,
                        **row,
                    )
                )

            self.db.commit()
            self.db.refresh(prediction)
            return prediction
        except Exception:
            self.db.rollback()
            raise
