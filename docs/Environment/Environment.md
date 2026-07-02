# MedScope AI — Variables de entorno (RDO-010, RDO-020)

Documentación de configuración **dev / test / prod**. Fuente de verdad para despliegue y desarrollo local.

| Requisito | Descripción |
|---|---|
| [RDO-010](../Requirements/Requirements.md#rdo-010) | Separación dev / prod (mismo código, distinta configuración) |
| [RDO-020](../Requirements/Requirements.md#rdo-020) | Variables en `.env`; nunca commitear secretos |

Archivos de plantilla:

| Archivo | Ámbito |
|---|---|
| [`.env.example`](../../.env.example) | Raíz — PostgreSQL, backend, Docker Compose |
| [`frontend/.env.example`](../../frontend/.env.example) | Frontend Vite (build y dev server) |

---

## 1. Entornos

| Entorno | Base de datos | Backend | Frontend | Configuración |
|---|---|---|---|---|
| **dev (local)** | PostgreSQL Docker `localhost:5432` | `uvicorn` en host `:8000` | Vite `:5173` | `.env` raíz + proxy Vite |
| **dev (Docker)** | Servicio `postgres` | Contenedor `backend` | Contenedor `frontend` nginx `:3000` | `.env` raíz + `docker compose` |
| **test** | SQLite en memoria (pytest) | Tests sin `.env` obligatorio | vitest / Playwright | Fixtures; ver §5 |
| **prod** | PostgreSQL gestionado | Contenedor o PaaS | Static + reverse proxy | `.env` solo en servidor |

`docker-compose.yml` es **solo desarrollo**. Producción usa su propio despliegue y credenciales.

Detalle BD: [Database.md §1.1](../Database/Database.md#11-entornos-dev--test--prod).

---

## 2. Inicio rápido

```powershell
# Desde la raíz del repo
copy .env.example .env          # Windows
# cp .env.example .env          # macOS / Linux

copy frontend\.env.example frontend\.env   # opcional en dev (proxy Vite por defecto)
```

| Flujo | Comando | URLs |
|---|---|---|
| Stack Docker completo | `docker compose up --build` o `.\scripts\docker-up.ps1` | UI http://localhost:3000 · API http://localhost:8000 |
| Dev híbrido (recomendado día a día) | `.\scripts\start-dev.ps1` | UI http://localhost:5173 · API http://localhost:8000 |
| Solo PostgreSQL | `docker compose up postgres -d` | BD `localhost:5432` |

---

## 3. Variables — raíz (`.env`)

Usadas por **Docker Compose**, **backend** (`core/config.py`) y scripts de desarrollo.

| Variable | Obligatoria | Default (dev) | Consumidor | Descripción |
|---|---|---|---|---|
| `POSTGRES_USER` | No | `medscope` | `postgres` (compose) | Usuario PostgreSQL |
| `POSTGRES_PASSWORD` | No | `medscope_dev` | `postgres`, `DATABASE_URL` | Contraseña PostgreSQL |
| `POSTGRES_DB` | No | `medscope_ai` | `postgres`, `DATABASE_URL` | Nombre de la base de datos |
| `POSTGRES_PORT` | No | `5432` | compose (puerto host) | Puerto expuesto de PostgreSQL |
| `DATABASE_URL` | Sí* | ver `.env.example` | Backend, Alembic | URL SQLAlchemy/psycopg2 |
| `BACKEND_PORT` | No | `8000` | compose | Puerto host del API |
| `FRONTEND_PORT` | No | `3000` | compose | Puerto host del frontend Docker |
| `JWT_SECRET` | Sí | `change-me-in-production` | Backend auth | Clave HMAC para JWT |
| `JWT_ALGORITHM` | No | `HS256` | Backend auth | Algoritmo JWT |
| `JWT_EXPIRE_MINUTES` | No | `60` | Backend auth | Caducidad del access token |
| `CORS_ORIGINS` | No | ver `.env.example` | Backend CORS | Orígenes permitidos (CSV) |
| `LOG_LEVEL` | No | `INFO` | Backend, ML CLI | `DEBUG`, `INFO`, `WARNING`, `ERROR` |
| `LOG_FORMAT` | No | `text` | Backend, ML CLI | `text` (key=value) o `json` |

\* En dev los defaults funcionan; en **prod** `DATABASE_URL` y `JWT_SECRET` deben ser explícitos y seguros.

### `DATABASE_URL` según contexto

| Quién conecta | Host en la URL |
|---|---|
| Backend en contenedor Docker | `postgres` |
| Backend / Alembic en el host | `localhost` |
| Cliente SQL (DBeaver, psql) | `localhost` + `POSTGRES_PORT` |

Ejemplos:

```env
# Backend local + Postgres Docker
DATABASE_URL=postgresql://medscope:medscope_dev@localhost:5432/medscope_ai

# Backend dentro de docker-compose (compose lo inyecta; no hace falta en .env local)
# postgresql://medscope:medscope_dev@postgres:5432/medscope_ai
```

### `CORS_ORIGINS`

Lista separada por comas de orígenes del navegador autorizados a llamar al API con credenciales.

| Origen típico | Cuándo |
|---|---|
| `http://localhost:5173` | Vite dev (`npm run dev`) |
| `http://localhost:3000` | Frontend Docker (nginx) |
| `http://localhost` | Mismo host sin puerto (nginx) |
| `https://tu-dominio.clinical` | **prod** |

---

## 4. Variables — frontend (`frontend/.env`)

Leídas en **build time** por Vite (`import.meta.env`).

| Variable | Obligatoria | Default dev | Descripción |
|---|---|---|---|
| `VITE_API_BASE_URL` | No | *(vacío)* | Base URL del API. Vacío = rutas relativas (proxy Vite o nginx Docker) |

| Modo | `VITE_API_BASE_URL` | Comportamiento |
|---|---|---|
| Vite dev (`npm run dev`) | vacío | Proxy en `vite.config.ts` → `http://localhost:8000` |
| Docker frontend | vacío (build) | `nginx.conf` hace proxy de `/auth`, `/predict`, etc. al servicio `backend` |
| Frontend estático + API en otro dominio | `https://api.ejemplo.com` | Axios llama directamente al API (CORS debe incluir el origen del UI) |

---

## 5. Test y herramientas

| Herramienta | Variables | Notas |
|---|---|---|
| pytest (`backend/tests`) | SQLite in-memory vía `conftest.py` | No requiere Postgres ni `.env` para la suite unitaria |
| vitest (`frontend`) | — | Mocks de API; sin `.env` obligatorio |
| Playwright (`tests/e2e`) | `PLAYWRIGHT_BASE_URL` (opcional) | Default `http://localhost:5173`; stack debe estar levantado |
| CI | `CI=true` | Playwright: reintentos y `forbidOnly` |

---

## 6. Producción (checklist)

1. **Nunca** usar `JWT_SECRET=change-me-in-production` ni `medscope_dev`.
2. `DATABASE_URL` apuntando al PostgreSQL gestionado (TLS si el proveedor lo exige).
3. `CORS_ORIGINS` solo con el dominio real del frontend (sin `localhost`).
4. Rotar secretos si se filtran; no versionar `.env` en git.
5. `docker-compose.yml` del repo **no** es el manifiesto de prod — usar orquestación del hosting con las mismas variables lógicas.
6. Modelos ML en `models/` — en producción los **cuatro** artefactos (`model.pkl`, `preprocessor.pkl`, `model_manifest.json`, `shap_background.npy`) van en la imagen Docker (ver [Deployment.md](../Deployment/Deployment.md)).
7. Ejecutar migraciones antes de arrancar el API: `alembic upgrade head` (el entrypoint Docker lo hace en Render).

Guía completa de despliegue cloud: [Deployment.md](../Deployment/Deployment.md).

### Ejemplo producción desplegada (MedScope AI TFM, jul 2026)

**Render (backend):**

```env
DATABASE_URL=postgresql://postgres.[REF]:***@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require
JWT_SECRET=<generado>
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60
CORS_ORIGINS=https://medscope-ai-delta.vercel.app
LOG_LEVEL=INFO
LOG_FORMAT=json
PYTHONPATH=/workspace
```

**Vercel (frontend build):**

```env
VITE_API_BASE_URL=https://medscope-ai-q8tg.onrender.com
```

URLs públicas: [Deployment.md §1](../Deployment/Deployment.md#1-arquitectura-recomendada).

---

## 8. Logging (RNF-050, RNF-051, T-711)

Módulo compartido: `ml/logging_config.py` (backend usa `core/logging_config.py` → servicio `medscope-api`).

| Variable | Default | Descripción |
|---|---|---|
| `LOG_LEVEL` | `INFO` | Verbosity (`DEBUG` incluye cada request HTTP en middleware) |
| `LOG_FORMAT` | `text` | `text` = líneas `key=value`; `json` = una línea JSON por evento |

Ejemplo (text):

```text
timestamp=2026-06-11T10:00:00+00:00 level=INFO service=medscope-api logger=core.ml_registry message="ML model loaded" ...
```

Scripts ML (`serialize_model.py`, etc.) usan `service=medscope-ml`.

---

## 9. Seguridad (RDO-020)

- `.env` está en `.gitignore`.
- No subir credenciales a issues, capturas ni memoria del TFM con datos reales.
- Usuarios demo (`clinician@medscope.ai` / `MedScope123!`) válidos en **dev** y en **prod** (seed Supabase).
- En prod público: **rotar** contraseñas demo antes de la defensa del TFM.

---

## 10. Trazabilidad

| Tarea | Entrega |
|---|---|
| T-014 | `.env.example` raíz |
| T-709 | Compose postgres + backend + frontend |
| T-710 | Este documento |
| T-711 | `ml/logging_config.py` — logging estructurado |
| T-904 | `docker compose up` one-command (script `scripts/docker-up.ps1`) |
