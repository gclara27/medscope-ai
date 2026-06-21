"""Pytest configuration for ML tests."""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from ml.preprocessing.constants import (  # noqa: E402
    BINARY_TARGET_COLUMN,
    CATEGORICAL_FEATURES,
    NUMERIC_FEATURES,
)


@pytest.fixture
def synthetic_training_frame() -> pd.DataFrame:
    """Minimal modeling frame for fast training tests."""
    rows = 160
    rng = np.random.default_rng(42)
    data: dict[str, list] = {
        "encounter_id": list(range(1, rows + 1)),
        "patient_nbr": list(range(1, rows + 1)),
        "readmitted": ["<30" if i % 5 == 0 else "NO" for i in range(rows)],
        BINARY_TARGET_COLUMN: [1 if i % 5 == 0 else 0 for i in range(rows)],
    }

    for column in NUMERIC_FEATURES:
        if column == "age_midpoint":
            data[column] = rng.integers(40, 90, size=rows).tolist()
        elif column == "has_insulin":
            data[column] = rng.integers(0, 2, size=rows).tolist()
        elif column in {"total_prior_visits", "active_diabetes_meds_count"}:
            data[column] = rng.integers(0, 6, size=rows).tolist()
        elif column == "meds_per_day":
            data[column] = rng.uniform(1.0, 5.0, size=rows).round(2).tolist()
        else:
            data[column] = rng.integers(0, 12, size=rows).tolist()

    for column in CATEGORICAL_FEATURES:
        if column == "gender":
            data[column] = ["Male" if i % 2 == 0 else "Female" for i in range(rows)]
        elif column == "race":
            data[column] = ["Caucasian" if i % 3 else "AfricanAmerican" for i in range(rows)]
        elif column == "max_glu_serum":
            data[column] = ["Norm" if i % 4 else ">200" for i in range(rows)]
        elif column == "A1Cresult":
            data[column] = ["None" if i % 3 else ">8" for i in range(rows)]
        elif column == "change":
            data[column] = ["No" if i % 2 else "Ch" for i in range(rows)]
        else:
            data[column] = ["Yes" if i % 2 else "No" for i in range(rows)]

    return pd.DataFrame(data)
