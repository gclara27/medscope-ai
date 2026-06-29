# MedScope AI — Execution Plan

## Complete Technical Roadmap for Building the TFM Successfully

**Documentación relacionada (leer antes de implementar):**

| Documento | Propósito |
|---|---|
| `docs/Requirements/Requirements.md` | Requisitos funcionales y no funcionales (RF-*, RNF-*, RBE-*) |
| `docs/Use Cases/Use Cases.md` | Flujos de usuario y casos de uso (UC-*) |
| `docs/MedScope AI General Description.md` | Visión del producto y narrativa |
| `docs/Design/README.md` | Design system, tokens, mockups |
| `docs/Testing/Testing.md` | Testing strategy, RTS/UC coverage |
| `docs/Database/Database.md` | PostgreSQL schema, MVP tables, migrations |
| `docs/TaskTracker.md` | Backlog ejecutable con checkboxes |
| `AGENTS.md` | Convenciones técnicas y routing de skills |

En conflicto de **alcance de producto**, prevalecen Requirements y Use Cases.  
En conflicto de **convenciones técnicas**, prevalece `AGENTS.md`.

---

# 1. Global Strategy

Before touching code, the MOST important thing is understanding this:

## ❌ The goal is NOT:

- creating a perfect hospital platform,
    
- building production-grade Epic Systems,
    
- implementing 200 features.
    

## ✅ The REAL goal is:

Build a **very polished, technically solid, visually impressive AI platform** that demonstrates:

- architecture skills,
    
- ML knowledge,
    
- backend engineering,
    
- explainable AI,
    
- data persistence,
    
- frontend usability,
    
- product thinking,
    
- software engineering maturity.
    

---

# 2. Recommended Development Philosophy

You have limited time.

Therefore:

## PRIORITIES

### Priority #1

A COMPLETE end-to-end working flow.

### Priority #2

Excellent UX/UI polish.

### Priority #3

Clean architecture.

### Priority #4

Strong AI explainability.

---

## NOT priorities

❌ Massive feature count  
❌ Complex hospital integrations  
❌ Overengineered infrastructure  
❌ Kubernetes/microservices  
❌ Fancy DevOps

---

# 3. Recommended Architecture

## FINAL RECOMMENDED STACK

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| UI components | shadcn/ui + TailwindCSS |
| Routing | React Router |
| Charts | Recharts |
| API client | Axios |
| State | Zustand or React hooks |
| Backend API | FastAPI |
| ML | Scikit-learn + joblib |
| Explainability | SHAP (TreeExplainer for tree models) |
| DB | PostgreSQL |
| ORM | SQLAlchemy |
| Migrations | Alembic |
| Auth | JWT + bcrypt |
| Containerization | Docker + Docker Compose |

---

# 4. Development Phases

---

# PHASE 0 — PROJECT INITIALIZATION

## Duration: 2-3 days

---

# OBJECTIVE

Create stable foundations BEFORE coding features.

---

# Tasks

## 0.1 Create Git Repository

### Create:

```text
medscope-ai/
```

### Configure:

- GitHub repo
    
- .gitignore
    
- README
    
- license
    

---

## 0.2 Create Global Folder Structure

```text
medscope-ai/
│
├── backend/       # FastAPI (routers, services, repositories, schemas, models, core)
├── frontend/      # React + TypeScript
├── ml/            # training, preprocessing, evaluation
├── datasets/      # clinical datasets (gitignored if large)
├── models/        # serialized model.pkl, preprocessor.pkl (gitignored)
├── notebooks/     # EDA and exploratory analysis
├── docs/
├── docker/
├── scripts/
├── skills/        # AI agent skills
└── tests/
```

---

## 0.3 Configure Development Environment

Install:

- Python 3.12
    
- Node.js LTS
    
- Docker Desktop
    
- PostgreSQL
    
- Cursor
    
- VS Code extensions
    

---

## 0.4 Create Docker Base

Initial:

- backend container
    
