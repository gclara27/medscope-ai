"""Preprocessing tests (T-203, RIA-010)."""

from __future__ import annotations

import pandas as pd
import pytest

from ml.preprocessing.cleaning import (
    add_binary_target,
    clean_placeholders,
    deduplicate_encounters,
    parse_age_midpoint,
    prepare_model_dataframe,
    split_features_target,
)
from ml.preprocessing.constants import BINARY_TARGET_COLUMN, DEFAULT_RAW_DATA_PATH, FEATURE_COLUMNS
from ml.preprocessing.pipeline import Diabetes130Preprocessor, load_prepared_dataset


@pytest.fixture
def sample_frame() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "encounter_id": [1, 2, 3, 4],
            "patient_nbr": [100, 100, 200, 300],
            "race": ["Caucasian", "Caucasian", "?", "AfricanAmerican"],
            "gender": ["Female", "Female", "Male", "Male"],
            "age": ["[60-70)", "[60-70)", "[70-80)", "[50-60)"],
            "weight": ["?", "?", "?", "?"],
            "time_in_hospital": [3, 4, 5, 2],
            "num_medications": [10, 12, 8, 6],
            "number_inpatient": [0, 1, 2, 0],
            "number_outpatient": [0, 0, 1, 0],
            "number_emergency": [0, 1, 0, 0],
            "num_lab_procedures": [30, 40, 20, 15],
            "num_procedures": [0, 1, 0, 0],
            "number_diagnoses": [5, 6, 4, 3],
            "max_glu_serum": ["None", ">200", "Norm", "?"],
            "A1Cresult": ["None", "Norm", ">8", "None"],
            "change": ["No", "Ch", "No", "No"],
            "diabetesMed": ["Yes", "Yes", "No", "Yes"],
            "metformin": ["Steady", "Steady", "No", "No"],
            "insulin": ["No", "Up", "No", "No"],
            "readmitted": ["NO", "<30", "NO", ">30"],
        }
    )


def test_parse_age_midpoint() -> None:
    assert parse_age_midpoint("[70-80)") == 75.0
    assert parse_age_midpoint("?") is None


def test_clean_placeholders_replaces_question_marks(sample_frame: pd.DataFrame) -> None:
    cleaned = clean_placeholders(sample_frame)
    assert pd.isna(cleaned.loc[2, "race"])
    assert pd.isna(cleaned.loc[0, "weight"])


def test_deduplicate_encounters_keeps_first_patient_row(sample_frame: pd.DataFrame) -> None:
    deduped = deduplicate_encounters(sample_frame)
    patient_rows = deduped.loc[deduped["patient_nbr"] == 100]
    assert len(patient_rows) == 1
    assert patient_rows.iloc[0]["encounter_id"] == 1


def test_add_binary_target_maps_readmission_within_30_days(sample_frame: pd.DataFrame) -> None:
    labeled = add_binary_target(sample_frame)
    assert labeled.loc[1, BINARY_TARGET_COLUMN] == 1
    assert labeled.loc[0, BINARY_TARGET_COLUMN] == 0


def test_prepare_model_dataframe_adds_engineered_columns(sample_frame: pd.DataFrame) -> None:
    prepared = prepare_model_dataframe(sample_frame, deduplicate=False)
    assert "age_midpoint" in prepared.columns
    assert prepared.loc[0, "age_midpoint"] == 65.0
    assert prepared.loc[0, "total_prior_visits"] == 0
    assert prepared.loc[1, "total_prior_visits"] == 2
    assert prepared.loc[1, "active_diabetes_meds_count"] == 2


def test_preprocessing_consistency_on_same_input(sample_frame: pd.DataFrame) -> None:
    prepared = prepare_model_dataframe(sample_frame, deduplicate=False)
    features, _ = split_features_target(prepared)

    preprocessor = Diabetes130Preprocessor().fit(features)
    first = preprocessor.transform(features.iloc[[0]])
    second = preprocessor.transform(features.iloc[[0]])

    pd.testing.assert_frame_equal(first, second)


def test_preprocessing_handles_unseen_category(sample_frame: pd.DataFrame) -> None:
    prepared = prepare_model_dataframe(sample_frame, deduplicate=False)
    features, _ = split_features_target(prepared)

    preprocessor = Diabetes130Preprocessor().fit(features)
    inference_row = features.iloc[[0]].copy()
    inference_row.loc[:, "race"] = "UnseenRace"

    transformed = preprocessor.transform(inference_row)
    assert transformed.shape[0] == 1
    assert transformed.isna().sum().sum() == 0


def test_train_test_split_is_stratified() -> None:
    if not DEFAULT_RAW_DATA_PATH.exists():
        pytest.skip("Raw dataset not downloaded")

    from ml.preprocessing.pipeline import train_test_split_data

    x_train, x_test, y_train, y_test = train_test_split_data()
    assert len(x_train) > len(x_test)
    assert set(x_train.columns) == set(FEATURE_COLUMNS)
    assert abs(y_train.mean() - y_test.mean()) < 0.02


def test_load_prepared_dataset_integration() -> None:
    if not DEFAULT_RAW_DATA_PATH.exists():
        pytest.skip("Raw dataset not downloaded")

    prepared = load_prepared_dataset()
    assert len(prepared) < 101_766
    assert BINARY_TARGET_COLUMN in prepared.columns
    assert set(FEATURE_COLUMNS).issubset(prepared.columns)
    assert prepared[BINARY_TARGET_COLUMN].mean() > 0.05
