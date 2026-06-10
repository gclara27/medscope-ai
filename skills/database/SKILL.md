---
name: medscope-database
description: >-
  PostgreSQL persistence for MedScope AI. Use for schema design, SQLAlchemy
  models, Alembic migrations, and repository patterns.
---

# Skill — Database Engineering

## Purpose

This skill governs database design and persistence.

## Project documentation

Consult before implementing:
- `docs/Requirements/Requirements.md` — §10 (database), §5.6–5.8 (history, admin)
- `docs/Use Cases/Use Cases.md` — UC-023, UC-044, UC-050–052, UC-081

---

# Stack

- PostgreSQL
- SQLAlchemy
- Alembic

---

# Rules

- UUID primary keys
- normalized schema with ORM relationships
- every schema change via Alembic migration (reversible)
- access DB only through repositories (no raw SQL in routers)

---

# Entities to persist

- users and roles
- predictions and patient inputs (de-identified)
- SHAP explanation payloads
- simulations (original vs simulated scores)
- audit/error logs

---

# History & search (RF-050–051)

Support filtering by date, risk level, and user.
Store enough data to reopen a historical evaluation (UC-052).

---

# Security

Never store:
- plaintext passwords (hash only)
- PHI or real patient identifiers
- sensitive clinical data from real patients

Use synthetic or public dataset identifiers only.

---

# Resilience

Application must tolerate restarts without data loss (RNF-010).
