---
name: medscope-ml
description: >-
  Machine learning for MedScope AI. Use for dataset prep, training, evaluation,
  model serialization, and inference integration with the FastAPI backend.
---

# Skill — Machine Learning

## Purpose

This skill governs ML work in `ml/` and serialized artifacts in `models/`.

## Project documentation

Consult before implementing:
- `docs/Requirements/Requirements.md` — §7 (IA/ML), §16 (risks), §17 (MVP)
- `docs/Use Cases/Use Cases.md` — UC-110–112, UC-022, UC-082–083

---

# Dataset

Preferred: **Diabetes 130-US hospitals** (readmission prediction).
Store raw data in `datasets/` (document source and preprocessing steps).

---

# Workflow

```
load dataset → clean → preprocess → feature engineering → train → evaluate → serialize
```

Pipeline must be reproducible (RIA-010) with train/test split (RIA-011).

---

# Models

Start with:
- Logistic Regression
- Random Forest

Optional: XGBoost

Avoid unnecessary deep learning.

---

# Evaluation metrics

Prioritize **Recall**, then F1 Score and ROC-AUC.
Healthcare prioritizes catching high-risk patients.
Target accuracy: **> 75%** (§15 KPIs).

---

# Serialization

Save with joblib:
- `model.pkl`
- `preprocessor.pkl`

Store in `models/` (gitignored). Document features and schema.

---

# Inference rules

- train **offline only** — never retrain during inference
- load model once at backend startup (UC-082)
- validate input; preprocess consistently with training
- expose via REST API (RIA-021)
- return risk score, category, confidence
- compute SHAP values (delegate to `skills/shap/SKILL.md`)
- target latency: **< 1 second**

For tree-based models, use SHAP **TreeExplainer** (§16 risk mitigation).
