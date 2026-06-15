"""Analytics aggregations over predictions (T-306+)."""

from sqlalchemy.orm import Session


class AnalyticsService:
    def __init__(self, db: Session) -> None:
        self.db = db
