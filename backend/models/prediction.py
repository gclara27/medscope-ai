"""Prediction ORM model — RF-023, RF-050, UC-023."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, Integer, Numeric, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base

if TYPE_CHECKING:
    from models.patient_input import PatientInput
    from models.shap_explanation import ShapExplanation
    from models.simulation import Simulation
    from models.user import User


class Prediction(Base):
    """AI readmission risk prediction stored per evaluation."""

    __tablename__ = "predictions"
    __table_args__ = (
        Index("idx_predictions_user", "user_id"),
        Index("idx_predictions_created", "created_at"),
        Index("idx_predictions_risk_level", "risk_level"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )
    risk_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False)
    confidence_score: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    prediction_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(back_populates="predictions")
    patient_input: Mapped["PatientInput"] = relationship(
        back_populates="prediction",
        uselist=False,
    )
    shap_explanations: Mapped[list["ShapExplanation"]] = relationship(
        back_populates="prediction",
    )
    simulations: Mapped[list["Simulation"]] = relationship(back_populates="prediction")

    def __repr__(self) -> str:
        return f"<Prediction id={self.id} risk_level={self.risk_level!r}>"
