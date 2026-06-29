# MedScope AI — Testing Strategy

## Clinical Decision Support & Patient Risk Intelligence Platform

**Documentación relacionada:**

| Documento | Propósito |
|---|---|
| `docs/Requirements/Requirements.md` | Requisitos de testing RTS-* (§12) |
| `docs/Use Cases/Use Cases.md` | Flujos críticos UC-* para validar |
| `docs/Execution Plan/ExecutionPlan.md` | Fase 7.4 — cuándo introducir tests |
| `skills/testing/SKILL.md` | Reglas para el agente IA |
| `docs/Database/Database.md` | Esquema y tablas bajo test |
| `AGENTS.md` | Stack y convenciones globales |

En conflicto de alcance, prevalecen **Requirements** y **Use Cases**.

---

# 1. Objetivo

Demostrar calidad de ingeniería en el TFM mediante testing **pragmático y defendible**:

- validación backend (API + persistencia),
- validación ML (inferencia + SHAP),
- tests frontend básicos,
- flujos E2E del MVP.

No se requiere un sistema enterprise enorme. Se requiere cobertura de **flujos críticos** con herramientas modernas.

---

# 2. Stack oficial

| Área | Herramienta | Ubicación |
|---|---|---|
| Backend unit/integration | pytest, pytest-cov, httpx | `backend/tests/` |
| ML validation | pytest | `ml/tests/` |
| Frontend unit | vitest, React Testing Library | `frontend/` (co-located `*.test.tsx`) |
| E2E | Playwright | `tests/e2e/` |
| Lint / format | Ruff (Python), ESLint (TypeScript) | `pyproject.toml`, `frontend/eslint.config.js` |
| Mocking | unittest.mock | backend / ml |
| Test DB (unit) | SQLite en memoria | `backend/tests/conftest.py` |

Alineado con `AGENTS.md` y `skills/testing/SKILL.md`.

---

# 3. Requisitos de testing (traceability)

| ID | Requisito | Implementación |
|---|---|---|
| RTS-001 | Tests endpoints | pytest + httpx en `backend/tests/` |
| RTS-002 | Tests validación | schemas Pydantic + inputs inválidos (UC-090) |
| RTS-010 | Validación métricas ML | `ml/tests/` — accuracy, recall, ranges |
| RTS-020 | Navegación básica frontend | vitest — login, sidebar, rutas MVP |
| RTS-030 | Flujo E2E MVP | Playwright — flujo completo §10 |
| RTS-040 | Support UI (T-X05) | vitest support suite + manual [Phase-07-Support-UI](Manual/Phase-07-Support-UI.md) |
| RTS-041 | Audit logs (T-X06) | pytest `test_audit_logs.py` + manual Phase-07-Audit |
| RTS-042 | ML comparison (T-X07) | pytest `test_ml_comparison.py` + vitest + manual Phase-07-ML |
| RTS-043 | Dark mode (T-X03) | vitest theme + manual [Phase-08-Dark-Mode](Manual/Phase-08-Dark-Mode.md) |

### RTS-043 — archivos de test (T-X03, planificado)

| Archivo | Cubre |
|---|---|
| `frontend/src/lib/theme.test.ts` | resolveTheme, localStorage |
| `frontend/src/context/ThemeProvider.test.tsx` | class `dark` en document |
| `frontend/src/components/settings/AppearancePanel.test.tsx` | selector Light/Dark/System |
| Manual Phase-08 | MT-P08-THEME/UI/CHART P0 |

### RTS-040 — archivos de test (T-X05)

| Archivo | Cubre |
|---|---|
| `frontend/src/lib/supportKb.test.ts` | KB estática, filtro búsqueda |
| `frontend/src/lib/supportTicket.test.ts` | mailto URL |
| `frontend/src/services/support.test.ts` | `GET /support/contact` |
| `frontend/src/components/support/SupportKbSearch.test.tsx` | input búsqueda |
| `frontend/src/components/support/SupportTicketForm.test.tsx` | formulario ticket |
| `frontend/src/pages/SupportPage.test.tsx` | página integrada |
| `frontend/src/config/navigation.test.ts` | acceso `/support` todos los roles |
| `frontend/src/layouts/AppLayout.test.tsx` | enlace sidebar Support |
| `backend/tests/test_support.py` | API contacto autenticada |

### RTS-041 — archivos de test (T-X06)

