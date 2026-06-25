# MedScope AI — Tests manuales por fase

Documentación de **pruebas de usuario ejecutadas manualmente**, organizadas por fase de desarrollo (alineadas con el [Execution Plan](../../Execution%20Plan/ExecutionPlan.md) y el [Task Tracker](../../TaskTracker.md)).

La **aplicación** (UI y API) está en **inglés**. Estos documentos están en **español** para facilitar la ejecución y la defensa del TFM.

---

## Objetivo

Complementar los tests automáticos (`pytest`, `vitest`, Playwright) con un checklist que cualquier persona pueda seguir **sin haber usado la app antes**, validando:

- que el entorno local funciona (Docker, PostgreSQL, backend),
- que los flujos críticos se comportan como se espera,
- que los problemas se detectan y documentan antes de la demo o la defensa.

---

## Índice de documentos

| Fase | Documento | Alcance |
|---|---|---|
| 0 | [Phase-00-Initialization.md](Phase-00-Initialization.md) | *(pendiente)* — repo, Docker, scripts de arranque |
| 1 | [Phase-01-Backend-Database.md](Phase-01-Backend-Database.md) | Backend FastAPI, PostgreSQL, auth API |
| 2 | [Phase-02-ML-Pipeline.md](Phase-02-ML-Pipeline.md) | Dataset, EDA, preprocessing, entrenamiento, serialización, SHAP offline |
| 3 | [Phase-03-ML-Backend-Integration.md](Phase-03-ML-Backend-Integration.md) | `POST /predict`, `POST /simulate`, `GET /history`, `GET /analytics`, ML startup, persistencia |
| 4 | [Phase-04-Frontend-Foundation.md](Phase-04-Frontend-Foundation.md) | Splash, login UI, rutas protegidas, roles, layout responsive, dashboard demo |
| 5 | [Phase-05-Clinical-Prediction-UI.md](Phase-05-Clinical-Prediction-UI.md) · [Phase-05-Clinical-Simulation-UI.md](Phase-05-Clinical-Simulation-UI.md) | Predicción + simulación UI (Fase 5) |
| 6 | [Phase-06-History-UI.md](Phase-06-History-UI.md) | Historial UI, nurse RBAC (US-022, T-601–604) |

---

## Convenciones

### Identificador de test

Formato: **`MT-P{FASE}-{ÁREA}-{NNN}`**

| Parte | Significado | Ejemplo |
|---|---|---|
| `MT` | Manual Test | — |
| `P01` | Fase 1 | Backend + BD |
| `AUTH` | Categoría (autenticación) | — |
| `003` | Número secuencial | — |

**Categorías habituales:** `INF` (infraestructura), `API` (OpenAPI), `DB` (base de datos), `AUTH`, `RBAC` (roles), `NEG` (negativos), `SEC` (seguridad).

### Prioridad

| Prioridad | Significado |
|---|---|
| **P0** | Bloqueante — la fase no se considera cerrada sin pasar estos tests |
| **P1** | Importante — ejecutar en regresión tras cambios grandes |
| **P2** | Complementario — recomendable pero no bloqueante |

### Cómo marcar la ejecución

En cada test hay una tabla **Ejecución manual**. Marca `[ ]` → `[x]` cuando pases todos los criterios de aceptación.

Anota en **Notas** cualquier incidencia, captura de pantalla o enlace a issue.

### Datos demo (todas las fases)

| Email | Rol | Contraseña |
|---|---|---|
| `admin@medscope.ai` | admin | `MedScope123!` |
| `clinician@medscope.ai` | clinician | `MedScope123!` |
| `analyst@medscope.ai` | analyst | `MedScope123!` |
| `nurse@medscope.ai` | nurse | `MedScope123!` |

### URLs habituales (desarrollo local)

| Recurso | URL |
|---|---|
| Frontend | http://localhost:5173/login |
| Backend API | http://localhost:8000 |
| Health check | http://localhost:8000/health |
| Swagger (documentación interactiva) | http://localhost:8000/docs |
| Esquema OpenAPI (JSON) | http://localhost:8000/openapi.json |

### Arranque rápido (Windows)

Primera vez:

```powershell
.\scripts\setup-dev.ps1
```

Cada sesión de pruebas:

```powershell
.\dev.bat
```

Equivale a `.\scripts\start-dev.ps1`: levanta PostgreSQL en Docker, aplica migraciones y abre backend (puerto 8000) y frontend (puerto 5173) en ventanas nuevas.

Para detener:

```powershell
.\stop.bat
```

### Relación con tests automáticos

| Automatizado | Manual |
|---|---|
| `backend/tests/`, `ml/tests/` | Este checklist |
| Rápido, en CI | Entorno real (Docker + PostgreSQL) |
| SQLite en algunos tests de auth | Seed y migraciones en Postgres real |

No hace falta repetir todos los casos de `pytest`; los manuales cubren lo que un script no valida (arranque, Swagger, BD persistente, experiencia de integración).

---

## Registro de sesiones (opcional)

Copia esta tabla al final de cada documento de fase cuando ejecutes una sesión completa:

| Fecha | Ejecutado por | Commit / rama | P0 | P1 | P2 | Comentarios |
|---|---|---|---|---|---|---|
| | | | | | | |
