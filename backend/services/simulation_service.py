"""Clinical simulation logic (T-303+)."""

from sqlalchemy.orm import Session


class SimulationService:
    def __init__(self, db: Session) -> None:
        self.db = db
