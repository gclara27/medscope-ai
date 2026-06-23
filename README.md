# MedScope AI

Intelligent Clinical Risk Prediction & Decision Support Platform (TFM).

Stack: **FastAPI** · **PostgreSQL** · **React/TypeScript** · **Scikit-learn** · **SHAP** · **Docker**

Product and architecture docs live in [`docs/`](docs/) and [`AGENTS.md`](AGENTS.md).

---

## Prerequisites

| Tool | Version | Used for |
|------|---------|----------|
| [Python](https://www.python.org/downloads/) | 3.12+ | Backend, ML, notebooks |
| [Node.js](https://nodejs.org/) | 20 LTS+ | Frontend (React) |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | latest | PostgreSQL + backend in containers |
| Git | latest | Version control |

**Windows (winget):**

```powershell
winget install Python.Python.3.12
winget install OpenJS.NodeJS.LTS
winget install Docker.DockerDesktop
```

After installing Docker Desktop, start it and wait until the engine is running (whale icon in the system tray).

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

```powershell
.\scripts\start-dev.ps1
```

Or:

```powershell
.\dev.ps1
# or
dev.bat
```

This script:

1. Starts PostgreSQL in Docker (detached)
2. Stops the Docker **backend** container if running (frees port 8000 for local uvicorn)
3. Runs `alembic upgrade head`
4. Opens a **new terminal** for the backend (`uvicorn` on port 8000, with full ML stack)
5. Opens a **new terminal** for the frontend (`npm run dev` on port 5173)

Then open http://localhost:5173/login

### Stop everything

```powershell
.\stop.bat
```

Or:

```powershell
.\stop.ps1
# same as .\scripts\stop-dev.ps1
```

Stops processes on ports **8000** (backend) and **5173** (frontend), closes **MedScope AI** dev terminal windows if still open, and runs `docker compose down` (PostgreSQL data is kept in the Docker volume).

**Requires Docker Desktop running** before `start-dev.ps1`.

---

## Quick start (Docker — recommended)

Runs PostgreSQL and the FastAPI backend. Frontend is not dockerized yet (see [EP-0.4](docs/Execution%20Plan/ExecutionPlan.md#04-create-docker-base)).

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

Detached mode:

```bash
docker compose up --build -d
```

### 3. Verify

| Service | URL / endpoint |
|---------|----------------|
| Backend API | http://localhost:8000 |
| Health check | http://localhost:8000/health → `{"status":"ok","ml_ready":true}` |
| API docs (Swagger) | http://localhost:8000/docs |
| Predict (JWT) | `POST /auth/login` then `POST /predict` — see [Manual Phase 03](docs/Testing/Manual/Phase-03-ML-Backend-Integration.md) |
| PostgreSQL | `localhost:5432` — DB `medscope_ai`, user `medscope` |

```bash
docker compose ps
curl http://localhost:8000/health
```

### 4. Stop

```bash
docker compose down          # stop containers
docker compose down -v       # stop and remove database volume
```

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
| **prod** | Managed PostgreSQL | Cloud / VPS — separate `.env`, never dev credentials |

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

# Backend (93 tests)
cd backend
pytest

# ML (80 passed + 1 xfail esperado)
cd ..\ml
pytest

# Frontend (22 tests)
cd ..\frontend
npm run test
npm run lint
```

See [Testing strategy](docs/Testing/Testing.md) for manual checklists per phase (`docs/Testing/Manual/`).

---

## Environment variables

Copy [`.env.example`](.env.example) to `.env`:

| Variable | Description |
|----------|-------------|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Database credentials |
| `POSTGRES_PORT` | Host port for PostgreSQL (default `5432`) |
| `DATABASE_URL` | SQLAlchemy connection string |
| `BACKEND_PORT` | Host port for API (default `8000`) |
| `JWT_SECRET` | Signing key for JWT (change in production) |
| `JWT_ALGORITHM` | Default `HS256` |
| `JWT_EXPIRE_MINUTES` | Token lifetime |
| `CORS_ORIGINS` | Comma-separated frontend origins |

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
├── docker-compose.yml  # postgres + backend
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
| [Task Tracker](docs/TaskTracker.md) | MVP task checklist |

---

## Troubleshooting

**`docker` not found** — Restart the terminal after installing Docker Desktop, or add Docker to `PATH`:

`C:\Program Files\Docker\Docker\resources\bin`

**Port already in use** — Change `BACKEND_PORT` or `POSTGRES_PORT` in `.env` and restart compose.

**Backend cannot connect to DB** — With Docker, use host `postgres` inside containers and `localhost` on the host. Check `docker compose ps` shows postgres as `healthy`.

**WSL2 (Windows)** — Docker Desktop requires WSL2. Run `wsl --status` and ensure a distribution (e.g. Ubuntu) is installed.
