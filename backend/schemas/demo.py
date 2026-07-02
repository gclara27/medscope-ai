"""Public demo playground schemas — ephemeral inference without persistence."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict

from schemas.prediction import PredictRequest
from schemas.simulation import SimulateModifications


class DemoSimulateRequest(BaseModel):
    """What-if simulation for anonymous demo mode (no stored prediction)."""

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    baseline: PredictRequest
    modifications: SimulateModifications