| Archivo | Cubre |
|---|---|
| `backend/tests/test_audit_logs.py` | **RTS-041** write + query + 403 |
| `backend/tests/test_audit_hooks.py` | hooks por endpoint |
| `backend/tests/test_admin_audit_logs.py` | filtros y paginación API |
| `backend/tests/test_audit_service.py` | sanitización PHI |
| `backend/tests/test_audit_log_repository.py` | repositorio |
| `frontend/src/components/settings/AuditLogsPanel.test.tsx` | panel Audit + filtros |
| `frontend/src/pages/SettingsPage.test.tsx` | pestaña Audit en Settings |
| `frontend/src/services/auditLogs.test.ts` | cliente API audit logs |
| `frontend/src/config/navigation.test.ts` | RBAC `/settings` solo admin |

### RTS-042 — archivos de test (T-X07)

| Archivo | Cubre |
|---|---|
| `backend/tests/test_ml_comparison.py` | **RTS-042** API 200 analyst/admin + 403 clinician/nurse |
| `backend/tests/test_ml_comparison_service.py` | servicio offline artifacts |
| `backend/tests/test_openapi.py` | `/ml/models/comparison` en OpenAPI |
| `frontend/src/services/mlComparison.test.ts` | cliente API + validación payload |
| `frontend/src/lib/mlComparisonDisplay.test.ts` | explicación producción + chart data |
| `frontend/src/components/settings/ModelComparisonPanel.test.tsx` | panel tabla + explicación + chart |
| `frontend/src/components/settings/ModelComparisonMetricChart.test.tsx` | gráfico barras Recharts |
| `frontend/src/pages/SettingsPage.test.tsx` | pestaña Models en Settings |
| `frontend/src/config/navigation.test.ts` | RBAC Settings analyst/admin |

---

# 4. Estructura de carpetas

```text
medscope-ai/
├── backend/
│   └── tests/
│       ├── conftest.py
│       ├── test_auth*.py, test_security.py
│       ├── test_predictions.py, test_ml_registry.py
│       ├── test_simulations.py, test_simulation_service.py, test_simulation_mapper.py
│       ├── test_history.py, test_analytics.py, test_risk_format.py
│       ├── test_exception_handlers.py
│       └── test_models_*.py, test_openapi.py
├── ml/
│   └── tests/          # preprocessing, training, SHAP, métricas, serialización
├── frontend/
│   └── src/
│       └── **/*.{test.ts,test.tsx}
├── pyproject.toml      # Ruff (backend + ml)
├── scripts/lint.ps1    # Ruff + ESLint desde la raíz
└── tests/
    └── e2e/
        ├── auth.spec.ts
        ├── prediction-flow.spec.ts
        └── simulation-flow.spec.ts
```

---

# 5. Endpoints a testear (backend)

| Método | Endpoint | Casos |
|---|---|---|
| POST | `/auth/login` | credenciales válidas/inválidas, JWT (UC-001) |
| POST | `/predict` | input válido, SHAP en respuesta, latencia (UC-022–030) |
| POST | `/simulate` | comparación original vs simulado (UC-042–043) |
| GET | `/history` | listado, filtros (UC-050–051) |
| GET | `/analytics` | métricas agregadas (UC-060) |

Rutas protegidas: validar JWT y roles `admin`, `clinician`, `analyst`, `nurse` (UC-003).

---

# 6. Backend tests prioritarios

## 6.1 Authentication (UC-001–003)

- login correcto → JWT
- login inválido → 401
- endpoint protegido sin token → 401
- rol sin permiso → 403
- logout invalida sesión (UC-002)

## 6.2 Prediction API (UC-020–023, UC-030)

**Implementado:** `backend/tests/test_predictions.py` (7 tests).

- payload válido → 200 + `risk_score` + categoría + `prediction_time_ms` < 1000 (RNF-001)
- respuesta incluye SHAP / feature contributions
- input inválido → 422 (UC-090, RTS-002)
- predicción persistida en DB (UC-023), incl. `prediction_time_ms`
- ML no disponible → 503 sin reintentar `registry.load()`
- rol analyst → 403 en `/predict`

## 6.3 Simulation API (UC-040–044)

**Implementado:** `backend/tests/test_simulations.py` (6 tests), `test_simulation_service.py` (5), `test_simulation_mapper.py` (4).

- modificar variables → nuevo score (original vs simulado)
- simulación persistida (`simulations` + `simulation_inputs`)
- modificaciones vacías → 422
- predicción inexistente → 404
- rol analyst → 403 en `/simulate`

## 6.4 History & Analytics (UC-050–052, UC-060–062)

