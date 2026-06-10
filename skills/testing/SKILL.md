---
name: medscope-testing
description: >-
  Testing strategy for MedScope AI. Use for pytest API tests, ML validation,
  frontend tests, and Playwright E2E flows.
---

# Skill — Testing & QA

## Purpose

This skill governs testing across `backend/`, `frontend/`, and `ml/`.

## Project documentation

Consult before implementing:
- `docs/Requirements/Requirements.md` — §12 (testing), §17 (MVP)
- `docs/Use Cases/Use Cases.md` — all UC flows for critical paths

---

# Stack

| Layer | Tools |
|---|---|
| Backend | pytest, pytest-cov, httpx |
| Frontend | vitest, react-testing-library |
| E2E | playwright |

---

# Priorities

1. API endpoint tests (RTS-001)
2. Input validation tests (RTS-002)
3. Integration tests (full prediction pipeline)
4. E2E critical user flows
5. ML metric validation (RTS-010)
6. Basic frontend navigation (RTS-020)

Lower priority: pixel-perfect UI tests.

---

# Critical flows (must test)

- login / logout (UC-001–002)
- role authorization (UC-003)
- prediction end-to-end (UC-020–023)
- SHAP in response (UC-030)
- simulation and comparison (UC-040–043)
- history search and detail (UC-050–052)
- analytics endpoint (UC-060)
- invalid input handling (UC-090)

---

# Coverage

Target: **60–75%** backend coverage.

Use pragmatic testing — focus on reliability of MVP flows, not exhaustive mocks.
