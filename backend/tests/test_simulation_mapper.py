"""Simulation mapper unit tests (T-303)."""

from decimal import Decimal

from models.patient_input import PatientInput
from schemas.prediction import PredictRequest
from schemas.simulation import SimulateModifications
from services.simulation_mapper import (
    apply_simulation_modifications,
    detect_simulation_changes,
    patient_input_to_predict_request,
)


def test_patient_input_to_predict_request_uses_stored_values() -> None:
    patient_input = PatientInput(
        prediction_id=None,  # type: ignore[arg-type]
        age=70,
        gender="female",
        glucose=Decimal("155.00"),
        blood_pressure=Decimal("130.00"),
        medications_count=10,
        previous_admissions=2,
        hospital_stay_days=5,
        bmi=Decimal("31.20"),
    )

    request = patient_input_to_predict_request(patient_input)

    assert request.age == 70
    assert request.gender == "Female"
    assert request.glucose == 155.0
    assert request.previous_admissions == 2
    assert request.hospital_stay_days == 5


def test_apply_modifications_merges_overrides() -> None:
    baseline = PredictRequest(
        age=65,
        gender="Female",
        hospital_stay_days=3,
        medications_count=8,
        previous_admissions=1,
        glucose=140,
    )
    modifications = SimulateModifications(previous_admissions=0, glucose=110)

    updated = apply_simulation_modifications(baseline, modifications)

    assert updated.previous_admissions == 0
    assert updated.glucose == 110
    assert updated.age == 65


def test_detect_simulation_changes_lists_only_modified_fields() -> None:
    baseline = PredictRequest(
        age=65,
        gender="Female",
        hospital_stay_days=3,
        medications_count=8,
        previous_admissions=1,
        glucose=140,
    )
    updated = baseline.model_copy(update={"previous_admissions": 0, "glucose": 110})

    changes = detect_simulation_changes(baseline, updated)

    assert len(changes) == 2
    assert {change.feature_name for change in changes} == {"previous_admissions", "glucose"}
