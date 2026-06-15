"""Patient clinical input ORM model — RF-020, RNF-034."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base

if TYPE_CHECKING:
    from models.prediction import Prediction


class PatientInput(Base):
    """De-identified clinical inputs for a prediction (Diabetes 130-US dataset fields)."""

    __tablename__ = "patient_inputs"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    prediction_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("predictions.id"),
        unique=True,
        nullable=False,
    )
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    glucose: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    blood_pressure: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    medications_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    previous_admissions: Mapped[int | None] = mapped_column(Integer, nullable=True)
    hospital_stay_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bmi: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    prediction: Mapped["Prediction"] = relationship(back_populates="patient_input")

    def __repr__(self) -> str:
        return f"<PatientInput id={self.id} prediction_id={self.prediction_id}>"
