"""Simulation request/response schemas (T-303, RF-040–042, UC-040–043)."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from schemas.prediction import (
    A1cResult,
    DiabetesMedication,
    GenderValue,
    GlucoseLevel,
    MedicationChange,
    RiskLevel,
)

_SIMULATION_FIELD_NAMES = (
    "age",
    "gender",
    "hospital_stay_days",
    "medications_count",
    "previous_admissions",
    "glucose",
    "glucose_level",
    "blood_pressure",
    "bmi",
    "number_outpatient",
    "number_emergency",
    "num_lab_procedures",
    "num_procedures",
    "number_diagnoses",
    "active_diabetes_meds_count",
    "has_insulin",
    "race",
    "a1c_result",
    "medication_change",
    "diabetes_medication",
)


class SimulateModifications(BaseModel):
    """Partial clinical overrides for what-if simulation (UC-041)."""

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    age: int | None = Field(default=None, ge=0, le=120)
    gender: GenderValue | None = None
    hospital_stay_days: int | None = Field(default=None, ge=1, le=60)
    medications_count: int | None = Field(default=None, ge=0, le=50)
    previous_admissions: int | None = Field(default=None, ge=0, le=30)
    glucose: float | None = Field(default=None, ge=0, le=600)
    glucose_level: GlucoseLevel | None = None
    blood_pressure: float | None = Field(default=None, ge=40, le=250)
    bmi: float | None = Field(default=None, ge=10, le=80)
    number_outpatient: int | None = Field(default=None, ge=0, le=30)
    number_emergency: int | None = Field(default=None, ge=0, le=30)
    num_lab_procedures: int | None = Field(default=None, ge=0, le=200)
    num_procedures: int | None = Field(default=None, ge=0, le=50)
    number_diagnoses: int | None = Field(default=None, ge=1, le=20)
    active_diabetes_meds_count: int | None = Field(default=None, ge=0, le=23)
    has_insulin: bool | None = None
    race: str | None = Field(default=None, min_length=1, max_length=50)
    a1c_result: A1cResult | None = None
    medication_change: MedicationChange | None = None
    diabetes_medication: DiabetesMedication | None = None

    @model_validator(mode="after")
    def require_at_least_one_change(self) -> SimulateModifications:
        if not any(getattr(self, name) is not None for name in _SIMULATION_FIELD_NAMES):
            raise ValueError("Provide at least one modified clinical variable.")
        return self


class SimulateRequest(BaseModel):
    """What-if simulation against a stored prediction (UC-040–042)."""

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    prediction_id: UUID
    modifications: SimulateModifications


class SimulationChangeItem(BaseModel):
    """Single changed variable in a simulation (UC-043, simulation_inputs)."""

    feature_name: str
    original_value: str | None
    simulated_value: str | None


class SimulateResponse(BaseModel):
    """Original vs simulated risk comparison (RF-042, UC-043–044)."""

    id: UUID
    prediction_id: UUID
    original_risk_score: float = Field(ge=0.0, le=1.0)
    original_risk_percent: float = Field(ge=0.0, le=100.0)
    original_risk_level: RiskLevel
    simulated_risk_score: float = Field(ge=0.0, le=1.0)
    simulated_risk_percent: float = Field(ge=0.0, le=100.0)
    simulated_risk_level: RiskLevel
    delta_risk_percent: float = Field(description="Simulated minus original risk (percentage points)")
    simulation_summary: str
    changes: list[SimulationChangeItem]
    simulation_time_ms: int
    model_version: str
    created_at: datetime
