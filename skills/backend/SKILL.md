---
name: medscope-backend
description: >-
  FastAPI backend for MedScope AI. Use for REST APIs, JWT auth, prediction
  pipeline, simulation endpoints, services, repositories, and error handling.
---

# Skill — Backend Engineering

## Purpose

This skill governs backend implementation in `backend/`.

Stack: FastAPI, SQLAlchemy, PostgreSQL, JWT, bcrypt, Alembic.

## Project documentation

Consult before implementing:
- `docs/Database/Database.md` — schema, persistence flows, repositories
- `docs/Requirements/Requirements.md` — §5 (functional), §9 (backend), §6.4 (security)
- `docs/Use Cases/Use Cases.md` — UC-001–003, UC-080–083, UC-090–091

---

# Architecture

```
backend/
├── routers/
├── services/
├── repositories/
├── schemas/
├── models/
└── core/
```

---

# Rules

- routers remain thin
- services contain business logic
- repositories contain DB access
- schemas validate requests/responses (Pydantic)
- use dependency injection
- expose OpenAPI/Swagger automatically

---

# Required endpoints

| Method | Path | Requirement |
|---|---|---|
| POST | `/auth/login` | RBE-013 |
| POST | `/predict` | RBE-010 |
| POST | `/simulate` | RBE-011 |
| GET | `/history` | RBE-012 |
| GET | `/analytics` | RBE-014 |

---

# Prediction flow

```
request → schema validation → preprocessing → prediction → SHAP → persistence → response
```

Target latency: **< 1 second** (RNF-001).

---

# Authentication

- JWT for session persistence (RF-003)
- bcrypt for password hashing
- role-based access: `admin`, `clinician`, `analyst`, `nurse`
- protect routes by role (UC-003)

---

# Error handling

- return structured JSON errors
- never expose stack traces to clients
- use global exception handlers
- log errors server-side (RNF-050)

---

# Security

- validate all input on backend (RNF-032)
- configure CORS (RNF-033)
- never store PHI or real patient identifiers

---

# Performance

Optimize DB queries, API latency, and serialization.
Avoid N+1 queries and loading unnecessary data.