**Implementado:** `backend/tests/test_history.py` (6 tests), `backend/tests/test_analytics.py` (6 tests).

- GET `/history` devuelve predicciones tras `POST /predict`; `risk_score` / `risk_percent` alineados con `/predict`
- filtros por `risk_level`, `user_id`, rango de fechas inválido → 422
- GET `/analytics` devuelve KPIs, distribución de riesgo y tendencia diaria
- filtros `date_from` / `date_to`; nurse → 403, admin/analyst permitidos

## 6.4.1 Exception handlers (UC-091)

**Implementado:** `backend/tests/test_exception_handlers.py` (4 tests).

- validación Pydantic → 422 JSON sin stack trace
- `HTTPException` → JSON `{ "detail": ... }`
- excepción no controlada → 500 mensaje genérico, log en servidor
- catch-all delega `RequestValidationError` si llega a `ServerErrorMiddleware`

## 6.5 Database

- SQLite en memoria para tests unitarios rápidos
- opcional: PostgreSQL de test en Docker para integración (RNF-010)

---

# 7. Ejemplo backend (FastAPI + httpx)

```python
def test_predict_endpoint(client):
    payload = {
        "age": 65,
        "glucose": 140,
        "previous_admissions": 2,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "risk_score" in data
    assert "shap_explanations" in data  # UC-030
```

```bash
cd backend
pytest --cov=backend --cov-report=term-missing
```

---

# 8. ML tests (RTS-010)

Ubicación: `ml/tests/`

| Test | Valida |
|---|---|
| `test_model_load` | modelo y preprocessor cargan (UC-082) |
| `test_prediction_range` | score entre 0 y 1 |
| `test_preprocessing_consistency` | mismas features train/inference |
| `test_shap_output` | SHAP no nulo, top features (UC-030) |
| `test_metrics_threshold` | recall priorizado; accuracy > 75% (§15 KPIs) — **xfail documentado** |

**Última ejecución de referencia (repo local, jun 2026):** **93** passed (`backend/tests`), **80** passed + **1** xfailed (`ml/tests`), **126** passed (`frontend` vitest, 38 archivos) — **299** automatizados en total.

### Tests manuales por fase

Complementan pytest/vitest para defensa TFM y entorno real:

| Fase | Documento |
|---|---|
| 1 | [Manual/Phase-01-Backend-Database.md](Manual/Phase-01-Backend-Database.md) |
| 2 | [Manual/Phase-02-ML-Pipeline.md](Manual/Phase-02-ML-Pipeline.md) |
| 3 | [Manual/Phase-03-ML-Backend-Integration.md](Manual/Phase-03-ML-Backend-Integration.md) |
| 4 | [Manual/Phase-04-Frontend-Foundation.md](Manual/Phase-04-Frontend-Foundation.md) |
| 5 | [Manual/Phase-05-Clinical-Prediction-UI.md](Manual/Phase-05-Clinical-Prediction-UI.md) · [Manual/Phase-05-Clinical-Simulation-UI.md](Manual/Phase-05-Clinical-Simulation-UI.md) |
| 6 | [Manual/Phase-06-History-UI.md](Manual/Phase-06-History-UI.md) · [Manual/Phase-06-Analytics-UI.md](Manual/Phase-06-Analytics-UI.md) |

---

# 9. Frontend tests (RTS-020)

Prioridad baja-media. No pixel-perfect testing.

| Componente | Qué testear |
|---|---|
| Login form | render, validación, submit |
| Prediction form | campos clínicos, errores |
| Result view | score, gauge, SHAP bars |
| Sidebar | navegación RF-012 |
| Charts | render básico Recharts |

**Implementado (Fase 4):** login, logout toast, `RoleRoute`, `AppLayout`, `SplashPage`, `Spinner`/`Alert`, chart demo en dashboard.

**Implementado (Fase 5 — predicción UI, T-510–516):** formulario clínico, validación cliente, `POST /predict`, gauge + `RiskIndicator`, resumen XAI, barras SHAP, tokens RUX-011.

**Implementado (Fase 5 — simulación UI, T-520–523, US-021):** `SimulationPage`, panel sliders, recálculo debounced `POST /simulate`, `SimulationComparisonPanel`, persistencia `sessionStorage` (`simulationSession.ts`, `markSimulationForceReset` / `consumeSimulationForceReset` para F5 vs Run simulation) — archivos clave: `SimulationPage.test.tsx`, `SimulationComparisonPanel.test.tsx`, `simulationSession.test.ts`, `simulations.test.ts`, `simulationForm.test.ts`, `simulationDisplay.test.ts`.

