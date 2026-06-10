---
name: medscope-clinical-domain
description: >-
  Clinical domain context for MedScope AI. Use for medical terminology, platform
  scope boundaries, readmission risk language, and user-facing copy tone.
---

# Skill — Clinical Domain

## Purpose

This skill provides healthcare context for all user-facing and API text.

## Project documentation

Consult before implementing:
- `docs/MedScope AI General Description.md` — problem, users, value
- `docs/Requirements/Requirements.md` — §1–3 (objectives, stakeholders, roles)
- `docs/Use Cases/Use Cases.md` — actors and clinical flows

---

# Clinical focus

- hospital readmission risk prediction
- early identification of high-risk patients
- explainable risk factors
- what-if clinical simulation
- hospital analytics

Primary use case: **Diabetes 130-US hospitals** readmission context.

---

# Actors

| Actor | Role |
|---|---|
| Clinician | Evaluate patients, run simulations |
| Nurse | Consult risk and history |
| Analyst | Metrics, trends, distributions |
| Admin | Users and configuration |

---

# Platform scope

**IS:** decision support, risk assessment, analytics, prediction support.

**IS NOT:** diagnosis software, treatment recommendation, clinician replacement.

Always include appropriate disclaimers in UI copy.

---

# Tone

- professional, concise, medically neutral
- use "risk assessment", "clinical evaluation", "contributing variables"
- avoid alarmist language and deterministic statements
- never imply guaranteed outcomes or certain diagnosis

Coordinate with `skills/shap/SKILL.md` for explanation wording.
