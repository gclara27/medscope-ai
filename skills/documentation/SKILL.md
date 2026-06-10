---
name: medscope-documentation
description: >-
  Documentation and thesis support for MedScope AI. Use for technical docs,
  architecture diagrams, demo scripts, and TFM defense preparation.
---

# Skill — Documentation & Thesis

## Purpose

This skill governs technical documentation and academic deliverables.

## Project documentation (authoritative)

Always align new docs with:
- `docs/MedScope AI General Description.md` — vision and narrative
- `docs/Requirements/Requirements.md` — requirements traceability
- `docs/Use Cases/Use Cases.md` — use case catalog and flows
- `docs/Execution Plan/ExecutionPlan.md` — phased roadmap and deliverables
- `docs/Design/` — design system, project brief, and screen mockups for thesis screenshots
- `docs/Testing/Testing.md` — testing strategy for thesis quality section
- `docs/Database/Database.md` — ER diagram and persistence for thesis architecture
- `docs/Task Tracker/TaskTracker.md` — progress tracking for thesis status chapter

Do not contradict `docs/` on product scope. Extend `docs/` only when the user requests it.

---

# Documentation style

- professional and structured
- include architecture, purpose, flow, dependencies
- trace features to requirement IDs (RF-*, RNF-*, UC-*)

---

# Required diagrams

- system architecture (frontend → backend → ML → PostgreSQL)
- ML pipeline
- ER diagram
- deployment (Docker)
- frontend navigation flow

---

# Thesis priorities (RAC-001, RAC-010)

Emphasize:
- explainable AI (SHAP)
- clean layered architecture
- healthcare usability
- simulation engine
- engineering quality and reproducibility

---

# Demo script (MVP)

Demo must cover:
1. login
2. dashboard KPIs
3. patient evaluation and prediction
4. SHAP explanation
5. clinical simulation (compare scores)
6. prediction history
7. analytics

---

# Screenshots to capture

Dashboards, risk gauges, SHAP charts, simulation comparison, analytics views.

Store thesis assets under `docs/` unless the user specifies otherwise.
