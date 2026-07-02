# MedScope AI — Database Architecture

## Clinical Decision Support Platform — PostgreSQL Schema

**Documentación relacionada:**

| Documento | Propósito |
|---|---|
| `docs/Requirements/Requirements.md` | RDB-* (§10), RF-* persistencia, RNF-034 |
| `docs/Use Cases/Use Cases.md` | UC-023, UC-044, UC-050–052, UC-081 |
| `docs/Execution Plan/ExecutionPlan.md` | Fase 1 — modelos iniciales |
| `docs/Testing/Testing.md` | SQLite test DB vs PostgreSQL integración |
| `skills/database/SKILL.md` | Reglas ORM y repositorios para la IA |
| `AGENTS.md` | Estructura `backend/` y capas |

---

# 1. Estrategia

| Decisión | Valor |
|---|---|
| Motor | **PostgreSQL** (RDB-010) |
| ORM | **SQLAlchemy** (RDB-020) |
| Migraciones | **Alembic** |
| PKs | **UUID** (`gen_random_uuid()`) |
| Acceso | Solo vía **repositories** (no SQL en routers) |

Base de datos: `medscope_ai`. Docker: servicio `postgres` en `docker-compose.yml`.

## 1.1 Entornos (dev / test / prod)

Separación obligatoria **dev / prod** (RDO-010). El motor es siempre **PostgreSQL** en dev y prod; en tests unitarios se usa **SQLite en memoria** por velocidad.

| Entorno | Motor | Dónde | Propósito |
|---|---|---|---|
| **dev** | PostgreSQL 16 | `docker compose` → servicio `postgres` | Desarrollo diario, migraciones Alembic, datos de prueba locales |
| **test** | SQLite en memoria | `backend/tests/conftest.py` | Tests unitarios rápidos (pytest) sin levantar Postgres |
| **test** (integración) | PostgreSQL en Docker | Mismo compose o BD dedicada `medscope_ai_test` | Validar SQL real, migraciones y flujos API + BD (opcional) |
| **prod** | PostgreSQL gestionado (Supabase) | [Deployment.md](../Deployment/Deployment.md) | MVP en cloud; `DATABASE_URL` en Render (Session pooler 5432) |

### Conexión según contexto

| Quién se conecta | Host en `DATABASE_URL` | Ejemplo |
|---|---|---|
| Backend dentro de Docker | `postgres` | `postgresql://medscope:medscope_dev@postgres:5432/medscope_ai` |
| Backend en host (uvicorn local) | `localhost` | `postgresql://medscope:medscope_dev@localhost:5432/medscope_ai` |
| Cliente SQL / DBeaver en host | `localhost` | puerto `5432`, BD `medscope_ai` |

### Variables por entorno

Copiar [`.env.example`](../../.env.example) → `.env` en **dev**. Nunca commitear `.env` (RDO-020).

**Referencia completa:** [Environment.md](../Environment/Environment.md) (T-710, RDO-010).

**Despliegue producción (Supabase + Render + Vercel):** [Deployment.md](../Deployment/Deployment.md).

| Variable | dev | prod |
|---|---|---|
| `DATABASE_URL` | Usuario/contraseña de desarrollo | URL del proveedor (RDS, Supabase, etc.) |
| `JWT_SECRET` | Valor de ejemplo | Secreto fuerte, único por entorno |
| `POSTGRES_*` | Defaults del compose | Gestionado por el hosting |

### Flujo recomendado

```text
1. Desarrollar  → PostgreSQL local (Docker) + .env de dev
2. Testear      → SQLite (unit) + opcional Postgres Docker (integración)
3. Desplegar    → PostgreSQL de producción; solo cambia configuración, no el código
```

`docker-compose.yml` es **solo para desarrollo**. Producción usará otro despliegue (contenedor, PaaS o VM) con su propio `.env`.

Detalle de testing: §13 y `docs/Testing/Testing.md`.

---

# 2. Alcance MVP vs opcional

## Tablas MVP (implementar en Fase 1)

| Tabla | Requisito / UC |
|---|---|
| `roles` | RF-004 |
| `users` | RF-001, UC-001 |
| `predictions` | RF-050, UC-023 |
| `patient_inputs` | RF-020, UC-020 |
| `shap_explanations` | RF-030, UC-030 |
| `simulations` | RF-042, UC-044 |
| `simulation_inputs` | UC-041, UC-043 |

## Tablas opcionales (post-MVP o mínimas)

| Tabla | Notas |
|---|---|
| `audit_logs` | UC-081, UC-085 — **planificado T-X06**; ver §4.8 |
| `analytics_snapshots` | **No requerida en MVP** — calcular métricas desde `predictions` (GET `/analytics`) |
| `system_settings` | UC-071 — post-MVP |
| `user_sessions` | **No requerida** — JWT stateless cubre RF-003 |

---

# 3. Modelo de entidades

