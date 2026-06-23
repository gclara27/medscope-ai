"""Feature engineering tests (T-204, EP-2.5)."""

from __future__ import annotations

import pandas as pd
import pytest

from ml.preprocessing.cleaning import prepare_model_dataframe, split_features_target
from ml.preprocessing.constants import (
    DEFAULT_RAW_DATA_PATH,
    DERIVED_NUMERIC_FEATURES,
    EXCLUDED_FROM_MVP,
    FEATURE_COLUMNS,
)
from ml.preprocessing.features import (
    add_diabetes_medication_features,
    add_meds_per_day,
    add_total_prior_visits,
    apply_feature_engineering,
)


@pytest.fixture
def medication_frame() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "number_inpatient": [1, 0],
            "number_outpatient": [2, 0],
            "number_emergency": [1, 0],
            "time_in_hospital": [4, 2],
            "num_medications": [12, 6],
            "metformin": ["Steady", "No"],
            "insulin": ["Up", "No"],
            "glipizide": ["No", "Steady"],
        }
    )


def test_add_total_prior_visits_sums_admission_columns(medication_frame: pd.DataFrame) -> None:
    result = add_total_prior_visits(medication_frame)
    assert result.loc[0, "total_prior_visits"] == 4
    assert result.loc[1, "total_prior_visits"] == 0


def test_add_diabetes_medication_features_counts_active_meds(medication_frame: pd.DataFrame) -> None:
    result = add_diabetes_medication_features(medication_frame)
    assert result.loc[0, "active_diabetes_meds_count"] == 2
    assert result.loc[0, "has_insulin"] == 1
    assert result.loc[1, "active_diabetes_meds_count"] == 1
    assert result.loc[1, "has_insulin"] == 0


def test_add_meds_per_day_divides_by_stay_length(medication_frame: pd.DataFrame) -> None:
    result = add_meds_per_day(medication_frame)
    assert result.loc[0, "meds_per_day"] == pytest.approx(3.0)
    assert result.loc[1, "meds_per_day"] == pytest.approx(3.0)


def test_apply_feature_engineering_is_idempotent_on_derived_columns(
    medication_frame: pd.DataFrame,
) -> None:
    first = apply_feature_engineering(medication_frame)
    second = apply_feature_engineering(first)
    for column in DERIVED_NUMERIC_FEATURES:
        pd.testing.assert_series_equal(first[column], second[column], check_names=True)


def test_feature_columns_include_derived_numerics() -> None:
    for column in DERIVED_NUMERIC_FEATURES:
        assert column in FEATURE_COLUMNS


def test_prepare_model_dataframe_includes_engineered_features() -> None:
    frame = pd.DataFrame(
        {
            "encounter_id": [1],
            "patient_nbr": [100],
            "race": ["Caucasian"],
            "gender": ["Female"],
            "age": ["[60-70)"],
            "time_in_hospital": [5],
            "num_medications": [10],
            "number_inpatient": [1],
            "number_outpatient": [0],
            "number_emergency": [1],
            "num_lab_procedures": [30],
            "num_procedures": [1],
            "number_diagnoses": [5],
            "max_glu_serum": ["Norm"],
            "A1Cresult": ["None"],
            "change": ["No"],
            "diabetesMed": ["Yes"],
            "metformin": ["Steady"],
            "insulin": ["No"],
            "readmitted": ["NO"],
        }
    )
    prepared = prepare_model_dataframe(frame, deduplicate=False)
    features, _ = split_features_target(prepared)

    assert prepared.loc[0, "total_prior_visits"] == 2
    assert prepared.loc[0, "active_diabetes_meds_count"] == 1
    assert prepared.loc[0, "meds_per_day"] == pytest.approx(2.0)
    assert list(features.columns) == list(FEATURE_COLUMNS)


def test_excluded_columns_not_in_feature_set() -> None:
    for column in EXCLUDED_FROM_MVP:
        assert column not in FEATURE_COLUMNS


def test_feature_engineering_integration_on_raw_dataset() -> None:
    if not DEFAULT_RAW_DATA_PATH.exists():
        pytest.skip("Raw dataset not downloaded")

    prepared = prepare_model_dataframe(
        pd.read_csv(DEFAULT_RAW_DATA_PATH, low_memory=False),
        deduplicate=True,
    )

    assert set(FEATURE_COLUMNS).issubset(prepared.columns)
    assert prepared["total_prior_visits"].between(0, 50).all()
    assert prepared["active_diabetes_meds_count"].between(0, 23).all()
    assert prepared["has_insulin"].isin([0, 1]).all()
    assert prepared["meds_per_day"].ge(0).all()
