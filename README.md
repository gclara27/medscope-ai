# MedScope AI

Intelligent Clinical Risk Prediction & Decision Support Platform (TFM).

Stack: **FastAPI** · **PostgreSQL** · **React/TypeScript** · **Scikit-learn** · **SHAP** · **Docker**

Product and architecture docs live in [`docs/`](docs/) and [`AGENTS.md`](AGENTS.md).

---

## About MedScope AI

**MedScope AI** is a web-based **Clinical Decision Support System (CDSS)** for predicting **30-day hospital readmission risk** in diabetes patients. It is not a diagnostic tool — it supports clinicians with:

- AI risk prediction (&lt; 1 s inference)
- **SHAP** explainability (why the risk is high or low)
- **What-if clinical simulation** (change glucose, prior admissions, etc.)
- Prediction **history** and population **analytics**
- Role-based access (admin, clinician, analyst, nurse)
- Public **guided demo** at `/demo` (no login)

Trained on the public UCI *Diabetes 130-US hospitals* dataset; deployed to production for the TFM demo.

Full narrative: [docs/MedScope AI General Description.md](docs/MedScope%20AI%20General%20Description.md)

---

## Main features

| Feature | Description |
|---------|-------------|
| Authentication | Email + password, JWT, four roles |
| Dashboard | KPIs, high-risk alerts, recent activity |
| Clinical evaluation | Patient form + demo clinical scenarios |
| AI prediction | Readmission risk score, low/medium/high band |
| SHAP explanations | Feature contributions + clinical summary |
| Simulation | Compare original vs simulated risk (what-if) |
| History | Searchable prediction log with detail view |
| Analytics | Aggregated metrics and trends |
| Public demo | Guided tour at `/demo` without credentials |
| Cloud deploy | Vercel + Render + Supabase (live MVP) |

---

## TFM delivery (Fundae / BIG School)

**Author (TFM):** Gastón Clara  
**Compliance checklist:** [docs/Thesis/Entrega-TFM-Fundae.md](docs/Thesis/Entrega-TFM-Fundae.md)  
**Delivery deadline (syllabus):** 20 July 2026

### Campus form — copy/paste

| Field | Value |
|-------|-------|
| **Student name** | Gastón Clara |
| **GitHub repository** | https://github.com/gclara27/medscope-ai |
| **Live app (deploy URL)** | https://medscope-ai-delta.vercel.app |
| **Public demo (no login)** | https://medscope-ai-delta.vercel.app/demo |
| **API health** | https://medscope-ai-q8tg.onrender.com/health |
| **Slides URL** | https://drive.google.com/drive/folders/1LsHgjSsfbFv8gPR6sSTxAiHCUAMWvCng?usp=drive_link (`MedScope-AI-TFM.pptx`) |
| **Video URL** | https://drive.google.com/drive/folders/1LsHgjSsfbFv8gPR6sSTxAiHCUAMWvCng?usp=drive_link (`PresentacionMedScopeAi2.mp4`) |
| **Demo user** | `clinician@medscope.ai` |
| **Demo password** | `MedScope123!` |

