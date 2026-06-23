"""Simulation persistence (T-116, T-309)."""

from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from models.simulation import Simulation, SimulationInput


class SimulationRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_with_details(
        self,
        *,
        prediction_id: UUID,
        user_id: UUID,
        original_risk_percent: Decimal,
        simulated_risk_percent: Decimal,
        delta_risk_percent: Decimal,
        simulation_summary: str | None,
        input_rows: list[dict],
    ) -> Simulation:
        """Persist simulation + simulation_inputs atomically (UC-044)."""
        try:
            simulation = Simulation(
                prediction_id=prediction_id,
                user_id=user_id,
                original_risk=original_risk_percent,
                simulated_risk=simulated_risk_percent,
                delta_risk=delta_risk_percent,
                simulation_summary=simulation_summary,
            )
            self.db.add(simulation)
            self.db.flush()

            for row in input_rows:
                self.db.add(
                    SimulationInput(
                        simulation_id=simulation.id,
                        **row,
                    )
                )

            self.db.commit()
            self.db.refresh(simulation)
            return simulation
        except Exception:
            self.db.rollback()
            raise
