"""History response schemas (T-306, RF-050–051, UC-050–051)."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from schemas.prediction import PredictRequest, RiskLevel, ShapExplanationItem


class HistoryPatientSummary(BaseModel):
    """De-identified patient snapshot for history list rows."""

    age: int | None = None
    gender: str | None = None
    glucose: float | None = None
    hospital_stay_days: int | None = None


class HistoryPatientDetail(BaseModel):
    """Persisted clinical inputs for a historical evaluation (RF-052)."""

    age: int | None = None
    gender: str | None = None
    glucose: float | None = None
    blood_pressure: float | None = None
    medications_count: int | None = None
    previous_admissions: int | None = None
    hospital_stay_days: int | None = None
    bmi: float | None = None


class HistorySimulationItem(BaseModel):
    """Stored what-if simulation linked to a prediction (UC-052)."""

    id: UUID
    created_at: datetime
    original_risk_percent: float = Field(ge=0.0, le=100.0)
    simulated_risk_percent: float = Field(ge=0.0, le=100.0)
    delta_risk_percent: float
    simulation_summary: str | None = None


class HistoryUserSummary(BaseModel):
    """Clinician who performed the evaluation."""

    id: UUID
    email: str
    first_name: str
    last_name: str
    role: str


class HistoryListItem(BaseModel):
    """Single prediction row in history (UC-050)."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    risk_score: float = Field(ge=0.0, le=1.0)
    risk_percent: float = Field(ge=0.0, le=100.0)
    risk_level: RiskLevel
    confidence_score: float | None = Field(default=None, ge=0.0, le=1.0)
    summary: str | None = None
    model_version: str
    prediction_time_ms: int | None = None
    created_at: datetime
    user: HistoryUserSummary
    patient_input: HistoryPatientSummary | None = None


class HistoryListResponse(BaseModel):
    """Paginated prediction history (RF-051)."""

    items: list[HistoryListItem]
    total: int
    limit: int
    offset: int


class HistoryDetailResponse(BaseModel):
    """Historical prediction detail with inputs, SHAP, and simulations (RF-052, UC-052)."""

    id: UUID
    risk_score: float = Field(ge=0.0, le=1.0)
    risk_percent: float = Field(ge=0.0, le=100.0)
    risk_level: RiskLevel
    confidence_score: float | None = Field(default=None, ge=0.0, le=1.0)
    summary: str | None = None
    model_version: str
    prediction_time_ms: int | None = None
    created_at: datetime
    user: HistoryUserSummary
    patient_input: HistoryPatientDetail | None = None
    baseline_request: PredictRequest
    shap_explanations: list[ShapExplanationItem]
    simulations: list[HistorySimulationItem]
