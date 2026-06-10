# MedScope AI — Design Project Brief

## Overview

MedScope AI is a **Clinical Decision Support System (CDSS)** for hospital readmission risk prediction, built as a Master's Thesis (TFM). The UI must feel like an enterprise healthcare SaaS product: calm, precise, and trustworthy.

## Target users

| Role | Design focus |
|---|---|
| Clinician | Prediction, SHAP, simulation |
| Nurse | Risk consultation, history |
| Analyst | Analytics, trends |
| Admin | Settings (post-MVP) |

## Core screens (MVP)

| Screen folder | Requirement | Description |
|---|---|---|
| `screens/splash/` | RFW-010 | Welcome / brand entry |
| `screens/login/` | RFW-011 | Email + password auth |
| `screens/dashboard/` | RFW-012 | KPIs, trends, recent activity |
| `screens/prediction-form/` | RFW-013 | Clinical evaluation form |
| `screens/prediction-result/` | RFW-014, RFW-015 | Risk score + SHAP explainability |
| `screens/simulation/` | RFW-016 | What-if clinical sandbox |
| `screens/history/` | RFW-018 | Past evaluations |
| `screens/analytics/` | RFW-017 | Population metrics |

## Optional screens (post-MVP)

| Screen folder | Notes |
|---|---|
| `screens/settings/` | RF-012 sidebar link |
| `screens/support/` | Help / support center |
| `screens/system-status/` | Ops transparency |

## Design philosophy

- **Light theme default** — `design-system.light.md` (RUX-010)
- **Dark theme optional** — `design-system.dark.md` (Requirements §18)
- **Typography:** Inter + JetBrains Mono for metrics
- **Risk colors:** green / amber / red (RUX-011) — never decorative
- **ML scope:** Scikit-learn readmission model + SHAP (not LLM chat UI)

## Technical alignment

- Stack: React + TypeScript + Tailwind + shadcn/ui + Recharts
- Each screen folder contains `mockup.png` + `reference.html` for implementation reference
- Tokens in design-system YAML frontmatter → Tailwind config in `frontend/`

## Related docs

- `docs/Requirements/Requirements.md`
- `docs/Use Cases/Use Cases.md`
- `docs/Design/README.md`