**Implementado (Fase 6 — historial UI, T-601–604, US-022):** `HistoryPage`, `HistoryFiltersPanel`, `HistoryEvaluationsTable`, `HistoryDetailPage`, `listHistory`, `getHistoryDetail` — archivos clave: `HistoryPage.test.tsx`, `HistoryFiltersPanel.test.tsx`, `HistoryDetailPage.test.tsx`, `historyFilters.test.ts`, `historyDetail.test.ts`, `HistoryEvaluationsTable.test.tsx`, `history.test.ts`, `test_history.py`.

**Implementado (Fase 6 — analytics UI, T-605–609, US-023):** `AnalyticsPage`, `AnalyticsKpiCards`, `AnalyticsTrendChart`, `AnalyticsRiskDistributionChart`, `AnalyticsDateRangeFilter`, `getAnalytics` — archivos clave: `AnalyticsPage.test.tsx`, `analytics.test.ts`, `analyticsDateRange.test.ts`, `analyticsDisplay.test.ts`, `analyticsErrors.ts`.

**Implementado (Fase 6 — settings placeholder, T-610):** `SettingsPage`, ruta admin `/settings` — archivos clave: `SettingsPage.test.tsx`, `navigation.test.ts`, `AppLayout.test.tsx`.

Ver `frontend/src/**/*.test.{ts,tsx}` (**53 archivos, 164 tests**).

```bash
cd frontend
npm run test
npm run lint
npm run build
```

---

# 10. E2E — Playwright (MVP demo flow)

Ubicación: `tests/e2e/`

Flujo obligatorio (Requirements §17, Use Cases §17):

```text
login → dashboard → prediction → SHAP → simulation → history → analytics
```

Ejemplo:

```typescript
test('complete MVP flow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name=email]', 'clinician@test.com');
  await page.fill('input[name=password]', 'testpass');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL('/dashboard');
  // ... prediction, simulation, history, analytics
});
```

Recomendación TFM: **3–5 tests E2E** cubriendo el flujo completo.

---

# 11. Cobertura

| Área | Objetivo |
|---|---|
| Backend | **60–75%** (pytest-cov) |
| Frontend | pragmático — componentes críticos |
| ML | métricas + pipeline, no 100% líneas |
| E2E | flujos MVP, no exhaustivo |

```bash
pytest --cov=backend --cov-report=html
```

---

# 12. Estrategia por fases (alineada con Execution Plan)

| Fase | Semana aprox. | Testing |
|---|---|---|
| Setup + backend | 1 | ❌ mínimo — arquitectura inestable |
| ML pipeline | 2 | ✅ tests ML básicos |
| ML + backend integration | 3 | ✅ API tests (`/predict`, `/simulate`, `/history`, `/analytics`) |
| Frontend foundation | 4 | ✅ vitest básico (login, roles, layout, splash) |
| Core clinical features | 5–6 | ✅ integration tests + frontend predicción/simulación/historial/analytics (vitest) + [Manual Phase 05 predicción](Manual/Phase-05-Clinical-Prediction-UI.md) + [Manual Phase 05 simulación](Manual/Phase-05-Clinical-Simulation-UI.md) + [Manual Phase 06 historial](Manual/Phase-06-History-UI.md) + [Manual Phase 06 analytics](Manual/Phase-06-Analytics-UI.md) |
| Polish + hardening | 7 | ✅ E2E Playwright + coverage report |

Enfoque: **feature first → estabilizar → automatizar tests** (no TDD estricto en UI/ML experimental).

---

# 13. Niveles de testing

| Nivel | Prioridad | Descripción |
|---|---|---|
| Integration | **Alta** | API + DB + ML juntos |
| E2E | **Alta** | Flujo usuario MVP |
| Backend unit | Media | auth, validación, servicios |
| ML validation | Media | métricas, SHAP, ranges |
| Frontend unit | Baja | formularios y navegación |

---

# 14. TDD — dónde sí y dónde no

## Usar TDD / tests inmediatos

- prediction service (input → output claro)
- validación de schemas
- simulation calculations
- risk classification logic
- auth / JWT

## No usar TDD estricto

- UI/UX exploratorio
- dashboards y charts
- SHAP visualizations
- diseño (ver `docs/Design/`)

---

# 15. Qué demostrar en la defensa

- pytest ejecutándose con coverage report
- tests API (auth + predict + simulate)
- validación ML (métricas + SHAP)
- 3–5 flujos Playwright del MVP
- integración frontend ↔ backend ↔ ML ↔ PostgreSQL

