"""Feature engineering for Diabetes 130-US (T-204, EP-2.5).

Transforms cleaned raw columns into the MVP modeling feature set. Derived
features are computed deterministically so train and inference stay aligned
(RIA-010).
"""

from __future__ import annotations

import pandas as pd

from ml.preprocessing.constants import (
    ADMISSION_COUNT_COLUMNS,
    DIABETES_MEDICATION_COLUMNS,
    INSULIN_COLUMN,
)

_NO_MEDICATION_VALUE = "No"


def add_total_prior_visits(frame: pd.DataFrame) -> pd.DataFrame:
    """Sum prior inpatient, outpatient, and emergency visits (admissions proxy)."""
    result = frame.copy()
    admissions = result.loc[:, ADMISSION_COUNT_COLUMNS].fillna(0)
    result["total_prior_visits"] = admissions.sum(axis=1).astype(int)
    return result


def add_diabetes_medication_features(frame: pd.DataFrame) -> pd.DataFrame:
    """Collapse 23 diabetes drug columns into interpretable numeric signals."""
    result = frame.copy()
    present_columns = [column for column in DIABETES_MEDICATION_COLUMNS if column in result.columns]

    if not present_columns:
        result["active_diabetes_meds_count"] = 0
        result["has_insulin"] = 0
        return result

    medication_values = result.loc[:, present_columns]
    is_active = medication_values.ne(_NO_MEDICATION_VALUE) & medication_values.notna()
    result["active_diabetes_meds_count"] = is_active.sum(axis=1).astype(int)

    if INSULIN_COLUMN in result.columns:
        insulin_active = result[INSULIN_COLUMN].ne(_NO_MEDICATION_VALUE) & result[INSULIN_COLUMN].notna()
        result["has_insulin"] = insulin_active.astype(int)
    else:
        result["has_insulin"] = 0

    return result


def add_meds_per_day(frame: pd.DataFrame) -> pd.DataFrame:
    """Medication intensity: total medications per hospital day."""
    result = frame.copy()
    stay_days = result["time_in_hospital"].fillna(1).clip(lower=1)
    result["meds_per_day"] = (result["num_medications"].fillna(0) / stay_days).astype(float)
    return result


def apply_feature_engineering(frame: pd.DataFrame) -> pd.DataFrame:
    """Run all MVP feature engineering steps on a cleaned dataframe."""
    engineered = add_total_prior_visits(frame)
    engineered = add_diabetes_medication_features(engineered)
    engineered = add_meds_per_day(engineered)
    return engineered
