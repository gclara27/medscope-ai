"""Simulation persistence (T-116+)."""

from sqlalchemy.orm import Session


class SimulationRepository:
    def __init__(self, db: Session) -> None:
        self.db = db
