"""Shared constants for Diabetes 130-US preprocessing and feature engineering."""

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_RAW_DATA_PATH = REPO_ROOT / "datasets" / "diabetes130" / "raw" / "data.csv"

TARGET_COLUMN = "readmitted"
BINARY_TARGET_COLUMN = "readmit_30d"
ID_COLUMNS = ("encounter_id", "patient_nbr")

PLACEHOLDER_VALUES = frozenset({"?", "Unknown", "NULL", "none", "None", ""})

# Raw admission columns used to derive total_prior_visits (T-204).
ADMISSION_COUNT_COLUMNS = (
    "number_inpatient",
    "number_outpatient",
    "number_emergency",
)

# Diabetes-specific medication columns in the UCI dataset (collapsed in T-204).
DIABETES_MEDICATION_COLUMNS = (
    "metformin",
    "repaglinide",
    "nateglinide",
    "chlorpropamide",
    "glimepiride",
    "acetohexamide",
    "glipizide",
    "glyburide",
    "tolbutamide",
    "pioglitazone",
    "rosiglitazone",
    "acarbose",
    "miglitol",
    "troglitazone",
    "tolazamide",
    "examide",
    "citoglipton",
    "insulin",
    "glyburide-metformin",
    "glipizide-metformin",
    "glimepiride-pioglitazone",
    "metformin-rosiglitazone",
    "metformin-pioglitazone",
)

INSULIN_COLUMN = "insulin"

# Execution Plan §2.5 core signals + EDA-backed numerics (T-203 baseline).
BASE_NUMERIC_FEATURES = (
    "age_midpoint",  # age
    "time_in_hospital",  # stay duration
    "num_medications",  # medications
    "number_inpatient",  # admissions (DB: previous_admissions proxy)
    "number_outpatient",
    "number_emergency",
    "num_lab_procedures",
    "num_procedures",
    "number_diagnoses",
)

# Engineered numerics (T-204).
DERIVED_NUMERIC_FEATURES = (
    "total_prior_visits",
    "active_diabetes_meds_count",
    "has_insulin",
    "meds_per_day",
)

NUMERIC_FEATURES = BASE_NUMERIC_FEATURES + DERIVED_NUMERIC_FEATURES

# Categorical clinical signals (glucose via max_glu_serum).
CATEGORICAL_FEATURES = (
    "gender",
    "race",
    "max_glu_serum",  # glucose
    "A1Cresult",
    "change",
    "diabetesMed",
)

FEATURE_COLUMNS = NUMERIC_FEATURES + CATEGORICAL_FEATURES

# Documented exclusions for MVP (see datasets/README.md § Feature engineering).
EXCLUDED_FROM_MVP = (
    "weight",  # ~97% missing (EDA T-202)
    "diag_1",
    "diag_2",
    "diag_3",  # high-cardinality ICD codes; number_diagnoses used instead
    "admission_type_id",
    "discharge_disposition_id",
    "admission_source_id",
    "payer_code",
    "medical_specialty",
    *DIABETES_MEDICATION_COLUMNS,  # collapsed into derived counts/flags
)

RANDOM_STATE = 42
TEST_SIZE = 0.2
