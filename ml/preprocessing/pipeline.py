"""Sklearn preprocessing pipeline for train/inference parity (RIA-010)."""

from __future__ import annotations

from typing import Any

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from ml.preprocessing.constants import (
    CATEGORICAL_FEATURES,
    FEATURE_COLUMNS,
    NUMERIC_FEATURES,
    RANDOM_STATE,
    TEST_SIZE,
)
from ml.preprocessing.cleaning import (
    load_raw_dataset,
    prepare_model_dataframe,
    split_features_target,
)


def build_preprocessing_pipeline() -> ColumnTransformer:
    """Create an unfitted sklearn transformer for Diabetes 130-US features."""
    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )
    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            (
                "encoder",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
            ),
        ]
    )
    return ColumnTransformer(
        transformers=[
            ("numeric", numeric_pipeline, list(NUMERIC_FEATURES)),
            ("categorical", categorical_pipeline, list(CATEGORICAL_FEATURES)),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )


class Diabetes130Preprocessor:
    """Reproducible preprocessing wrapper for training and inference."""

    def __init__(self) -> None:
        self.pipeline = build_preprocessing_pipeline()
        self.feature_columns_: tuple[str, ...] = FEATURE_COLUMNS
        self.is_fitted_: bool = False

    def fit(self, features: pd.DataFrame, target: Any | None = None) -> Diabetes130Preprocessor:
        self._validate_features(features)
        self.pipeline.fit(features)
        self.is_fitted_ = True
        return self

    def transform(self, features: pd.DataFrame) -> pd.DataFrame:
        self._check_fitted()
        self._validate_features(features)
        transformed = self.pipeline.transform(features)
        column_names = self.get_feature_names_out()
        return pd.DataFrame(transformed, columns=column_names, index=features.index)

    def fit_transform(self, features: pd.DataFrame, target: Any | None = None) -> pd.DataFrame:
        self.fit(features, target)
        return self.transform(features)

    def get_feature_names_out(self) -> list[str]:
        self._check_fitted()
        return list(self.pipeline.get_feature_names_out())

    def _validate_features(self, features: pd.DataFrame) -> None:
        missing = [column for column in self.feature_columns_ if column not in features.columns]
        if missing:
            raise ValueError(f"Missing required feature columns: {missing}")

    def _check_fitted(self) -> None:
        if not self.is_fitted_:
            raise RuntimeError("Diabetes130Preprocessor is not fitted. Call fit() first.")


def load_prepared_dataset(path: str | None = None) -> pd.DataFrame:
    """Load raw data and apply cleaning steps."""
    return prepare_model_dataframe(load_raw_dataset(path))


def train_test_split_data(
    frame: pd.DataFrame | None = None,
    *,
    test_size: float = TEST_SIZE,
    random_state: int = RANDOM_STATE,
):
    """Return stratified train/test splits of cleaned features and target."""
    from sklearn.model_selection import train_test_split

    prepared = frame if frame is not None else load_prepared_dataset()
    features, target = split_features_target(prepared)
    return train_test_split(
        features,
        target,
        test_size=test_size,
        random_state=random_state,
        stratify=target,
    )
