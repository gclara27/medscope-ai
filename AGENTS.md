# MedScope AI — Agent Operating System

## Overview

MedScope AI is a Clinical Decision Support System (CDSS)
focused on:
- patient risk prediction,
- explainable AI,
- healthcare analytics,
- clinical simulation.

This project is a Master's Thesis (TFM).

The objective is to create a modern AI healthcare platform
that demonstrates:
- AI engineering,
- backend architecture,
- frontend UX,
- explainable AI,
- analytics,
- enterprise-level software engineering.

---

# Agent System Architecture

This repository uses a modular AI skill architecture.

The AI agent should:
1. read `AGENTS.md` and relevant `docs/` files,
2. identify the current domain,
3. read the matching skill file (`skills/<domain>/SKILL.md`),
4. follow its conventions,
5. avoid mixing architectural patterns.

---

# Repository Structure

Code and documentation are organized as:

```
medscope-ai/
├── AGENTS.md
├── skills/           # AI domain skills (this system)
├── docs/             # Product documentation (source of truth)
├── backend/          # FastAPI application
├── frontend/         # React application
├── ml/               # Training, preprocessing, evaluation
├── datasets/         # Clinical datasets (not committed if large)
├── docker/           # Docker configs
├── tests/            # Cross-cutting tests
└── notebooks/        # Exploratory analysis
```

Do not use the legacy `app/` layout. New code goes in `backend/`, `frontend/`, or `ml/`.

---

# Skill Routing Rules

Read the skill file in the **Skill file** column before working in that domain.

| Domain | Skill file |
|---|---|
| FastAPI, REST API, JWT, bcrypt | `skills/backend/SKILL.md` |
| PostgreSQL, SQLAlchemy, Alembic | `skills/database/SKILL.md` |
| Database schema & persistence | `docs/Database/Database.md` |
| React, TypeScript, pages, components | `skills/frontend/SKILL.md` |
| Tailwind, layout, visual design | `skills/ui-ux/SKILL.md` + `docs/Design/` |
| Design system, mockups, UI tokens | `docs/Design/design-system.light.md` |
| SHAP, explainability, XAI | `skills/shap/SKILL.md` |
| ML training, inference, preprocessing | `skills/ml/SKILL.md` |
| pytest, vitest, playwright | `skills/testing/SKILL.md` |
| Testing strategy & test plan | `docs/Testing/Testing.md` |
| Clinical terminology, scope, tone | `skills/clinical-domain/SKILL.md` |
| Thesis, diagrams, technical docs | `skills/documentation/SKILL.md` |
| Product requirements | `docs/Requirements/Requirements.md` |
| Use cases & user flows | `docs/Use Cases/Use Cases.md` |
| Product vision & scope | `docs/MedScope AI General Description.md` |
| Development phases & roadmap | `docs/Execution Plan/ExecutionPlan.md` |
| Task progress & backlog | `docs/TaskTracker.md` |

---

# Priority Hierarchy

Priority order:

1. AGENTS.md
2. `docs/` — project documentation (source of truth for product scope)
3. Relevant domain skill
4. Local folder instructions
5. User request

When product requirements, use cases, or feature scope are involved,
always read the relevant `docs/` files before designing or implementing.

---

# Project Documentation (`docs/`)

The `docs/` folder contains the authoritative project documentation.
The AI agent must treat it as mandatory context — not optional reference.

## When to read

| Situation | Read first |
|---|---|
| New feature or module | `docs/Requirements/Requirements.md` |
| User flows, screens, actors | `docs/Use Cases/Use Cases.md` |
| Product vision, problem, value | `docs/MedScope AI General Description.md` |
| Thesis, diagrams, demo prep | `skills/documentation` + all `docs/` files |
| Implementation order & phases | `docs/Execution Plan/ExecutionPlan.md` |
| UI design, tokens, screen mockups | `docs/Design/README.md` |
| Design scope & screen inventory | `docs/Design/project-brief.md` |
| Writing or running tests | `docs/Testing/Testing.md` |
| Database schema, migrations, ER | `docs/Database/Database.md` |
| Tracking implementation progress | `docs/TaskTracker.md` |

## Document index

| File | Purpose |
|---|---|
| `docs/MedScope AI General Description.md` | Product vision, problem statement, core functionalities, target users |
| `docs/Requirements/Requirements.md` | Full product requirements: functional, non-functional, security, ML, UI |
| `docs/Use Cases/Use Cases.md` | Actors, use case catalog, user flows, acceptance criteria |
| `docs/Execution Plan/ExecutionPlan.md` | Phased roadmap, deliverables, requirements traceability matrix |
| `docs/Design/README.md` | Design documentation index and theme priority |
| `docs/Design/project-brief.md` | Design scope, screen inventory, audience |
| `docs/Design/design-system.light.md` | Default UI tokens, components, colors (MVP) |
| `docs/Design/design-system.dark.md` | Dark theme tokens (optional, post-MVP) |
| `docs/Design/screens/` | Screen mockups and HTML references |
| `docs/Testing/Testing.md` | Testing stack, structure, RTS/UC traceability, E2E flows |
| `docs/Database/Database.md` | PostgreSQL schema, MVP tables, migrations, persistence flows |
| `docs/Deployment/Deployment.md` | Production deploy: Supabase + Render + Vercel (UC-124) |
| `docs/TaskTracker.md` | Master backlog with checkboxes, US/UC/RF traceability |
| `docs/Optional Features/Optional-Backlog-Plan.md` | Work plan T-X05–T-X07 (support, audit, multi-model) |