- postgres container
    

DO NOT dockerize frontend yet.

---

## 0.5 Create Branch Strategy

Recommended:

```text
main
develop
feature/*
```

---

# DELIVERABLE

✅ Stable technical foundation

---

# PHASE 1 — DATABASE & BACKEND FOUNDATION

## Duration: 1 week

---

# OBJECTIVE

Build backend skeleton BEFORE AI and frontend.

---

# 1.1 Setup FastAPI

Create FastAPI app in:

```text
backend/
├── routers/
├── services/
├── repositories/
├── schemas/
├── models/
└── core/
```

Do **not** use `backend/app/` nested layout.

Install:

- fastapi
    
- uvicorn
    
- sqlalchemy
    
- psycopg2
    
- alembic
    
- pydantic
    
- python-jose
    
- passlib
    

---

# 1.2 Setup PostgreSQL

Create database:

```text
medscope_ai
```

---

# 1.3 Configure SQLAlchemy

Implement:

- session.py
    
- base.py
    
- engine
    
- dependency injection
    

---

# 1.4 Create Database Models

FIRST implement ONLY (see `docs/Database/Database.md` §2):

- roles + users (admin, clinician, analyst, nurse — RF-004)
    
- predictions
    
- patient_inputs
    
- shap_explanations
    
- simulations + simulation_inputs (UC-044)
    

NOT in MVP: `analytics_snapshots`, `user_sessions`, `system_settings`.

NOT everything at once.

---

# 1.5 Configure Alembic

Generate:

- initial migration
    
- migration workflow
    

---

# 1.6 Create Authentication

Implement:

- login (RF-001, UC-001)
    
- logout (RF-002, UC-002)
    
- JWT session (RF-003)
    
- password hashing (bcrypt)
    
- role-based access middleware (UC-003)
    
- CORS configuration (RNF-033)
    

---

# 1.7 Create Initial API Structure

```text
routers/
services/
repositories/
schemas/
models/
core/
```

---

# DELIVERABLE

✅ Stable backend architecture  
✅ Authentication working  
✅ PostgreSQL connected

---

# PHASE 2 — MACHINE LEARNING PIPELINE

## Duration: 1-2 weeks

---

# OBJECTIVE

Build COMPLETE ML pipeline independently from frontend.

---

# IMPORTANT

This is where MANY projects fail.

Keep it SIMPLE.

---

# 2.1 Select Dataset

Recommended:

## Diabetes 130-US hospitals dataset

Why:

- realistic,
    
- structured,
    
- enough complexity,
    
- public,
    
- excellent for readmission prediction.
    

---

# 2.2 Create ML Notebook

Create exploratory notebooks in:

```text
notebooks/
```

(EDA notebooks live at repo root, not inside `ml/`.)

---

# 2.3 Perform EDA

Analyze:

- null values
    
- class imbalance
    
- distributions
    
- correlations
    

Generate:

- charts
    
- insights
    

SAVE THESE FOR THESIS.

---

# 2.4 Data Cleaning

Implement:

- missing values
    
- categorical encoding
    
- normalization if needed
    

---

# 2.5 Feature Engineering

Reduce scope initially.

Start with:

- age
    
- admissions
    
- medications
    
- glucose
    
- stay duration
    

---

# 2.6 Train Baseline Models

Start with:

- Logistic Regression
    
- Random Forest
    

DO NOT start with deep learning.

---

# 2.7 Evaluate Models

Metrics:

- Accuracy
    
- Recall
    
- Precision
    
- F1
    
- ROC-AUC
    

Healthcare priority:

## Recall > Accuracy

---

# 2.8 Select Final Model

Likely:

## Random Forest or XGBoost

Because:

- strong performance,
    
- SHAP compatibility,
    
- explainability.
    

---

# 2.9 Serialize Model

Generate:

```text
model.pkl
preprocessor.pkl
```

---

# 2.10 Implement SHAP

Generate:

- feature importance (RIA-030, UC-030)
    
