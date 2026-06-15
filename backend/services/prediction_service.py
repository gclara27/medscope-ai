"""Prediction pipeline — preprocess, infer, SHAP (T-302+)."""

from sqlalchemy.orm import Session


class PredictionService:
    def __init__(self, db: Session) -> None:
        self.db = db