## Rules

- Before implementing any feature, verify it exists in Requirements or Use Cases.
- Do not invent features, flows, or actors not defined in `docs/`.
- If AGENTS.md and `docs/` conflict on **product scope**, `docs/` wins.
- If AGENTS.md and `docs/` conflict on **engineering conventions**, AGENTS.md wins.
- When the user request contradicts `docs/`, flag the conflict and ask before proceeding.
- Quote or align implementation with the terminology used in `docs/`.

---

# Project Goals

The platform must provide:
- authentication (email + password, JWT),
- dashboard with KPIs,
- patient clinical evaluation,
- AI readmission risk prediction,
- SHAP explainability,
- clinical simulation (what-if),
- analytics,
- prediction history,
- user administration (admin role).

## User roles

| Role | Capabilities |
|---|---|
| admin | Manage users, roles, configuration |
| clinician | Evaluate patients, view explanations, simulate |
| analyst | View metrics, trends, analytics |
| nurse | Consult risk and history |

## MVP scope (mandatory)

Must ship before optional features:
- Login / logout
- Dashboard
- AI prediction
- SHAP explanations
- Simulation
- History
- Basic analytics
- PostgreSQL persistence
- Docker
- Professional UI

See `docs/Requirements/Requirements.md` §17 for full MVP and optional features.

## Key API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/login` | Authentication |
| POST | `/predict` | Risk prediction + SHAP |
| POST | `/simulate` | What-if simulation |
| GET | `/history` | Prediction history |
| GET | `/analytics` | Aggregated metrics |

## Production (TFM, jul 2026)

| Layer | URL |
|---|---|
| Frontend | https://medscope-ai-delta.vercel.app |
| API | https://medscope-ai-q8tg.onrender.com |
| Health | https://medscope-ai-q8tg.onrender.com/health |

Deploy guide: `docs/Deployment/Deployment.md` (Supabase + Render + Vercel).

## Performance targets

- Prediction response: **< 1 second**
- Dashboard load: **< 2 seconds**

---

# Main WOW Features

The most important features are:

## 1. Explainable AI
Clear SHAP explanations.

## 2. Clinical Simulation
Modify patient variables and instantly recalculate risk.

## 3. Enterprise UX
Modern healthcare dashboard feeling.

---

# Technical Stack

## Frontend
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- Recharts
- React Router
- Axios

## Backend
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- JWT Authentication

## ML
- Scikit-learn
- Pandas
- NumPy
- SHAP
- Joblib

## Infrastructure
- Docker
- Docker Compose
- `.env` for environment variables

## Code quality
- **Ruff** — lint and format for `backend/` and `ml/` (`pyproject.toml`)
- **ESLint** — TypeScript/React in `frontend/` (`eslint.config.js`)
- `scripts/lint.ps1` — run both from repo root (Windows)

## Frontend choice

Primary UI: **React + TypeScript** (not Streamlit).
`docs/Requirements/Requirements.md` §19 mentions Streamlit as an alternative;
this project standardizes on React for the production UI.

---

# Global Architecture Rules

Always prioritize:
- simplicity,
- readability,
- maintainability,
- modularity.

Avoid:
- microservices,
- overengineering,
- premature optimization,
- unnecessary abstractions.

This project should remain:
- a **monolithic repository** (single repo, not microservices),
- with **decoupled modules** (frontend, backend, ML),
- clean,
- scalable,
- understandable.

---

# Backend Rules

Location: `backend/`

Use layered architecture:

```
backend/
├── routers/
├── services/
├── repositories/
├── schemas/
├── models/
└── core/
```

Rules:
- routers must remain thin
- services contain business logic
- repositories contain DB logic
- schemas validate API I/O
- use dependency injection

---

# Frontend Rules

Location: `frontend/`

Required screens (see `docs/Requirements/Requirements.md` §8.2):
login, dashboard, prediction form, prediction result, explainability,
simulation, analytics, history.

Sidebar navigation: dashboard, evaluation, simulation, history, analytics, settings.

Frontend must:
- use reusable components,
- use TypeScript everywhere,
- isolate API calls,
- maintain responsive design,
- use clean dashboard layouts.

Avoid:
- giant components,
- inline styles,
- duplicated logic.