- explanation vectors
    
- textual clinical summary for API responses (RF-032, UC-032)

Use **TreeExplainer** for tree-based models (Requirements §16).
    

---

# DELIVERABLE

✅ Working trained model  
✅ SHAP explanations  
✅ Serialized inference-ready model

---

# PHASE 3 — ML + BACKEND INTEGRATION

## Duration: 4-5 days

---

# OBJECTIVE

Connect FastAPI with trained model.

---

# 3.1 Create Prediction Service

```text
services/prediction_service.py
```

---

# 3.2 Load Model at Startup

DO NOT retrain dynamically.

Load:

```python
joblib.load()
```

once.

---

# 3.3 Create /predict Endpoint

Flow:

```text
input
→ preprocess
→ model.predict
→ shap
→ response
```

---

# 3.4 Create Prediction Persistence

Save:

- prediction
    
- patient input
    
- SHAP values
    

---

# 3.5 Create /simulate Endpoint

POST `/simulate` (RBE-011, UC-040–043):

- modify selected features
    
- rerun inference
    
- return original vs simulated score comparison (RF-042)
    
- persist simulation record (UC-044)

---

# 3.6 Create /history Endpoint

GET `/history` (RBE-012, UC-050–052):

- list past predictions
    
- filter by date, risk level, user (RF-051)

---

# 3.7 Create /analytics Endpoint

GET `/analytics` (RBE-014, UC-060–062):

- aggregated metrics and trends
    
- risk distribution data for charts

---

# 3.8 Performance & logging

- prediction latency target: **< 1 s** (RNF-001)
    
- backend error logging (RNF-050)
    
- ML error logging (RNF-051)

---

# DELIVERABLE

✅ Full AI backend working (all RBE endpoints)

---

# PHASE 4 — FRONTEND FOUNDATION

## Duration: 1 week

---

# OBJECTIVE

Build visual shell BEFORE advanced features.

---

# 4.1 Setup React

Use:

## Vite + React + TypeScript

---

# 4.2 Install UI Stack

Install:

- Tailwind
    
- shadcn/ui
    
- Recharts
    
- Axios
    
- React Router
    

---

# 4.3 Build Layout System

Create:

- sidebar
    
- topbar
    
- page containers
    
- responsive layout
    

---

# 4.4 Create Theme

Implement tokens from `docs/Design/design-system.light.md`:

- map YAML colors to Tailwind config
    
- Inter + JetBrains Mono fonts
    
- 8px spacing grid
    
- risk colors (green / amber / red)

Reference mockup: `docs/Design/screens/splash/light.png` (RFW-010).

Dark theme (`design-system.dark.md`) is post-MVP optional.
    

---

# 4.5 Implement Authentication UI

Screens:

- splash
    
- login
    

---

# DELIVERABLE

✅ Professional frontend skeleton

---

# PHASE 5 — CORE CLINICAL FEATURES

## Duration: 2 weeks

---

# OBJECTIVE

Build the MAIN wow-factor functionality.

---

# 5.1 Dashboard

Implement:

- KPI cards
    
- trends
    
- recent evaluations
    

---

# 5.2 Prediction Form

Build:

- patient form
    
- validations
    
- API integration
    

---

# 5.3 Prediction Result Screen

MOST IMPORTANT PAGE.

Must look amazing.

Include:

- risk gauge
    
- score
    
- severity
    
- explanation
    
- charts
    

---

# 5.4 SHAP Visualization

Create:

- horizontal bars
    
- color-coded impacts
    

---

# 5.5 Simulation Interface

Implement:

- sliders
    
- instant recalculation
    
- side-by-side comparison
    

THIS IS YOUR WOW FEATURE.

---

# DELIVERABLE

✅ Full end-to-end user flow

---

# PHASE 6 — ANALYTICS & HISTORY

## Duration: 4-5 days

---

# 6.1 History screen (RFW-018)

- list evaluations (UC-050)
    
