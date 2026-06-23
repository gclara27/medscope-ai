---
name: medscope-testing
description: >-
  Testing strategy for MedScope AI. Use for pytest API tests, ML validation,
  frontend tests, and Playwright E2E flows.
---

# Skill — Testing & QA

## Purpose

This skill governs testing across `backend/`, `frontend/`, `ml/`, and `tests/e2e/`.

## Project documentation

Consult before implementing:
- `docs/Testing/Testing.md` — **primary** testing strategy, structure, examples
- `docs/Requirements/Requirements.md` — §12 (RTS-*)
- `docs/Use Cases/Use Cases.md` — UC flows for critical paths
- `docs/Execution Plan/ExecutionPlan.md` — Phase 7.4

---

# Stack

| Layer | Tools | Location |
|---|---|---|
| Backend | pytest, pytest-cov, httpx | `backend/tests/` |
| ML | pytest | `ml/tests/` |
| Frontend | vitest, @testing-library/react | `frontend/src/**/*.test.tsx` |
| E2E | playwright | `tests/e2e/` |
| Lint | Ruff (Python), ESLint (TS/React) | `pyproject.toml`, `frontend/eslint.config.js`, `scripts/lint.ps1` |

---

# Priorities

1. API endpoint tests (RTS-001) — `/auth/login`, `/predict`, `/simulate`, `/history`, `/analytics`
2. Input validation (RTS-002, UC-090)
3. Integration tests (API + DB + ML)
4. E2E MVP flow (UC-001 through UC-060)
5. ML metrics + SHAP (RTS-010)
6. Basic frontend navigation (RTS-020)

Lower priority: pixel-perfect UI tests.

---

# Critical flows (must test)

- login / logout / roles (UC-001–003)
- prediction + SHAP in response (UC-020–030)
- simulation comparison (UC-040–044)
- history search and detail (UC-050–052)
- analytics endpoint (UC-060)
- invalid input handling (UC-090)

E2E flow: `login → dashboard → prediction → SHAP → simulation → history → analytics`

---

# Coverage

Target: **60–75%** backend coverage (`pytest --cov=backend`).

Use SQLite in-memory for fast unit tests; optional Docker PostgreSQL for integration.

Pragmatic testing — focus on MVP reliability, not exhaustive mocks.

---

# Lint

Run from repo root before commit or demo:

```powershell
.\scripts\lint.ps1
```

| Tool | Scope | Config |
|---|---|---|
| Ruff | `backend/`, `ml/` | `pyproject.toml` (line length 120) |
| ESLint | `frontend/` | `frontend/eslint.config.js` |

Fix Python formatting: `ruff format backend ml`. Fix frontend: `cd frontend && npm run lint:fix`.
