"""Human-readable labels for SHAP output (RF-030, RF-032)."""

from __future__ import annotations

FEATURE_LABELS: dict[str, str] = {
    "age_midpoint": "Age",
    "time_in_hospital": "Hospital stay (days)",
    "num_medications": "Medication count",
    "number_inpatient": "Prior inpatient visits",
    "number_outpatient": "Prior outpatient visits",
    "number_emergency": "Prior emergency visits",
    "total_prior_visits": "Total prior visits",
    "num_lab_procedures": "Lab procedures",
    "num_procedures": "Clinical procedures",
    "number_diagnoses": "Diagnosis count",
    "active_diabetes_meds_count": "Active diabetes medications",
    "has_insulin": "Insulin therapy",
    "meds_per_day": "Medications per day",
    "gender": "Gender",
    "race": "Race",
    "max_glu_serum": "Glucose level",
    "A1Cresult": "A1C result",
    "change": "Medication change",
    "diabetesMed": "Diabetes medication",
}


def display_feature_name(base_feature: str) -> str:
    return FEATURE_LABELS.get(base_feature, base_feature.replace("_", " ").title())


def build_clinical_summary(
    contributions: tuple,
    *,
    top_n: int = 3,
) -> str:
    """Generate a neutral clinical summary from ranked SHAP contributions."""
    increasing = [item for item in contributions if item.shap_value > 0]
    decreasing = [item for item in contributions if item.shap_value < 0]

    parts: list[str] = []
    if increasing:
        drivers = ", ".join(item.feature_name for item in increasing[:top_n])
        parts.append(f"Main risk drivers: {drivers}.")
    if decreasing:
        protective = ", ".join(item.feature_name for item in decreasing[:top_n])
        parts.append(f"Factors associated with lower risk: {protective}.")
    if not parts:
        parts.append("No dominant contributing factors were identified for this prediction.")
    parts.append("This explanation supports clinical review and is not a diagnosis.")
    return " ".join(parts)
