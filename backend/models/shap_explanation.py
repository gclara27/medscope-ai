"""SHAP explanation ORM model — RF-030, RIA-031."""

import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, Integer, Numeric, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base

if TYPE_CHECKING:
    from models.prediction import Prediction


class ShapExplanation(Base):
    """Feature-level SHAP contribution for a prediction (multiple rows per prediction)."""

    __tablename__ = "shap_explanations"
    __table_args__ = (Index("idx_shap_explanations_prediction", "prediction_id"),)

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
    feature_name: Mapped[str] = mapped_column(String(100), nullable=False)
    feature_value: Mapped[str | None] = mapped_column(String(255), nullable=True)
    shap_value: Mapped[Decimal] = mapped_column(Numeric(10, 5), nullable=False)
    impact_direction: Mapped[str | None] = mapped_column(String(20), nullable=True)
    importance_rank: Mapped[int | None] = mapped_column(Integer, nullable=True)

    prediction: Mapped["Prediction"] = relationship(back_populates="shap_explanations")

    def __repr__(self) -> str:
        return f"<ShapExplanation feature={self.feature_name!r} rank={self.importance_rank}>"