- search and filters (RF-051, UC-051)
    
- open historical prediction detail (RF-052, UC-052)

---

# 6.2 Analytics dashboard (RFW-017)

- trends and histograms (RF-060, UC-061)
    
- risk category distribution (UC-062)
    
- temporal filters (RF-061)
    
- executive KPIs (RF-062)

---

# 6.3 Settings navigation

- sidebar link to settings (RF-012) — placeholder or minimal config OK for MVP

---

# 6.4 Admin (optional — post-MVP)

RF-070 / RF-071 / UC-070–071: implement only if time permits.  
For MVP, seed users via migration (Requirements §18).

---

# 6.5 Optional backlog (T-X05–T-X07)

**Duration:** 1–2 weeks (after Phase 6, parallel or before Phase 9 demo)

**Plan:** [Optional-Backlog-Plan.md](../Optional%20Features/Optional-Backlog-Plan.md)

## Order

1. **T-X05** Support UI — frontend only, US-040
2. **T-X06** Audit avanzado — migration + API + Settings tab, US-041
3. **T-X07** Multi-model — read-only ML metrics API + UI, US-042

## Deliverables

- `/support` + sidebar link (RF-072, RF-073)
- `audit_logs` + `GET /admin/audit-logs` (RF-074, RF-075)
- `GET /ml/models/comparison` + Models panel (RF-076, RF-077)
- Manual tests Phase-07 + RTS-040–042

---

# DELIVERABLE

✅ Enterprise feel achieved  
✅ MVP scope complete (Requirements §17)

---

# PHASE 7 — POLISH & HARDENING

## Duration: 1 week

---

# OBJECTIVE

Transform project from “student project”  
to:

## “professional platform”

---

# 7.1 UI Polish

Improve:

- spacing
    
- typography
    
- animations
    
- shadows
    
- consistency
    

---

# 7.2 Error Handling

Implement:

- backend exceptions
    
- loading states
    
- validation messages
    

---

# 7.3 Performance

Optimize:

- API calls
    
- rendering
    
- charts
    

---

# 7.4 Testing

Follow `docs/Testing/Testing.md` for full strategy, folder structure, and examples.

Test critical flows (Requirements §12, Use Cases §17):

- auth (login, logout, roles — UC-001–003)
    
- predictions end-to-end (UC-020–023)
    
- SHAP in API response (UC-030)
    
- DB persistence
    
- simulation and comparison (UC-040–044)
    
- history and analytics APIs
    
- invalid input handling (UC-090)

Target: 60–75% backend coverage.
    

---

# 7.5 Docker Finalization

Complete:

- docker-compose
    
- environment variables
    

---

# DELIVERABLE

✅ Production-quality MVP

---

# PHASE 8 — THESIS & DEFENSE PREPARATION

## Duration: parallel + final week

---

# VERY IMPORTANT

DO NOT leave documentation for the end.

---

# Continuously save:

## Screenshots

- dashboards
    
- SHAP
    
- simulations
    

## Metrics

- model evaluation
    
- architecture diagrams
    

## Charts

- EDA
    
- performance
    

---

# Create:

- architecture diagram
    
- ML pipeline diagram
    
- DB ER diagram
    
- deployment diagram
    

---

# PHASE 9 — FINAL DEMO PREPARATION

## Duration: final days

---

# Create PERFECT demo scenario

Prepare:

- preloaded users
    
- preloaded predictions
    
- stable dataset
    
- no random failures
    

---

# Demo Flow

```text
Login
→ Dashboard
→ New Prediction
→ SHAP Explanation
→ Simulation
→ History
→ Analytics
```

Aligns with Requirements §17 MVP and Use Cases §17 P0 list.

---

# 5 MOST IMPORTANT ENGINEERING RULES

---

# RULE 1 — Build incrementally

NEVER:

- giant feature branches
    
- huge rewrites
    

ALWAYS:  
small iterations.

---

# RULE 2 — End-to-end first

