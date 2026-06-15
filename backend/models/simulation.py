"""Simulation ORM models — RF-042, UC-044."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, Numeric, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base

if TYPE_CHECKING:
    from models.prediction import Prediction
    from models.user import User


class Simulation(Base):
    """What-if clinical simulation comparing original vs simulated risk."""

    __tablename__ = "simulations"
    __table_args__ = (Index("idx_simulations_prediction", "prediction_id"),)

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    prediction_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("predictions.id"),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )
    original_risk: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    simulated_risk: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    delta_risk: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    simulation_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    prediction: Mapped["Prediction"] = relationship(back_populates="simulations")
    user: Mapped["User"] = relationship(back_populates="simulations")
    simulation_inputs: Mapped[list["SimulationInput"]] = relationship(
        back_populates="simulation",
    )

    def __repr__(self) -> str:
        return f"<Simulation id={self.id} delta_risk={self.delta_risk}>"


class SimulationInput(Base):
    """Changed feature values for a simulation."""

    __tablename__ = "simulation_inputs"
    __table_args__ = (Index("idx_simulation_inputs_simulation", "simulation_id"),)

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    simulation_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("simulations.id"),
        nullable=False,
    )
    feature_name: Mapped[str] = mapped_column(String(100), nullable=False)
    original_value: Mapped[str | None] = mapped_column(String(255), nullable=True)
    simulated_value: Mapped[str | None] = mapped_column(String(255), nullable=True)

    simulation: Mapped["Simulation"] = relationship(back_populates="simulation_inputs")

    def __repr__(self) -> str:
        return f"<SimulationInput feature={self.feature_name!r}>"