---

# UI/UX Rules

Follow `docs/Design/design-system.light.md` for all visual implementation.

The application must feel:
- clinical,
- modern,
- elegant,
- enterprise-grade.

Use design tokens (do not invent colors):
- primary medical blue (`#0058bc`),
- muted navy text (`#191c1d`),
- teal accents for charts,
- neutral gray surfaces,
- risk colors: green / amber / red (RUX-011).

Avoid:
- flashy colors,
- gaming aesthetics,
- excessive animations,
- dark mode in MVP (optional per Requirements §18).

---

# Clinical Rules

The platform is:
- a decision support system,
- a prediction platform,
- an analytics tool.

The platform is NOT:
- a diagnosis engine,
- a treatment recommendation system,
- a replacement for clinicians.

---

# Security Rules

Always:
- hash passwords (bcrypt),
- validate JWT,
- sanitize input,
- validate schemas,
- configure CORS,
- log errors (backend + ML).

Never:
- expose secrets,
- expose stack traces,
- store PHI,
- store plaintext passwords.

---

# ML Rules

Models are trained OFFLINE.

Never retrain during inference.

Always:
- serialize models,
- load models at startup,
- validate input,
- include SHAP explanations.

Preferred models:
- Logistic Regression
- Random Forest
- XGBoost (optional)

Location: `ml/` for training; serialized artifacts in `models/` (gitignored).

For SHAP on tree models, prefer **TreeExplainer** (performance).

Target KPIs: accuracy > 75%, recall prioritized.

---

# Testing Rules

Full strategy: `docs/Testing/Testing.md`.

Testing stack:
- pytest + pytest-cov + httpx (`backend/tests/`)
- vitest + React Testing Library (`frontend/`)
- playwright (`tests/e2e/`)
- pytest (`ml/tests/`)
- **Ruff** + **ESLint** — static analysis before commit (`scripts/lint.ps1`, see `docs/Testing/Testing.md` §17)

Prioritize:
- integration tests (API + DB + ML),
- MVP E2E flow (login → prediction → SHAP → simulation → history → analytics),
- backend coverage 60–75%.

Target requirements: RTS-001, RTS-002, RTS-010, RTS-020.

## Cierre de user story (US-xxx)

Al marcar una user story como **cerrada** (`US-xxx` → `[x]` en `docs/TaskTracker.md`) o cuando el usuario pida cerrarla, **no des por terminado el cierre** hasta crear o actualizar los **tests manuales** en `docs/Testing/Manual/`.

**Cuándo aplica:** cierre de US; no aplica a tareas sueltas (T-xxx) sin US, salvo petición explícita.

**Antes de escribir:** lee la US en Task Tracker, UC/RF enlazados, criterios en `docs/Use Cases/Use Cases.md`, y convenciones en `docs/Testing/Manual/README.md` (referencia: `Phase-06-Analytics-UI.md`).

**Mínimo por US:**

| Prioridad | Casos |
|---|---|
| P0 | INF — `.\dev.bat`, health, login; flujo feliz principal; RBAC si hay roles |
| P1 | Estado vacío; error API; regresión relacionada |
| P2 | Solo si aporta (responsive, edge cases no cubiertos por vitest) |

IDs: `MT-P{FASE}-{ÁREA}-{NNN}`. Cada caso: Prioridad, Requisitos, Pasos, Criterios (`[ ]`), tabla Ejecución manual, trazabilidad vitest/pytest. Docs en **español**; UI en **inglés**.

**Dónde guardar:** ampliar `Phase-{NN}-*.md` existente o crear `Phase-{NN}-{Nombre}.md` si el alcance es nuevo.

**Sincronizar:** `docs/Testing/Manual/README.md`, `docs/Testing/Testing.md`, historial en `docs/TaskTracker.md`.

No sustituyas tests automáticos. Si la US es solo UI, enlaza prerrequisitos API (p. ej. Phase-03) en lugar de duplicar.

---

# Code Quality Rules

All code should:
- use clear naming,
- use type hints,
- remain modular,
- avoid giant functions,
- avoid duplicated logic.

Run lint before commits and demos:

```powershell
.\scripts\lint.ps1
```

Python: `ruff check` + `ruff format --check` on `backend/` and `ml/`.  
Frontend: `npm run lint` in `frontend/`.

---

# Documentation Rules

Project documentation lives in `docs/`. Always consult it before coding.

All major modules should include:
- architecture,
- purpose,
- flow,
- dependencies.

New code must remain consistent with:
- `docs/Requirements/Requirements.md` (what to build),
- `docs/Use Cases/Use Cases.md` (how users interact),
- `docs/MedScope AI General Description.md` (why and for whom).

---

# Final Product Vision

The final platform should feel like:
- a healthcare startup product,
- a deployable MVP,
- an enterprise healthcare dashboard,
- a modern AI clinical platform.
