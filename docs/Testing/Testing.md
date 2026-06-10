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

---

# 4. Estructura de carpetas

```text
medscope-ai/
├── backend/
│   └── tests/
│       ├── conftest.py
│       ├── test_auth.py
│       ├── test_predictions.py
│       ├── test_simulations.py
│       ├── test_history.py
│       └── test_analytics.py
├── ml/
│   └── tests/
│       ├── test_model_load.py
│       ├── test_preprocessing.py
│       ├── test_inference.py
│       └── test_shap.py
├── frontend/
│   └── src/
│       └── **/*.test.tsx
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

- payload válido → 200 + `risk_score` + categoría
- respuesta incluye SHAP / feature contributions
- input inválido → 422 (UC-090, RTS-002)
- predicción persistida en DB (UC-023)

## 6.3 Simulation API (UC-040–044)

- modificar variables → nuevo score
- respuesta incluye original vs simulado
- simulación persistida

## 6.4 History & Analytics (UC-050–052, UC-060–062)

- GET `/history` devuelve predicciones
- filtros por fecha / riesgo
- GET `/analytics` devuelve agregados

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
| `test_metrics_threshold` | recall priorizado; accuracy > 75% (§15 KPIs) |

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

```bash
cd frontend
npm run test
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
| ML + backend integration | 3 | ✅ API tests (`/predict`, `/simulate`) |
| Frontend foundation | 4 | ❌ UI aún cambia |
| Core clinical features | 5–6 | ✅ integration tests + frontend básico |
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
Backend:  pytest + pytest-cov + httpx
Frontend: vitest + @testing-library/react
E2E:      playwright
ML:       pytest + métricas scikit-learn
```

Volumen recomendado TFM: **15–20 backend tests** + **3–5 E2E** + **tests ML básicos** + **algunos frontend**.

---

# Appendix — UC coverage matrix

| Use case | Test type | File |
|---|---|---|
| UC-001–003 | backend + E2E | `test_auth.py`, `auth.spec.ts` |
| UC-020–023 | backend + E2E | `test_predictions.py` |
| UC-030–032 | backend + ML | `test_shap.py`, `test_predictions.py` |
| UC-040–044 | backend + E2E | `test_simulations.py` |
| UC-050–052 | backend + E2E | `test_history.py` |
| UC-060–062 | backend + E2E | `test_analytics.py` |
| UC-090 | backend | validación en todos los endpoints |
| UC-091 | backend | exception handlers |
| UC-101–103 | frontend + E2E | loading/error states |
