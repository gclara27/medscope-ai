"""Prediction history queries (T-305+)."""

from sqlalchemy.orm import Session


class HistoryService:
    def __init__(self, db: Session) -> None:
        self.db = db
