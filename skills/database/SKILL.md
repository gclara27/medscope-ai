---
name: medscope-database
description: >-
  PostgreSQL persistence for MedScope AI. Use for schema design, SQLAlchemy
  models, Alembic migrations, and repository patterns.
---

# Skill — Database Engineering

## Purpose

This skill governs database design and persistence in PostgreSQL.

## Project documentation

Consult before implementing:
- `docs/Database/Database.md` — **primary** schema, MVP tables, indexes, flows
- `docs/Requirements/Requirements.md` — §10 (RDB-*), RNF-034
- `docs/Use Cases/Use Cases.md` — UC-023, UC-044, UC-050–052, UC-081
- `docs/Testing/Testing.md` — SQLite vs PostgreSQL in tests

---

# Stack

- PostgreSQL 15+ (database: `medscope_ai`)
- SQLAlchemy 2.x
- Alembic (`backend/alembic/`)

---

# Backend layout

```
backend/
├── core/database.py
├── models/
├── repositories/
└── alembic/
```

Access DB only through repositories — never raw SQL in routers.

---

# MVP tables (implement first)

`roles`, `users`, `predictions`, `patient_inputs`, `shap_explanations`, `simulations`, `simulation_inputs`

Optional post-MVP: `audit_logs`, `system_settings`.  
Do **not** require `analytics_snapshots` or `user_sessions` for MVP.

---

# Rules

- UUID primary keys (`gen_random_uuid()`)
- 3NF normalized schema
- every schema change via reversible Alembic migration
- JWT stateless — no JWT storage in DB for MVP (RF-003)
- bcrypt password hashes only

---

# Roles seed

`admin`, `clinician`, `analyst`, `nurse` (RF-004)

---

# History & search (RF-050–051)

Filter predictions by `created_at`, `risk_level`, `user_id`.
Join `patient_inputs` and `shap_explanations` for detail view (UC-052).

---

# Analytics (RF-060)

MVP: aggregate queries on `predictions` — no snapshot table required.

---

# Security

Never store: plaintext passwords, PHI, real patient identifiers.
Use de-identified clinical inputs from public dataset only (RNF-034).

---

# Resilience

PostgreSQL durable storage — survive restarts without data loss (RNF-010).
