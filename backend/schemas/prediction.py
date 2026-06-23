"""Prediction request/response schemas (T-310, RF-020, RF-021)."""

from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

GlucoseLevel = Literal["Norm", ">200", ">300", "None"]
GenderValue = Literal["Male", "Female", "Unknown", "male", "female", "M", "F"]
A1cResult = Literal["None", "Norm", ">7", ">8"]
MedicationChange = Literal["No", "Ch"]
DiabetesMedication = Literal["Yes", "No"]
RiskLevel = Literal["low", "medium", "high"]


class PredictRequest(BaseModel):
    """Clinical intake payload for readmission risk prediction (RF-020)."""

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    age: int = Field(ge=0, le=120, description="Patient age in years")
    gender: GenderValue
    hospital_stay_days: int = Field(ge=1, le=60, description="Current hospital stay duration")
    medications_count: int = Field(ge=0, le=50, description="Number of distinct medications")
    previous_admissions: int = Field(
        ge=0,
        le=30,
        description="Prior inpatient admissions (last 12 months proxy)",
    )

    glucose: float | None = Field(
        default=None,
        ge=0,
        le=600,
        description="Blood glucose in mg/dL (mapped to max_glu_serum when glucose_level omitted)",
    )
    glucose_level: GlucoseLevel | None = Field(
        default=None,
        description="Dataset glucose category (overrides numeric glucose mapping)",
    )
    blood_pressure: float | None = Field(
        default=None,
        ge=40,
        le=250,
        description="Systolic blood pressure in mmHg (stored for audit, not used by MVP model)",
    )
    bmi: float | None = Field(default=None, ge=10, le=80)

    number_outpatient: int = Field(default=0, ge=0, le=30)
    number_emergency: int = Field(default=0, ge=0, le=30)
    num_lab_procedures: int = Field(default=25, ge=0, le=200)
    num_procedures: int = Field(default=1, ge=0, le=50)
    number_diagnoses: int = Field(default=4, ge=1, le=20)
    active_diabetes_meds_count: int = Field(default=2, ge=0, le=23)
    has_insulin: bool = False
    race: str = Field(default="Caucasian", min_length=1, max_length=50)
    a1c_result: A1cResult = "None"
    medication_change: MedicationChange = "No"
    diabetes_medication: DiabetesMedication = "Yes"

    @model_validator(mode="after")
    def require_glucose_signal(self) -> PredictRequest:
        if self.glucose is None and self.glucose_level is None:
            raise ValueError("Provide glucose (mg/dL) or glucose_level.")
        return self


class ShapExplanationItem(BaseModel):
    """Single SHAP feature contribution (UC-030)."""

    feature_name: str
    feature_value: str | float | int | bool | None
    shap_value: float
    importance_rank: int
    direction: str
    impact_direction: Literal["positive", "negative"]


class PredictResponse(BaseModel):
    """Prediction result with explainability payload (UC-022–023, UC-030)."""

    id: UUID
    risk_score: float = Field(ge=0.0, le=1.0, description="Readmission probability")
    risk_percent: float = Field(ge=0.0, le=100.0, description="Risk score as percentage")
    risk_level: RiskLevel
    confidence_score: float | None = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Model confidence for the predicted class",
    )
    summary: str
    model_version: str
    prediction_time_ms: int
    shap_explanations: list[ShapExplanationItem]
    created_at: datetime
