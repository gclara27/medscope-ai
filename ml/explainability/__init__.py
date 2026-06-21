"""SHAP explainability package (T-210)."""

from ml.explainability.explainer import (
    ShapExplainerService,
    build_demo_patient_features,
    classify_risk_level,
    explain_patient,
)
from ml.explainability.models import ShapExplanationResult, ShapFeatureContribution
from ml.explainability.summary import build_clinical_summary, display_feature_name

__all__ = [
    "ShapExplanationResult",
    "ShapExplainerService",
    "ShapFeatureContribution",
    "build_clinical_summary",
    "build_demo_patient_features",
    "classify_risk_level",
    "display_feature_name",
    "explain_patient",
]