```text
roles
 └── users
       ├── predictions
       │      ├── patient_inputs
       │      ├── shap_explanations
       │      └── simulations
       │             └── simulation_inputs
       └── audit_logs (opcional)
```

---

# 4. Tablas — esquema detallado

## 4.1 `roles`

| Campo | Tipo | Constraints |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(50) | UNIQUE, NOT NULL |
| description | TEXT | NULL |

**Seed MVP:** `admin`, `clinician`, `analyst`, `nurse` (RF-004).

---

## 4.2 `users`

| Campo | Tipo | Constraints |
|---|---|---|
| id | UUID | PK |
| role_id | UUID | FK → roles.id |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | TEXT | NOT NULL |
| is_active | BOOLEAN | DEFAULT TRUE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NULL |

Nunca almacenar contraseñas en texto plano (RNF-030, bcrypt).

---

## 4.3 `predictions`

| Campo | Tipo | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| risk_score | NUMERIC(5,2) | NOT NULL — **riesgo en escala 0–100 (porcentaje)** persistido por `PredictionRepository` (`risk_score_percent`). La API expone `risk_score` 0–1 y `risk_percent` 0–100; ver `services/risk_format.py` |
| risk_level | VARCHAR(20) | NOT NULL — low / medium / high |
| confidence_score | NUMERIC(5,2) | NULL |
| summary | TEXT | NULL — resumen clínico RF-032 |
| model_version | VARCHAR(50) | NOT NULL |
| prediction_time_ms | INTEGER | NULL — RNF-001 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

Índices: `user_id`, `created_at`, `risk_level` (RF-051 filtros).

---

## 4.4 `patient_inputs`

| Campo | Tipo | Constraints |
|---|---|---|
| id | UUID | PK |
| prediction_id | UUID | FK → predictions.id, UNIQUE |
| age | INTEGER | NULL |
| gender | VARCHAR(20) | NULL |
| glucose | NUMERIC(10,2) | NULL |
| blood_pressure | NUMERIC(10,2) | NULL |
| medications_count | INTEGER | NULL |
| previous_admissions | INTEGER | NULL |
| hospital_stay_days | INTEGER | NULL |
| bmi | NUMERIC(10,2) | NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

Datos **de-identificados** — sin PHI real (RNF-034). Alineado con dataset Diabetes 130-US hospitals.

---

## 4.5 `shap_explanations`

| Campo | Tipo | Constraints |
|---|---|---|
| id | UUID | PK |
| prediction_id | UUID | FK → predictions.id |
| feature_name | VARCHAR(100) | NOT NULL |
| feature_value | VARCHAR(255) | NULL |
| shap_value | NUMERIC(10,5) | NOT NULL |
| impact_direction | VARCHAR(20) | NULL — positive / negative |
| importance_rank | INTEGER | NULL |

Índice: `prediction_id`. Múltiples filas por predicción (top features RIA-031).

---

## 4.6 `simulations`

| Campo | Tipo | Constraints |
|---|---|---|
| id | UUID | PK |
| prediction_id | UUID | FK → predictions.id |
| user_id | UUID | FK → users.id |
| original_risk | NUMERIC(5,2) | NOT NULL |
| simulated_risk | NUMERIC(5,2) | NOT NULL |
| delta_risk | NUMERIC(5,2) | NOT NULL |
| simulation_summary | TEXT | NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

---

## 4.7 `simulation_inputs`

| Campo | Tipo | Constraints |
|---|---|---|
| id | UUID | PK |
| simulation_id | UUID | FK → simulations.id |
| feature_name | VARCHAR(100) | NOT NULL |
| original_value | VARCHAR(255) | NULL |
| simulated_value | VARCHAR(255) | NULL |

---

## 4.8 `audit_logs` (opcional — T-X06)

| Campo | Tipo | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NULL |
| action_type | VARCHAR(100) | NOT NULL |
| entity_type | VARCHAR(100) | NULL |
| entity_id | UUID | NULL |
| action_details | JSONB | NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**Índices recomendados:** `(created_at DESC)`, `(user_id)`, `(action_type)`.

**`action_type` seed (v1):**

```text
auth.login | auth.logout | prediction.create | simulation.create
admin.user.create | admin.user.update | admin.role.update | admin.settings.update
```

**Reglas:** sin PHI en `action_details`; solo IDs, tipos y metadatos operativos (RNF-053).

**Migración:** Alembic al implementar T-X06-01.

**API:** `GET /admin/audit-logs` — filtros `date_from`, `date_to`, `action_type`, `user_id`, `page`, `page_size` (RBE-016).

---

# 5. Autenticación y sesiones

**RF-003:** JWT stateless — el token no se persiste en BD en el MVP.

```text
POST /auth/login → validar users → emitir JWT
Request protegido → validar JWT en middleware (UC-080)
```

`user_sessions` solo si se necesita revocación de tokens (post-MVP).

---

# 6. Flujos de persistencia