Media folder (slides + vídeo): [MedScopeAi — Google Drive](https://drive.google.com/drive/folders/1LsHgjSsfbFv8gPR6sSTxAiHCUAMWvCng?usp=drive_link).

### Pre-submission checklist

| Step | Status | Action |
|------|--------|--------|
| Slides in repo | Done | [`docs/Thesis/slides/MedScope-AI-TFM.pptx`](docs/Thesis/slides/MedScope-AI-TFM.pptx) |
| Upload slides + URL | Done | [Google Drive](https://drive.google.com/drive/folders/1LsHgjSsfbFv8gPR6sSTxAiHCUAMWvCng?usp=drive_link) |
| Record defense video | Done | `PresentacionMedScopeAi2.mp4` (screen capture + voice) |
| Upload video + URL | Done | Same [Drive folder](https://drive.google.com/drive/folders/1LsHgjSsfbFv8gPR6sSTxAiHCUAMWvCng?usp=drive_link) |
| GitHub repo public | Done | [github.com/gclara27/medscope-ai](https://github.com/gclara27/medscope-ai) |
| Production stability | Done | `.\scripts\verify-demo-stability.ps1 -Production` (T-906) |
| Demo backup (USB) | Pending | `.\scripts\backup-demo-media.ps1 --video <path-to-mp4>` then copy `.zip` to external drive |
| Campus form | Pending | Submit before **20/07/2026** (add your BIG School enrolment email) |
| Incognito smoke test | Pending | Login + predict at live URL without cached session |

**Slides content (ready to copy to PowerPoint):** [docs/Thesis/Slides-Presentacion-Video.md](docs/Thesis/Slides-Presentacion-Video.md)  
**Video script (screen + voice + optional camera):** [docs/Thesis/Guion-Video-Defensa.md](docs/Thesis/Guion-Video-Defensa.md)  
**Thesis memory draft:** [docs/Thesis/Memoria-TFM.md](docs/Thesis/Memoria-TFM.md)

> **Before submission:** warm up the API 2–3 min before demo (`/health` → `ml_ready: true`). Render free tier may cold-start 30–90 s.

---

## Prerequisites

| Tool | Version | Used for |
|------|---------|----------|
| [Python](https://www.python.org/downloads/) | 3.12+ | Backend, ML, notebooks |
| [Node.js](https://nodejs.org/) | 20 LTS+ | Frontend (React) |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) **or** [Podman Desktop](https://podman-desktop.io/) | latest | PostgreSQL in containers (dev) |
| Git | latest | Version control |

**Windows (winget):**

```powershell
winget install Python.Python.3.12
winget install OpenJS.NodeJS.LTS
winget install Docker.DockerDesktop
```

After installing Docker Desktop, start it and wait until the engine is running (whale icon in the system tray).

**Podman (alternative to Docker Desktop):** install Podman Desktop, run `podman machine start`, then `pip install podman-compose`. Use `.\dev-podman.bat` instead of `.\dev.bat`. See [docs/Environment/Environment.md](docs/Environment/Environment.md).

**Verify:**

```bash
python --version    # 3.12.x
node --version      # v20.x or v22.x
npm --version
docker --version
docker compose version
```

---

## One-command dev start (Windows)

Scripts in [`scripts/`](scripts/) automate PostgreSQL, migrations, backend, and frontend.

### First time only

```powershell
.\scripts\setup-dev.ps1
```

Creates `.env`, Python `.venv`, and installs backend + frontend dependencies.

### Every day — start everything

From the repo root in Cursor (or any PowerShell terminal):

**Docker Desktop:**

```powershell
.\dev.bat
```

**Podman:**

```powershell
.\dev-podman.bat
```

Or directly:

```powershell
.\scripts\start-dev.ps1 -Runtime docker   # Docker
.\scripts\start-dev.ps1 -Runtime podman   # Podman
```

This script:

1. Starts PostgreSQL in a container (detached)
2. Stops the container **backend** if running (frees port 8000 for local uvicorn)
3. Runs `alembic upgrade head`
4. Opens a **new terminal** for the backend (`uvicorn` on port 8000, with full ML stack)
5. Opens a **new terminal** for the frontend (`npm run dev` on port 5173)

Then open http://localhost:5173/login

### Stop everything

```powershell
.\stop.bat          # Docker
.\stop-podman.bat   # Podman
```

Or:

```powershell
.\scripts\stop-dev.ps1 -Runtime docker
.\scripts\stop-dev.ps1 -Runtime podman
```

Stops processes on ports **8000** (backend) and **5173** (frontend), closes **MedScope AI** dev terminal windows if still open, and runs compose down (PostgreSQL data is kept in the volume).

**Requires the container engine running** before start (`Docker Desktop` or `podman machine start`).

---

## Quick start (Docker — recommended)

Runs **PostgreSQL**, **FastAPI backend**, and **React frontend** (nginx + API proxy).

### 1. Clone and configure environment

```bash
git clone <repository-url>
cd medscope-ai
cp .env.example .env
```

Edit `.env` if you need non-default ports or credentials. Defaults work for local development.

### 2. Start services

```bash
docker compose up --build
```

Windows helper (prepares ML artifacts, starts detached, waits for health):

```powershell
.\scripts\docker-up.ps1    # Docker
.\scripts\podman-up.ps1    # Podman
```

Detached mode (raw Compose):

```bash
docker compose up --build -d
```

### 3. Verify

| Service | URL / endpoint |
|---------|----------------|
| **Frontend UI** | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Health check | http://localhost:8000/health → `{"status":"ok","ml_ready":true}` |
| API docs (Swagger) | http://localhost:8000/docs |
| Predict (JWT) | `POST /auth/login` then `POST /predict` — see [Manual Phase 03](docs/Testing/Manual/Phase-03-ML-Backend-Integration.md) |
| PostgreSQL | `localhost:5432` — DB `medscope_ai`, user `medscope` |

Demo login (seed data): `clinician@medscope.ai` / `MedScope123!`

```bash
docker compose ps
curl http://localhost:8000/health
```

Verify full stack (health + nginx proxy + demo login):

```powershell
.\scripts\verify-docker-stack.ps1
.\scripts\verify-podman-stack.ps1
```

The frontend container serves the built React app and proxies API routes (`/auth`, `/predict`, `/simulate`, etc.) to the backend service.

### 4. Stop

```bash
docker compose down          # stop containers
docker compose down -v       # stop and remove database volume
```

---

## Production deployment (cloud)

**Live MVP (julio 2026):**

| Component | URL |
|-----------|-----|
| **Frontend (app)** | https://medscope-ai-delta.vercel.app |
| **App (login)** | https://medscope-ai-delta.vercel.app/login |
| **API** | https://medscope-ai-q8tg.onrender.com |
| **Health** | https://medscope-ai-q8tg.onrender.com/health |
| **API docs** | https://medscope-ai-q8tg.onrender.com/docs |

Stack: **Supabase** (PostgreSQL) + **Render** (FastAPI + ML, Docker) + **Vercel** (React).

Step-by-step guide, troubleshooting, and env vars: **[docs/Deployment/Deployment.md](docs/Deployment/Deployment.md)**.

Before the first cloud deploy, run `.\scripts\prepare-docker-build.ps1` and commit the production files under `models/` (`model.pkl`, `preprocessor.pkl`, `model_manifest.json`, `shap_background.npy`, `demo_golden_predictions.json`, `baseline_comparison.json`, `xgboost_evaluation.json`).

Environment variables reference: [docs/Environment/Environment.md](docs/Environment/Environment.md).

**CI/CD:** push to `main` triggers GitHub Actions (pytest + vitest), Render rebuild, and Vercel rebuild. Use PRs to `main` (branch protection).

---

## Local development (without Docker)

Use this when you want to run the backend or ML code directly on the host.

### Python virtual environment

```bash
# From repo root
python -m venv .venv

# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate
```

### Backend

```bash
pip install -r backend/requirements.txt
cd backend
uvicorn main:app --reload --port 8000
```

You still need PostgreSQL running. Either:

- start only the database: `docker compose up postgres -d`, or  
- use a local PostgreSQL instance and set `DATABASE_URL` in `.env`.

### Install Python dependencies

**Option A — full local stack** (backend + ML + tests + notebooks):

```bash
pip install -r requirements.txt
```

**Option B — install only what you need:**

```bash
pip install -r backend/requirements.txt   # API only
pip install -r ml/requirements.txt        # training / evaluation only
```

| File | Scope |
|------|-------|
| `requirements.txt` | Dev environment: includes backend + ML + pytest + Jupyter |
| `backend/requirements.txt` | Runtime API deps (used by `backend/Dockerfile`) |
| `ml/requirements.txt` | Training, preprocessing, SHAP, model artifacts |

### Frontend

The React app lives in `frontend/`. Once the scaffold is in place (Vite + React + TypeScript):

```bash
cd frontend
npm install
npm run dev
```

Default dev server: http://localhost:5173 (allowed in `CORS_ORIGINS`).

---

## Environments (dev / test / prod)

MedScope AI uses a **local PostgreSQL database for development and testing** before deploying to production. Same engine everywhere; only configuration changes (RDO-010).

| Environment | Database | How |
|-------------|----------|-----|
| **dev** | PostgreSQL (`medscope_ai`) | `docker compose up` — daily development, Alembic migrations |
| **test** | SQLite in memory | Fast unit tests (`pytest` in `backend/tests/`) |
| **test** (integration) | PostgreSQL in Docker | Optional — real SQL, migrations, API + DB flows |
| **prod** | Managed PostgreSQL (Supabase) | [Deployment.md](docs/Deployment/Deployment.md) | Live TFM demo — `DATABASE_URL` only in Render |

### Connection strings

| Context | `DATABASE_URL` host |
|---------|---------------------|
| Backend **inside** Docker | `postgres` |
| Backend **on host** (uvicorn) | `localhost` |
| SQL client (DBeaver, psql) | `localhost:5432` |

### Typical workflow

```text
Develop  →  local PostgreSQL (Docker) + .env from .env.example
Test     →  SQLite (unit) + optional PostgreSQL Docker (integration)
Deploy   →  production PostgreSQL; change DATABASE_URL and JWT_SECRET only
```

`docker-compose.yml` is for **development only**. Production uses a separate deployment with its own environment variables.

Full detail: [Database doc — §1.1 Environments](docs/Database/Database.md#11-entornos-dev--test--prod) · [Testing strategy](docs/Testing/Testing.md).

---

## Lint and tests

Static analysis and automated tests (reference counts, jun 2026):

```powershell
# Lint (Python + frontend)
.\scripts\lint.ps1

# Backend (215+ tests; coverage gate 60%+)
.\scripts\test-backend.ps1

# Backend rápido sin coverage
cd backend
pytest

# ML (80 passed + 1 xfail esperado)
cd ..\ml
pytest

# Frontend (RTS-020 vitest)
.\scripts\test-frontend.ps1

# E2E Playwright (RTS-030) — start dev stack first: .\scripts\start-dev.ps1
.\scripts\test-e2e.ps1

# Frontend manual
cd frontend
npm run test
npm run lint
npm run build
```

See [Testing strategy](docs/Testing/Testing.md) for manual checklists per phase (`docs/Testing/Manual/`).

---

## Environment variables

Full reference: **[docs/Environment/Environment.md](docs/Environment/Environment.md)** (RDO-010, T-710).

```powershell
copy .env.example .env
copy frontend\.env.example frontend\.env   # optional for Vite
```

| Variable | Description |
|----------|-------------|
| `POSTGRES_*` | PostgreSQL credentials and host port (Docker) |
| `DATABASE_URL` | SQLAlchemy URL (`localhost` on host, `postgres` in containers) |
| `BACKEND_PORT` / `FRONTEND_PORT` | Published ports for Docker Compose |
| `JWT_SECRET` / `JWT_*` | JWT signing (change secret in production) |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `VITE_API_BASE_URL` | Frontend API base (`frontend/.env`; empty = proxy) |

Never commit `.env` — it is listed in `.gitignore`.

---

## Repository layout

```text
medscope-ai/
├── AGENTS.md           # AI agent operating system
├── backend/            # FastAPI application
├── frontend/           # React dashboard
├── ml/                 # Training, preprocessing, evaluation
├── datasets/           # Clinical datasets (large files not committed)
├── docs/               # Requirements, use cases, database, testing, design
├── skills/             # Domain skills for AI-assisted development
├── docker-compose.yml  # postgres + backend + frontend
└── tests/              # Cross-cutting tests (e2e)
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| [AGENTS.md](AGENTS.md) | Agent rules and skill routing |
| [Requirements](docs/Requirements/Requirements.md) | Functional and technical requirements |
| [Execution Plan](docs/Execution%20Plan/ExecutionPlan.md) | Phased delivery plan |
| [Database](docs/Database/Database.md) | Schema and persistence |
| [Testing](docs/Testing/Testing.md) | Automated tests, lint, manual checklists |
| [Deployment](docs/Deployment/Deployment.md) | Production cloud deploy (Supabase + Render + Vercel) |
| [Demo Playbook](docs/Demo/Demo-Playbook-Plan.md) | Clinical scenarios + simulation animation (defense) |
| [Task Tracker](docs/TaskTracker.md) | MVP task checklist |
| [TFM delivery (Fundae)](docs/Thesis/Entrega-TFM-Fundae.md) | Submission checklist, form fields, gaps |
| [Thesis / video script](docs/Thesis/Guion-Video-Defensa.md) | Defense video narration |

---

## Troubleshooting

**`docker` not found** — Restart the terminal after installing Docker Desktop, or add Docker to `PATH`:

`C:\Program Files\Docker\Docker\resources\bin`

**Port already in use** — Change `BACKEND_PORT` or `POSTGRES_PORT` in `.env` and restart compose.

**Backend cannot connect to DB** — With Docker, use host `postgres` inside containers and `localhost` on the host. Check `docker compose ps` shows postgres as `healthy`.

**WSL2 (Windows)** — Docker Desktop requires WSL2. Run `wsl --status` and ensure a distribution (e.g. Ubuntu) is installed.
