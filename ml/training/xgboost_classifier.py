"""XGBoost optional baseline trainer (T-213, EP-2.6)."""

from __future__ import annotations

from typing import Any

import pandas as pd
from xgboost import XGBClassifier

from ml.preprocessing.constants import RANDOM_STATE
from ml.preprocessing.pipeline import train_test_split_data
from ml.training.artifacts import save_xgboost_artifacts
from ml.training.base import train_classifier
from ml.training.constants import XGBOOST_MODEL_ID, XGBOOST_MODEL_VERSION


def _default_scale_pos_weight(frame: pd.DataFrame | None) -> float:
    """Derive class imbalance weight from the stratified train split."""
    _, _, y_train, _ = train_test_split_data(frame)
    positives = int((y_train == 1).sum())
    negatives = int((y_train == 0).sum())
    if positives == 0:
        return 1.0
    return negatives / positives


def build_xgboost_model(
    *,
    random_state: int = RANDOM_STATE,
    scale_pos_weight: float = 1.0,
    n_estimators: int = 200,
    max_depth: int = 6,
    learning_rate: float = 0.1,
    subsample: float = 0.9,
    colsample_bytree: float = 0.9,
    n_jobs: int = -1,
) -> XGBClassifier:
    """Create an unfitted XGBoost classifier tuned for imbalanced readmission data."""
    return XGBClassifier(
        random_state=random_state,
        scale_pos_weight=scale_pos_weight,
        n_estimators=n_estimators,
        max_depth=max_depth,
        learning_rate=learning_rate,
        subsample=subsample,
        colsample_bytree=colsample_bytree,
        objective="binary:logistic",
        eval_metric="logloss",
        n_jobs=n_jobs,
    )


def train_xgboost(
    frame: pd.DataFrame | None = None,
    *,
    save: bool = True,
    model_kwargs: dict[str, Any] | None = None,
):
    """Train XGBoost on the same stratified split as LR/RF baselines."""
    kwargs = dict(model_kwargs or {})
    kwargs.setdefault("scale_pos_weight", _default_scale_pos_weight(frame))
    model = build_xgboost_model(**kwargs)
    return train_classifier(
        model,
        frame,
        model_id=XGBOOST_MODEL_ID,
        model_version=XGBOOST_MODEL_VERSION,
        save=save,
        save_fn=save_xgboost_artifacts if save else None,
    )
