"""Map clinical API payloads to ML feature rows (RIA-010)."""

from __future__ import annotations

from typing import TYPE_CHECKING

from core.paths import ensure_repo_root_on_path
from schemas.prediction import PredictRequest

if TYPE_CHECKING:
    import pandas as pd


def categorize_glucose_mg_dl(glucose: float | None) -> str:
    """Map mg/dL glucose to Diabetes 130-US max_glu_serum categories."""
    if glucose is None:
        return "None"
    if glucose > 300:
        return ">300"
    if glucose > 200:
        return ">200"
    return "Norm"


def normalize_gender(gender: str) -> str:
    normalized = gender.strip().lower()
    if normalized in {"m", "male"}:
        return "Male"
    if normalized in {"f", "female"}:
        return "Female"
    return "Unknown"


def request_to_feature_frame(request: PredictRequest) -> pd.DataFrame:
    """Build a single-row feature dataframe aligned with FEATURE_COLUMNS."""
    ensure_repo_root_on_path()
    import pandas as pd
    from ml.preprocessing.constants import FEATURE_COLUMNS

    glucose_category = request.glucose_level or categorize_glucose_mg_dl(request.glucose)
    gender = normalize_gender(request.gender)
    total_prior_visits = (
        request.previous_admissions
        + request.number_outpatient
        + request.number_emergency
    )
    stay_days = max(request.hospital_stay_days, 1)
    meds_per_day = round(request.medications_count / stay_days, 2)

    row: dict[str, object] = {
        "age_midpoint": float(request.age),
        "time_in_hospital": request.hospital_stay_days,
        "num_medications": request.medications_count,
        "number_inpatient": request.previous_admissions,
        "number_outpatient": request.number_outpatient,
        "number_emergency": request.number_emergency,
        "num_lab_procedures": request.num_lab_procedures,
        "num_procedures": request.num_procedures,
        "number_diagnoses": request.number_diagnoses,
        "total_prior_visits": total_prior_visits,
        "active_diabetes_meds_count": request.active_diabetes_meds_count,
        "has_insulin": int(request.has_insulin),
        "meds_per_day": meds_per_day,
        "gender": gender,
        "race": request.race,
        "max_glu_serum": glucose_category,
        "A1Cresult": request.a1c_result,
        "change": request.medication_change,
        "diabetesMed": request.diabetes_medication,
    }
    return pd.DataFrame([row], columns=list(FEATURE_COLUMNS))


def request_to_patient_input_fields(request: PredictRequest) -> dict[str, object]:
    """Fields persisted in patient_inputs (RF-020, DB §4.4)."""
    return {
        "age": request.age,
        "gender": normalize_gender(request.gender).lower(),
        "glucose": request.glucose,
        "blood_pressure": request.blood_pressure,
        "medications_count": request.medications_count,
        "previous_admissions": request.previous_admissions,
        "hospital_stay_days": request.hospital_stay_days,
        "bmi": request.bmi,
    }
