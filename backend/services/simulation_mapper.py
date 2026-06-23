"""Map stored predictions and simulation overrides to ML feature rows (UC-041)."""

from __future__ import annotations

from decimal import Decimal

from models.patient_input import PatientInput
from schemas.prediction import GenderValue, PredictRequest
from schemas.simulation import SIMULATION_FIELD_NAMES, SimulateModifications, SimulationChangeItem
from services.prediction_mapper import normalize_gender


def _to_gender_value(gender: str | None) -> GenderValue:
    if not gender:
        return "Unknown"
    return normalize_gender(gender)  # type: ignore[return-value]


def patient_input_to_predict_request(patient_input: PatientInput) -> PredictRequest:
    """Rebuild a PredictRequest baseline from persisted patient_inputs."""
    glucose = float(patient_input.glucose) if patient_input.glucose is not None else 140.0

    return PredictRequest(
        age=patient_input.age if patient_input.age is not None else 65,
        gender=_to_gender_value(patient_input.gender),
        hospital_stay_days=patient_input.hospital_stay_days or 3,
        medications_count=patient_input.medications_count or 8,
        previous_admissions=patient_input.previous_admissions or 0,
        glucose=glucose,
        blood_pressure=float(patient_input.blood_pressure) if patient_input.blood_pressure else None,
        bmi=float(patient_input.bmi) if patient_input.bmi is not None else None,
    )


def apply_simulation_modifications(
    baseline: PredictRequest,
    modifications: SimulateModifications,
) -> PredictRequest:
    """Merge simulation overrides onto the stored prediction baseline."""
    updates = {
        name: getattr(modifications, name)
        for name in SIMULATION_FIELD_NAMES
        if getattr(modifications, name) is not None
    }
    return baseline.model_copy(update=updates)


def _format_change_value(value: object) -> str | None:
    if value is None:
        return None
    if isinstance(value, bool):
        return str(value).lower()
    if isinstance(value, Decimal):
        return str(value)
    return str(value)


def detect_simulation_changes(
    baseline: PredictRequest,
    simulated: PredictRequest,
) -> list[SimulationChangeItem]:
    """List variables that differ between baseline and simulated payloads."""
    changes: list[SimulationChangeItem] = []
    for name in SIMULATION_FIELD_NAMES:
        original = getattr(baseline, name)
        updated = getattr(simulated, name)
        if original != updated:
            changes.append(
                SimulationChangeItem(
                    feature_name=name,
                    original_value=_format_change_value(original),
                    simulated_value=_format_change_value(updated),
                )
            )
    return changes


def build_simulation_summary(delta_risk_percent: float, changes: list[SimulationChangeItem]) -> str:
    """Neutral clinical summary for simulation comparison (RF-032)."""
    if not changes:
        return "No clinical variables were changed in this simulation."

    labels = ", ".join(change.feature_name.replace("_", " ") for change in changes)
    if delta_risk_percent > 0:
        direction = "increased"
    elif delta_risk_percent < 0:
        direction = "decreased"
    else:
        direction = "remained unchanged"

    if direction == "remained unchanged":
        return (
            f"After adjusting {labels}, the estimated readmission risk remained unchanged. "
            "This comparison supports clinical review and is not a diagnosis."
        )

    return (
        f"After adjusting {labels}, the estimated readmission risk {direction} by "
        f"{abs(delta_risk_percent):.1f} percentage points. "
        "This comparison supports clinical review and is not a diagnosis."
    )
