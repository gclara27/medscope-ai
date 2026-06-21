"""ML preprocessing package — T-203/T-204, RIA-010."""

from ml.preprocessing.cleaning import (
    add_age_midpoint,
    add_binary_target,
    clean_placeholders,
    deduplicate_encounters,
    load_raw_dataset,
    parse_age_midpoint,
    prepare_model_dataframe,
    split_features_target,
)
from ml.preprocessing.constants import (
    BASE_NUMERIC_FEATURES,
    BINARY_TARGET_COLUMN,
    CATEGORICAL_FEATURES,
    DEFAULT_RAW_DATA_PATH,
    DERIVED_NUMERIC_FEATURES,
    EXCLUDED_FROM_MVP,
    FEATURE_COLUMNS,
    NUMERIC_FEATURES,
    TARGET_COLUMN,
)
from ml.preprocessing.features import (
    add_diabetes_medication_features,
    add_meds_per_day,
    add_total_prior_visits,
    apply_feature_engineering,
)
from ml.preprocessing.pipeline import (
    Diabetes130Preprocessor,
    build_preprocessing_pipeline,
    load_prepared_dataset,
    train_test_split_data,
)

__all__ = [
    "BASE_NUMERIC_FEATURES",
    "BINARY_TARGET_COLUMN",
    "CATEGORICAL_FEATURES",
    "DEFAULT_RAW_DATA_PATH",
    "DERIVED_NUMERIC_FEATURES",
    "Diabetes130Preprocessor",
    "EXCLUDED_FROM_MVP",
    "FEATURE_COLUMNS",
    "NUMERIC_FEATURES",
    "TARGET_COLUMN",
    "add_age_midpoint",
    "add_binary_target",
    "add_diabetes_medication_features",
    "add_meds_per_day",
    "add_total_prior_visits",
    "apply_feature_engineering",
    "build_preprocessing_pipeline",
    "clean_placeholders",
    "deduplicate_encounters",
    "load_prepared_dataset",
    "load_raw_dataset",
    "parse_age_midpoint",
    "prepare_model_dataframe",
    "split_features_target",
    "train_test_split_data",
]