Before polishing:  
ensure COMPLETE FLOW works.

---

# RULE 3 — Prioritize visual quality

For TFM:  
visual polish matters A LOT.

---

# RULE 4 — Avoid overengineering

DO NOT:

- microservices
    
- Kafka
    
- Kubernetes
    
- distributed systems
    

Keep:

- monolith backend
    
- clean architecture
    

---

# RULE 5 — Your WOW factor is:

## Explainable AI + Simulation

THAT is what makes your project memorable.

---

# Suggested Weekly Timeline

|Week|Goal|
|---|---|
|Week 1|Setup + backend foundation|
|Week 2|ML pipeline|
|Week 3|ML integration|
|Week 4|Frontend foundation|
|Week 5|Prediction + SHAP|
|Week 6|Simulation + analytics|
|Week 7|Polish + testing|
|Week 8|Thesis + defense|

---

# Final Advice

The difference between:

## average TFM

and

## outstanding TFM

is usually NOT:

- more AI,
    
- more complexity,
    
- more infrastructure.
    

It is:

- clarity,
    
- polish,
    
- explainability,
    
- execution quality,
    
- visual professionalism,
    
- coherent architecture.
    

Your project idea is already strong enough to become an exceptional TFM if executed cleanly.

---

# Appendix A — Requirements Coverage Matrix

| Requirement area | Execution Plan phase | Status |
|---|---|---|
| Auth RF-001–004, UC-001–003 | Phase 1, 4 | Covered |
| Dashboard RF-010–012, UC-010–012 | Phase 5.1 | Covered |
| Evaluation RF-020–023, UC-020–023 | Phase 5.2–5.3 | Covered |
| SHAP RF-030–032, UC-030–032 | Phase 2.10, 5.4 | Covered |
| Simulation RF-040–043, UC-040–044 | Phase 3.5, 5.5 | Covered |
| History RF-050–052, UC-050–052 | Phase 3.6, 6.1 | Covered |
| Analytics RF-060–062, UC-060–062 | Phase 3.7, 6.2 | Covered |
| Admin RF-070–071, UC-070–071 | Phase 6.4 (optional) | Post-MVP |
| Support RF-072–073, UC-064–065 | Phase 6.5 (T-X05) | Planned |
| Audit RF-074–075, UC-081/085 | Phase 6.5 (T-X06) | Planned |
| ML compare RF-076–077, RIA-040–041, UC-084 | Phase 6.5 (T-X07) | Planned |
| Export PDF UC-063 | Phase 6.2 / T-X04 | Done |
| API RBE-010–014 | Phase 3 | Covered |
| Performance RNF-001–002 | Phase 3.8, 7.3 | Covered |
| Security RNF-030–034 | Phase 1 | Covered |
| ML RIA-001–031 | Phase 2–3 | Covered |
| Frontend screens RFW-010–018 | Phase 4–6 | Covered |
| Frontend optional RFW-024–026 | Phase 6.5 | Planned |
| Design system RUX-010–011 | `docs/Design/` | Covered |
| Docker RDO-001–002 | Phase 0, 7.5 | Covered |
| Thesis RAC-001–010 | Phase 8 | Covered |
| Testing RTS-001–030 | Phase 7.4 | `docs/Testing/Testing.md` |
| Testing RTS-040–042 | Phase 6.5 | `docs/Testing/Manual/Phase-07-*.md` |
| Database RDB-001–020 | Phase 1 | `docs/Database/Database.md` |

---

# Appendix B — Use Case Implementation Order

Matches `docs/Use Cases/Use Cases.md` §19:

1. Authentication (Phase 1 + 4)
2. Prediction backend (Phase 2–3)
3. Prediction frontend (Phase 5.2–5.3)
4. SHAP explanations (Phase 5.4)
5. Simulation engine (Phase 5.5)
6. Persistence / history (Phase 3.6 + 6.1)
7. Analytics dashboard (Phase 3.7 + 6.2)
8. Polish / UI (Phase 7)