## Predicción (UC-022–023)

```text
POST /predict
  → validar schema
  → crear predictions + patient_inputs
  → inferencia ML + SHAP
  → insertar shap_explanations
  → commit
  → respuesta JSON (risk_score 0–1, risk_percent 0–100)
```

**Nota:** `predictions.risk_score` en BD guarda el **porcentaje 0–100** (`PredictionRepository`). La capa API normaliza con `services/risk_format.py` para historial y clientes.

## Simulación (UC-040–044)

```text
POST /simulate
  → cargar prediction original
  → recalcular riesgo
  → crear simulations + simulation_inputs
  → commit
  → respuesta con original vs simulado
```

## Historial (UC-050–052)

```text
GET /history?date=&risk_level=&user_id=
  → query predictions + joins patient_inputs
  → paginación / filtros RF-051
```

## Analytics (UC-060–062)

MVP: **agregaciones en tiempo real** sobre `predictions` (COUNT, AVG, GROUP BY risk_level).
No requiere `analytics_snapshots` hasta optimización post-MVP.

---

# 7. Estructura backend (SQLAlchemy)

```text
backend/
├── core/
│   ├── config.py
│   ├── database.py      # engine, SessionLocal, get_db
│   └── exception_handlers.py
├── models/
│   ├── role.py
│   ├── user.py
│   ├── prediction.py
│   ├── patient_input.py
│   ├── shap_explanation.py
│   └── simulation.py
├── repositories/
│   ├── user_repository.py
│   ├── prediction_repository.py
│   ├── simulation_repository.py
│   ├── history_repository.py
│   └── analytics_repository.py
├── alembic/
│   └── versions/
└── tests/
```

No usar `backend/app/` ni `backend/db/` como layout principal.

---

# 8. Alembic

```bash
cd backend
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

Toda migración debe ser reversible. Una migración inicial con tablas MVP.

---

# 9. Índices recomendados

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_created ON predictions(created_at DESC);
CREATE INDEX idx_predictions_risk ON predictions(risk_level);
CREATE INDEX idx_shap_prediction ON shap_explanations(prediction_id);
CREATE INDEX idx_simulations_prediction ON simulations(prediction_id);
```

---

# 10. Seed data (demo / TFM)

## roles

```text
admin | clinician | analyst | nurse
```

## usuarios demo

```text
admin@medscope.ai      → admin
clinician@medscope.ai    → clinician
analyst@medscope.ai      → analyst
nurse@medscope.ai        → nurse
```

Contraseñas hasheadas con bcrypt. Crear vía migración seed o script en `scripts/`.

---

# 11. Seguridad

| Regla | Referencia |
|---|---|
| Passwords hasheadas (bcrypt) | RNF-030 |
| Sin PHI ni identificadores reales | RNF-034 |
| Sin contraseñas en logs | AGENTS.md |
| CORS y validación en API | RNF-032, RNF-033 |

---

# 12. Normalización

Esquema en **3NF**. Sin duplicar inputs clínicos fuera de `patient_inputs`. SHAP normalizado en filas por feature.

---

# 13. Testing de BD

Relacionado con entornos (§1.1).

| Tipo | Motor | Cuándo |
|---|---|---|
| Unit tests backend | SQLite en memoria (`backend/tests/conftest.py`) | Cada `pytest` en CI y local — sin Docker |
| Integración | PostgreSQL en Docker | Migraciones, queries Postgres-specific, flujo API + BD |
| E2E | PostgreSQL de dev o test | Playwright contra stack levantado (`tests/e2e/`) |

**No** usar la BD de producción en tests. Para integración local:

```bash
docker compose up postgres -d
# opcional: BD separada medscope_ai_test en el mismo contenedor
```

Ver `docs/Testing/Testing.md` §6.5.

---

# 14. Escalabilidad futura (fuera MVP)

Opcional según Requirements §18: multi-hospital, FHIR, Redis, jobs async, ML experiment tracking.

---

# Appendix A — Requirements traceability

| ID | Cobertura |
|---|---|
| RDB-001 | users, predictions, simulations, audit_logs |
| RDB-010 | PostgreSQL |
| RDB-020 | SQLAlchemy + Alembic |
| RF-004 | roles (4 roles) |
| RF-050–052 | predictions + filtros |
| RF-030–032 | shap_explanations + summary en predictions |
| RF-042 | simulations.delta_risk |
| RNF-010 | persistencia durable PostgreSQL |
| RNF-034 | sin PHI en patient_inputs |

---

# Appendix B — Use case mapping

| UC | Tablas |
|---|---|
| UC-023 | predictions, patient_inputs, shap_explanations |
| UC-044 | simulations, simulation_inputs |
| UC-050–052 | predictions (+ joins) |
| UC-081, UC-085 | audit_logs (T-X06) |
| UC-060–062 | agregaciones sobre predictions |
| UC-081 | audit_logs (opcional) |
