# MedScope AI — Guía de despliegue a producción (gratis)

Documento paso a paso para desplegar el MVP en la nube **sin coste** (plan free tier), pensado para el TFM y la defensa (UC-124).

> **Estado (julio 2026):** despliegue **completado y operativo**. Stack: **Supabase** (PostgreSQL) + **Render** (API + ML) + **Vercel** (React). Flujo login → predicción → SHAP → simulación → historial → analytics verificado en producción.

| Requisito | Descripción |
|---|---|
| [RDO-010](../Requirements/Requirements.md#rdo-010) | Mismo código, distinta configuración dev / prod |
| [RDO-020](../Requirements/Requirements.md#rdo-020) | Secretos solo en dashboards; nunca en git |
| [UC-124](../Use%20Cases/Use%20Cases.md#uc-124--cloud-deployment) | Despliegue cloud |

**Documentación relacionada:**

| Documento | Propósito |
|---|---|
| [Environment.md](../Environment/Environment.md) | Variables de entorno dev / prod |
| [Database.md](../Database/Database.md) | Esquema PostgreSQL y migraciones Alembic |
| [README.md](../../README.md) | Desarrollo local |

---

## 1. Arquitectura recomendada

**No desplegar todo en Vercel.** El backend carga modelos `joblib`, scikit-learn y SHAP al arrancar (`backend/core/ml_registry.py`). Vercel serverless no es adecuado para eso (límites de tamaño, timeouts, cold starts).

### Stack gratuito elegido

| Servicio | Rol | Plan | Limitación principal |
|---|---|---|---|
| **Supabase** | PostgreSQL | Free | Proyecto pausado tras ~1 semana sin uso |
| **Render** | Backend FastAPI + ML (Docker) | Free web service | Se apaga tras ~15 min sin tráfico; cold start 30–90 s |
| **Vercel** | Frontend React (Vite) | Hobby | Suficiente para estudio y demo |

```mermaid
flowchart LR
  subgraph users [Usuarios]
    Browser[Navegador]
  end
  subgraph vercel [Vercel]
    SPA[React SPA]
  end
  subgraph render [Render]
    API[FastAPI + ML]
  end
  subgraph supabase [Supabase]
    PG[(PostgreSQL)]
  end
  Browser --> SPA
  SPA -->|HTTPS| API
  API --> PG
```

### URLs de producción (MedScope AI — TFM)

| Componente | URL |
|---|---|
| **Frontend (Vercel)** | https://medscope-ai-delta.vercel.app |
| **Login** | https://medscope-ai-delta.vercel.app/login |
| **Backend API (Render)** | https://medscope-ai-q8tg.onrender.com |
| **Health check** | https://medscope-ai-q8tg.onrender.com/health |
| **API docs (Swagger)** | https://medscope-ai-q8tg.onrender.com/docs |
| **Base de datos (Supabase)** | Panel del proyecto en [supabase.com/dashboard](https://supabase.com/dashboard) *(credenciales solo en Render)* |

**Nota:** la raíz del API (`/`) devuelve `404` — es normal; el UI vive en Vercel. Usar `/health` o `/docs` para comprobar el backend.

### Variables de entorno en producción (resumen)

| Servicio | Variables clave |
|---|---|
| **Render** | `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS=https://medscope-ai-delta.vercel.app`, `PYTHONPATH=/workspace` |
| **Vercel** | `VITE_API_BASE_URL=https://medscope-ai-q8tg.onrender.com` (build time) |
| **Supabase** | Origen de `DATABASE_URL` (Session pooler, puerto 5432, `?sslmode=require`) |

---

## 2. Prerrequisitos

- [x] Cuenta en [GitHub](https://github.com) con el código en la rama `main`
- [x] Cuenta en [Supabase](https://supabase.com)
- [x] Cuenta en [Render](https://render.com)
- [x] Cuenta en [Vercel](https://vercel.com)
- [x] Repo clonado en local con Python 3.12+ y `.venv` configurado
- [x] Modelos ML generados localmente (ver §3)

---

## 3. Fase 0 — Preparar el repositorio

Los cambios de código de esta fase **ya están en el repo** (Dockerfile, `vercel.json`, CI, scripts). Antes del primer deploy en Render:

### 3.1 Generar y versionar artefactos ML

Los modelos de entrenamiento grandes siguen gitignored; los **cuatro artefactos de producción** sí deben estar en git para que Render pueda construir la imagen desde GitHub.

```powershell
# Desde la raíz del repo, con .venv activo
python ml/scripts/serialize_model.py
# o
.\scripts\prepare-docker-build.ps1
```

Comprobar que existen (y commitear en `main`):

- `models/model.pkl`
- `models/preprocessor.pkl`
- `models/model_manifest.json`
- `models/shap_background.npy` *(requerido por `ml_registry` para SHAP en runtime)*

### 3.2 Imagen Docker (`backend/Dockerfile`)

El Dockerfile copia `models/` y falla el build si faltan los **cuatro** archivos anteriores. Contexto de build en Render: **raíz del repositorio**.

### 3.3 Vercel + React Router

[`frontend/vercel.json`](../../frontend/vercel.json) reescribe rutas SPA a `index.html`.

**Build frontend en Vercel:** Root Directory = `frontend`. Si el preset no detecta Vite automáticamente, configurar manualmente: `npm run build`, output `dist`. Excluir tests del `tsc` de producción: ver `frontend/tsconfig.json` (`exclude` de `*.test.tsx`).

### 3.4 CI en GitHub

[`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) ejecuta pytest + vitest en push/PR a `main`. Incluye `pytest-asyncio` para tests async del backend. No despliega.

### 3.5 Commit y push

```powershell
git add backend/Dockerfile frontend/vercel.json .github/workflows/ci.yml models/model.pkl models/preprocessor.pkl models/model_manifest.json
git commit -m "chore: production deploy prep (Fase 0)"
git push origin main
```

---

## 4. Fase 1 — Supabase (base de datos)

### 4.1 Crear proyecto

1. [supabase.com](https://supabase.com) → **New project**
2. Nombre: p. ej. `medscope-ai`
3. Región: la más cercana (ej. `West EU (Ireland)`)
4. Contraseña de base de datos: **guárdala** en un gestor de contraseñas

### 4.2 Obtener `DATABASE_URL`

**Project Settings → Database → Connection string**

Para el backend en Render (proceso persistente), usa el **Session pooler** (puerto **5432**), no Transaction mode (6543).

> **Importante (Windows / algunos hosts):** la conexión **directa** `db.[PROJECT_REF].supabase.co` puede ser solo IPv6 y fallar con `Name or service not known`. En ese caso usar siempre el **pooler**.

Si la contraseña contiene caracteres especiales (`@`, `#`, `*`, `%`), **URL-encode** en `DATABASE_URL` (`%40`, `%23`, `%2A`, `%25`).

Ejemplo de formato (pooler):

```text
postgresql://postgres.[PROJECT_REF]:[PASSWORD_ENCODED]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require
```

O URI directa (si tu red soporta IPv6):

```text
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require
```

**Alembic:** `backend/alembic/env.py` escapa `%` como `%%` en la URL para ConfigParser (contraseñas codificadas).

### 4.3 Primera migración (manual, una vez)

Desde tu PC (no hace falta esperar a Render):

```powershell
$env:DATABASE_URL = "postgresql://postgres:TU_PASSWORD@db.TU_REF.supabase.co:5432/postgres?sslmode=require"
cd backend
..\.venv\Scripts\python.exe -m alembic upgrade head
```

Verificar en **Supabase → Table Editor**: tablas `users`, `roles`, `predictions`, `simulations`, etc.

### 4.4 Usuarios demo y seguridad

La migración `1152e8c4f00f_seed_demo_users` crea usuarios de prueba:

| Email | Contraseña (seed) |
|---|---|
| `clinician@medscope.ai` | `MedScope123!` |
| (otros roles demo) | `MedScope123!` |

Para una demo pública: **cambia contraseñas** o crea usuarios admin nuevos y desactiva los demo.

---

## 5. Fase 2 — Render (backend API)

### 5.1 Crear Web Service

1. [render.com](https://render.com) → **New +** → **Web Service**
2. Conectar repositorio GitHub → rama `main`
3. Configuración:

| Campo | Valor |
|---|---|
| **Name** | `medscope-api` |
| **Region** | Igual o cercana a Supabase |
| **Branch** | `main` |
| **Root Directory** | *(vacío)* |
| **Runtime** | **Docker** |
| **Dockerfile Path** | `backend/Dockerfile` |
| **Instance Type** | **Free** |
| **Health Check Path** | `/health` |

### 5.2 Variables de entorno

En **Environment** del servicio Render:

| Variable | Valor | Notas |
|---|---|---|
| `DATABASE_URL` | URI de Supabase (§4.2) | Obligatorio |
| `JWT_SECRET` | Ver §5.3 | Obligatorio; no usar el default |
| `JWT_ALGORITHM` | `HS256` | |
| `JWT_EXPIRE_MINUTES` | `60` | |
| `CORS_ORIGINS` | URL de Vercel (§6) | Actualizar tras crear Vercel |
| `LOG_LEVEL` | `INFO` | |
| `LOG_FORMAT` | `json` | Recomendado en prod |
| `PYTHONPATH` | `/workspace` | |

### 5.3 Generar `JWT_SECRET`

PowerShell:

```powershell
# Opción 1 — OpenSSL si está instalado
openssl rand -hex 32

# Opción 2 — Python
python -c "import secrets; print(secrets.token_hex(32))"
```

### 5.4 Migraciones automáticas

[`backend/docker-entrypoint.sh`](../../backend/docker-entrypoint.sh) ejecuta `alembic upgrade head` antes de uvicorn. **Cada deploy en Render aplica migraciones nuevas** al arrancar el contenedor.

### 5.5 Verificación

Tras el primer build (5–15 min):

```text
GET https://TU-SERVICIO.onrender.com/health
→ {"status":"ok","ml_ready":true,...}

GET https://TU-SERVICIO.onrender.com/ml/status
→ ML cargado (requiere models/ en la imagen Docker)
```

**Cold start:** tras ~15 min sin tráfico, la primera petición puede tardar mucho. Antes de una demo o defensa, abre `/health` unos minutos antes.

---

## 6. Fase 3 — Vercel (frontend)

### 6.1 Importar proyecto

1. [vercel.com](https://vercel.com) → **Add New → Project**
2. Importar el mismo repositorio GitHub
3. Configuración:

| Campo | Valor |
|---|---|
| **Framework Preset** | Vite *(si queda vacío, configurar comandos manualmente — §3.3)* |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 6.2 Variable de entorno (build time)

**Settings → Environment Variables** → Production:

| Variable | Valor |
|---|---|
| `VITE_API_BASE_URL` | `https://medscope-ai-q8tg.onrender.com` |

Sin barra final. Vite la embebe en el build; si cambias la URL del API hay que **redeploy** en Vercel.

Referencia: [`frontend/src/services/api.ts`](../../frontend/src/services/api.ts).

### 6.3 Deploy y CORS

1. Deploy → URL de producción: `https://medscope-ai-delta.vercel.app`
2. En **Render → Environment**, `CORS_ORIGINS` = `https://medscope-ai-delta.vercel.app` (sin `/` final)
3. Si cambiaste CORS, **Manual Deploy** en Render o espera al siguiente push

### 6.4 Verificación end-to-end

1. Abrir https://medscope-ai-delta.vercel.app/login
2. Login con usuario demo o admin creado
3. Recorrer: Dashboard → Evaluation → Generate prediction → SHAP → Simulation → History → Analytics (según rol)

Si login falla con error de red: revisar `VITE_API_BASE_URL` y `CORS_ORIGINS`.

---

## 7. CI/CD — Deploy automático en `main`

Con las integraciones GitHub activadas (por defecto):

```mermaid
sequenceDiagram
  participant Dev as Tu_PC
  participant GH as GitHub_main
  participant Vercel
  participant Render
  participant SB as Supabase

  Dev->>GH: git push origin main
  par Frontend
    GH->>Vercel: webhook
    Vercel->>Vercel: npm run build
  and Backend
    GH->>Render: webhook
    Render->>Render: docker build
    Render->>SB: alembic upgrade head
  end
```

| Cambio en el repo | Qué se actualiza |
|---|---|
| `frontend/**` | Vercel rebuild |
| `backend/**`, `ml/**`, `Dockerfile`, `models/` (en build) | Render rebuild |
| Nueva migración Alembic | Render la aplica al arrancar |
| Solo `docs/**` | Redeploy sin impacto funcional |

### Confirmar auto-deploy

| Servicio | Dónde | Valor |
|---|---|---|
| Vercel | Settings → Git → Production Branch | `main` |
| Render | Settings → Build & Deploy → Auto-Deploy | Yes, branch `main` |

### Acciones manuales habituales

| Situación | Qué hacer |
|---|---|
| Nueva variable de entorno | Añadir en dashboard Vercel o Render |
| Cambiar URL del API | Actualizar `VITE_API_BASE_URL` + redeploy Vercel |
| Regenerar modelos ML | `serialize_model.py` → rebuild Render (models en imagen) |
| Supabase pausado | Entrar al dashboard Supabase y reactivar proyecto |
| Render muy lento al inicio | Petición a `/health` para calentar |

---

## 8. Tabla resumen de variables por servicio

| Variable | Supabase | Render | Vercel |
|---|---|---|---|
| `DATABASE_URL` | *(origen)* | ✅ | — |
| `JWT_SECRET` | — | ✅ | — |
| `JWT_ALGORITHM` | — | ✅ | — |
| `JWT_EXPIRE_MINUTES` | — | ✅ | — |
| `CORS_ORIGINS` | — | ✅ | — |
| `LOG_LEVEL` / `LOG_FORMAT` | — | ✅ | — |
| `PYTHONPATH` | — | ✅ | — |
| `VITE_API_BASE_URL` | — | — | ✅ (build) |

Detalle de cada variable: [Environment.md](../Environment/Environment.md).

---

## 9. Checklist de seguridad (estudio / demo)

- [x] `JWT_SECRET` generado con `secrets.token_hex(32)` o equivalente *(Render)*
- [x] `CORS_ORIGINS` solo con dominio Vercel de producción (sin `localhost`)
- [ ] Contraseñas demo rotadas si la URL es pública *(recomendado antes de defensa)*
- [x] `.env` local nunca commiteado
- [x] Credenciales de Supabase solo en Render / gestor de contraseñas
- [ ] No incluir capturas con passwords en la memoria del TFM

---

## 10. Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| `ml_ready: false` en `/health` | Falta `shap_background.npy` u otro artefacto en imagen Docker | Commitear los 4 archivos en `models/` (§3.1), rebuild Render |
| `Failed to load ML model at startup` | Mismo que anterior | Verificar logs Render; `models/shap_background.npy` en git |
| Login OK en local, falla en prod | CORS o `VITE_API_BASE_URL` mal | `CORS_ORIGINS` = URL Vercel exacta; redeploy Render |
| 404 al recargar `/dashboard` | Falta `vercel.json` | §3.3 |
| `connection refused` a BD | Supabase pausado o URL incorrecta | Reactivar proyecto; pooler 5432 + `?sslmode=require` |
| `invalid interpolation syntax` (Alembic) | `%` en contraseña URL-encoded | Fix en `alembic/env.py` (escape `%%`) |
| `can't adapt type 'dict'` (migración) | JSON permissions en seed | `json.dumps()` en migración Alembic |
| Build Vercel falla en `tsc -b` | Tests con imports `node:fs` incluidos en build | `exclude` en `frontend/tsconfig.json` |
| CI falla test async | Falta `pytest-asyncio` | Instalar en workflow CI + `asyncio_mode = auto` |
| Primera petición muy lenta | Cold start Render free | Normal; calentar con `/health` |
| Alembic falla en Render | URL pooler incorrecta | Session pooler 5432, password encoded |
| Build Docker falla paso `RUN test` | `models/` incompleto en contexto | `prepare-docker-build.ps1` + commit 4 artefactos |
| `404` en raíz del API Render | No hay ruta `/` | Usar `/health` o `/docs`; UI en Vercel |

---

## 11. Rollback

| Servicio | Cómo volver atrás |
|---|---|
| **Vercel** | Deployments → deployment anterior → **Promote to Production** |
| **Render** | Events → deploy anterior → **Rollback** |
| **Base de datos** | Alembic `downgrade` manual solo si sabes lo que haces; en estudio, preferir backup Supabase antes de migraciones arriesgadas |

---

## 12. Coste

**0 €/mes** en free tier de Supabase + Render + Vercel, suficiente para el TFM.

Trade-offs: cold starts, posible pausa de Supabase, sin SLA.

---

## 13. Orden de ejecución (checklist global)

Marca cada paso al completarlo:

- [x] **0.1** Generar `models/` y commitear `model.pkl`, `preprocessor.pkl`, `model_manifest.json`, `shap_background.npy`
- [x] **0.2** Verificar `backend/Dockerfile` incluye `COPY models` y valida 4 artefactos
- [x] **0.3** Verificar `frontend/vercel.json` + `tsconfig` build sin tests
- [x] **0.4** Push a `main` (vía PR; rama protegida)
- [x] **1.1** Crear proyecto Supabase
- [x] **1.2** Copiar `DATABASE_URL` (Session pooler)
- [x] **1.3** `alembic upgrade head` desde local
- [x] **2.1** Crear Web Service Render (Docker)
- [x] **2.2** Configurar variables de entorno
- [x] **2.3** Verificar `/health` y `ml_ready: true`
- [x] **3.1** Importar `frontend/` en Vercel
- [x] **3.2** Configurar `VITE_API_BASE_URL`
- [x] **3.3** Actualizar `CORS_ORIGINS` en Render
- [x] **3.4** Probar login y flujo MVP completo en producción
- [x] **4** Confirmar auto-deploy en push a `main` (Render + Vercel)
- [x] **5** Rellenar tabla de URLs (§1)

---

## 14. Historial del despliegue (referencia TFM)

| Fecha | Hito | PR / notas |
|---|---|---|
| 2026-06 | Fase 0: Dockerfile, `vercel.json`, CI, artefactos ML base | #16 |
| 2026-06-30 | Fix Alembic Supabase (`%%` URL, JSON permissions) | #17 |
| 2026-06-30 | `shap_background.npy` en imagen Docker (`ml_ready`) | #18 |
| 2026-06-30 | Fix build Vercel (`tsconfig`) + CI `pytest-asyncio` | #19 |
| 2026-06-30 | Frontend live en Vercel; API en Render; BD Supabase | URLs §1 |

---

## 15. Mantenimiento post-despliegue

1. **Demo / defensa:** abrir `/health` 2–3 min antes para evitar cold start de Render.
2. **Nueva migración:** push a `main` → Render aplica `alembic upgrade head` al arrancar.
3. **Regenerar modelos ML:** `serialize_model.py` → commit 4 artefactos → rebuild Render.
4. **Cambiar URL del API:** actualizar `VITE_API_BASE_URL` en Vercel + redeploy frontend.
5. **Supabase inactivo ~1 semana:** reactivar desde el dashboard antes de demo.
6. **Diagrama para memoria TFM:** reutilizar diagramas §1 y §7; tarea [T-806](TaskTracker.md#fase-8--tfm) (diagrama despliegue).