---

# 16. Qué evitar

- Cypress / Selenium (usar Playwright)
- TDD estricto en todo el proyecto
- 100% coverage como objetivo
- tests frontend excesivos
- PostgreSQL real en cada unit test (usar SQLite o fixtures)
- testing de features fuera del MVP (UC-120–124)

---

# 17. Stack resumen

```text
Backend:  pytest + pytest-cov + httpx + ruff
Frontend: vitest + @testing-library/react + eslint
E2E:      playwright
ML:       pytest + métricas scikit-learn + ruff
```

Volumen recomendado TFM: **~90+ backend tests** (MVP APIs cubiertas) + **3–5 E2E** + **tests ML básicos** + **vitest frontend** (~20 tests).

### Lint (calidad estática)

Ejecutar antes de commit o demo:

```powershell
# Desde la raíz (Windows)
.\scripts\lint.ps1

# O por capa
ruff check backend ml
ruff format --check backend ml
cd frontend && npm run lint
```

Configuración: `pyproject.toml` (Ruff, línea 120), `frontend/eslint.config.js` (ESLint 9 flat config).

---

# 18. Tests manuales por fase

Checklists ejecutables por una persona **sin experiencia previa** en la aplicación. Documentación en español; la UI y la API permanecen en inglés.

| Recurso | Ubicación |
|---|---|
| Índice y convenciones | [`Manual/README.md`](Manual/README.md) |
| Fase 1 — Backend + BD | [`Manual/Phase-01-Backend-Database.md`](Manual/Phase-01-Backend-Database.md) |
| Fase 2 — Pipeline ML | [`Manual/Phase-02-ML-Pipeline.md`](Manual/Phase-02-ML-Pipeline.md) |
| Fase 3 — ML + Backend | [`Manual/Phase-03-ML-Backend-Integration.md`](Manual/Phase-03-ML-Backend-Integration.md) |
| Fase 4 — Frontend base | [`Manual/Phase-04-Frontend-Foundation.md`](Manual/Phase-04-Frontend-Foundation.md) |
| Fase 7 — Support (T-X05) | [`Manual/Phase-07-Support-UI.md`](Manual/Phase-07-Support-UI.md) |
| Fase 7 — Audit (T-X06) | [`Manual/Phase-07-Audit-Logs.md`](Manual/Phase-07-Audit-Logs.md) |
| Fase 7 — ML models (T-X07) | [`Manual/Phase-07-ML-Model-Comparison.md`](Manual/Phase-07-ML-Model-Comparison.md) |
| Fase 8 — Dark mode (T-X03) | [`Manual/Phase-08-Dark-Mode.md`](Manual/Phase-08-Dark-Mode.md) |

Cada caso incluye: precondiciones, pasos detallados, resultado esperado, criterios de aceptación y tabla para marcar ejecución (`[ ]` → `[x]`).

Complementan (no sustituyen) `pytest` / Playwright: validan entorno real (Docker, PostgreSQL, Swagger) antes de demos y defensa del TFM.

---

# Appendix — UC coverage matrix

| Use case | Test type | File |
|---|---|---|
| UC-001–003 | backend + E2E | `test_auth.py`, `auth.spec.ts` |
| UC-020–023 | backend + E2E | `test_predictions.py` |
| UC-030–032 | backend + ML | `test_shap.py`, `test_predictions.py` |
| UC-040–044 | backend + frontend vitest + manual | `test_simulations.py`, `SimulationPage.test.tsx` |
| UC-050–052 | backend + frontend vitest (UC-050) + manual | `test_history.py`, `HistoryPage.test.tsx`, `history.test.ts` |
| UC-060–062 | backend + frontend vitest (UC-060–062) + manual | `test_analytics.py`, `AnalyticsPage.test.tsx`, `analytics.test.ts` |
| UC-090 | backend | validación en todos los endpoints |
| UC-091 | backend | `test_exception_handlers.py` |
| UC-101–103 | frontend + E2E | `ux-feedback.test.tsx`, `LoginPage.logout.test.tsx` |
| UC-064–065 | frontend vitest + manual | `SupportPage.test.tsx`, Phase-07-Support |
| UC-081, UC-085 | backend pytest + manual | `test_audit_logs.py`, Phase-07-Audit |
| UC-084 | backend + frontend + manual | `test_ml_comparison.py`, Phase-07-ML |
| UC-086 (prop.) | frontend vitest + manual | theme tests, Phase-08-Dark-Mode |
