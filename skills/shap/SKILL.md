---
name: medscope-shap
description: >-
  SHAP explainability for MedScope AI. Use for feature importance, clinical
  explanations, API response shape, and frontend SHAP visualizations.
---

# Skill — SHAP Explainability

## Purpose

This skill governs explainable AI across backend and frontend.

## Project documentation

Consult before implementing:
- `docs/Requirements/Requirements.md` — §5.4 (RF-030–032), §7.4 (RIA-030–031)
- `docs/Use Cases/Use Cases.md` — UC-030–032

---

# Goals

Explain:
- why risk increased,
- why risk decreased,
- top contributing clinical variables.

---

# SHAP rules

- positive SHAP → increases readmission risk
- negative SHAP → reduces risk
- prefer **TreeExplainer** for tree models (performance)

---

# API response structure

Include per feature:
- feature name
- feature value
- SHAP value
- importance rank

Also provide a **textual clinical summary** (RF-032, UC-032) using neutral language.

---

# Visualization (frontend)

- horizontal bar charts for feature importance
- separate positive vs protective factors (RF-031)
- healthcare color palette (navy, teal, gray)
- keep charts clean and understandable

---

# Clinical language

Use: contributing factor, risk driver, clinical variable.
Avoid: deterministic wording, diagnosis claims, guaranteed outcomes.

Coordinate with `skills/clinical-domain/SKILL.md` for tone.
