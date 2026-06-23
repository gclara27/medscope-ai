"""Dataset loading and cleaning steps for Diabetes 130-US (T-203)."""

from __future__ import annotations

import re
from pathlib import Path

import pandas as pd

from ml.preprocessing.constants import (
    BINARY_TARGET_COLUMN,
    DEFAULT_RAW_DATA_PATH,
    FEATURE_COLUMNS,
    ID_COLUMNS,
    PLACEHOLDER_VALUES,
    TARGET_COLUMN,
)
from ml.preprocessing.features import apply_feature_engineering

_AGE_PATTERN = re.compile(r"\[(\d+)-(\d+)\)")


def load_raw_dataset(path: Path | str | None = None) -> pd.DataFrame:
    """Load the raw UCI CSV."""
    data_path = Path(path) if path is not None else DEFAULT_RAW_DATA_PATH
    if not data_path.exists():
        raise FileNotFoundError(f"Dataset not found at {data_path}. Run: python ml/scripts/download_dataset.py")
    return pd.read_csv(data_path, low_memory=False)


def clean_placeholders(frame: pd.DataFrame) -> pd.DataFrame:
    """Replace placeholder strings with NA for consistent downstream imputation."""
    cleaned = frame.copy()
    replacements = {value: pd.NA for value in PLACEHOLDER_VALUES}
    for column in cleaned.columns:
        if cleaned[column].dtype == object or pd.api.types.is_string_dtype(cleaned[column]):
            cleaned[column] = cleaned[column].replace(replacements)
    return cleaned


def parse_age_midpoint(age_value: object) -> float | None:
    """Convert age bins like `[70-80)` to the midpoint value."""
    if pd.isna(age_value):
        return None
    match = _AGE_PATTERN.match(str(age_value).strip())
    if not match:
        return None
    lower = int(match.group(1))
    upper = int(match.group(2))
    return (lower + upper) / 2


def add_age_midpoint(frame: pd.DataFrame) -> pd.DataFrame:
    """Add numeric `age_midpoint` from the ordinal `age` column."""
    result = frame.copy()
    result["age_midpoint"] = result["age"].map(parse_age_midpoint)
    return result


def add_binary_target(frame: pd.DataFrame) -> pd.DataFrame:
    """Add MVP binary target: readmission within 30 days."""
    result = frame.copy()
    result[BINARY_TARGET_COLUMN] = (result[TARGET_COLUMN] == "<30").astype(int)
    return result


def deduplicate_encounters(
    frame: pd.DataFrame,
    *,
    keep: str = "first",
) -> pd.DataFrame:
    """Keep one encounter per patient (first by encounter_id).

    Aligns with Strack et al. (2014): duplicate patient encounters are removed
    before modeling.
    """
    ordered = frame.sort_values("encounter_id")
    return ordered.drop_duplicates(subset=["patient_nbr"], keep=keep).reset_index(drop=True)


def prepare_model_dataframe(
    frame: pd.DataFrame,
    *,
    deduplicate: bool = True,
) -> pd.DataFrame:
    """Run cleaning steps and return a modeling-ready dataframe."""
    cleaned = clean_placeholders(frame)
    if deduplicate:
        cleaned = deduplicate_encounters(cleaned)
    cleaned = add_age_midpoint(cleaned)
    cleaned = add_binary_target(cleaned)
    cleaned = apply_feature_engineering(cleaned)
    return cleaned


def split_features_target(frame: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    """Extract feature matrix X and binary target y."""
    missing = [column for column in FEATURE_COLUMNS if column not in frame.columns]
    if missing:
        raise ValueError(f"Missing feature columns: {missing}")
    if TARGET_COLUMN not in frame.columns and BINARY_TARGET_COLUMN not in frame.columns:
        raise ValueError("Target column missing from dataframe.")

    features = frame.loc[:, FEATURE_COLUMNS].copy()
    target = frame[BINARY_TARGET_COLUMN]
    return features, target


def drop_identifier_columns(frame: pd.DataFrame) -> pd.DataFrame:
    """Remove identifier columns not used for training."""
    return frame.drop(columns=[column for column in ID_COLUMNS if column in frame.columns])
