"""Prediction, patient input, and SHAP persistence (T-113+)."""

from sqlalchemy.orm import Session


class PredictionRepository:
    def __init__(self, db: Session) -> None:
        self.db = db
