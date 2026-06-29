# Fase 7 — Tests manuales: ML model comparison (T-X07)

**Alcance:** `GET /ml/models/comparison`, panel Models en Settings, métricas offline LR/RF/XGBoost (T-X07-01 … T-X07-08, US-042, UC-084).

**Referencia:** [Task Tracker — Fase X](../../TaskTracker.md#us-042--ml-model-comparison) · [ML-Pipeline](../../ML/ML-Pipeline.md) · [Plan](../../Optional%20Features/Optional-Backlog-Plan.md)

**Prerrequisito:** Artefactos Fase 2 presentes (`models/model_manifest.json`, comparación baselines). ML `ml_ready: true`. Proxy Vite `/ml` activo (reiniciar frontend tras cambios en `vite.config.ts`).

---

## Resumen de progreso

| Prioridad | Total | Automatizados (RTS-042) | Pendientes manuales |
| --------- | ----- | ----------------------- | ------------------- |
| P0        | 5     | 5                       | 0 (smoke opcional)  |
| P1        | 2     | 1                       | 1                   |
| **Total** | **7** | **6**                   | **1**               |

| Área | Tests | IDs | Automatización |
| --- | ----- | --- | -------------- |
| API | 1 | MT-P07-ML-API-001 | `test_ml_comparison.py` |
| UI — Panel | 2 | MT-P07-ML-UI-001 … 002 | `ModelComparisonPanel.test.tsx` |
| RBAC | 1 | MT-P07-ML-RBAC-001 | pytest 403 + `navigation.test.ts` |
| CHART | 1 | MT-P07-ML-CHART-001 | `ModelComparisonMetricChart.test.tsx` |
| P1 — Copy | 1 | MT-P07-ML-COPY-001 | parcial (`is_available` en panel) |

---

## Antes de empezar

```powershell
.\dev.bat
```

Verificar artefactos:

```powershell
Test-Path models\model_manifest.json
Test-Path models\baseline_comparison.json
```

---

## P0 — Críticos

### MT-P07-ML-API-001 — Endpoint comparison

- [x] **Automatizado:** `pytest backend/tests/test_ml_comparison.py`
- [ ] Login `analyst@medscope.ai` → obtener JWT (smoke opcional)
- [ ] `GET /ml/models/comparison` con Authorization
- [ ] **Esperado:** 200 JSON con `production_model_id` y array `models[]` con métricas (recall, accuracy, etc.)

### MT-P07-ML-UI-001 — Pestaña Models en Settings

- [x] **Automatizado:** `SettingsPage.test.tsx`, `ModelComparisonPanel.test.tsx`
- [ ] Login `analyst@medscope.ai` → Settings → **Models**
- [ ] **Esperado:** Tabla con Logistic Regression, Random Forest, XGBoost (si artefacto existe)
- [ ] **Esperado:** Badge o texto “Production model” en modelo activo del manifest

### MT-P07-ML-UI-002 — Métricas recall visibles

- [x] **Automatizado:** panel tests (columna recall % + offline note)
- [ ] Revisar columna recall por modelo
- [ ] **Esperado:** Valores numéricos coherentes (0–1 o % documentado)
- [ ] **Esperado:** Texto indica comparación **offline** / training evaluation

### MT-P07-ML-CHART-001 — Gráfico comparativo

- [x] **Automatizado:** `ModelComparisonMetricChart.test.tsx`
- [ ] **Esperado:** Gráfico de barras (recall o métrica principal) renderiza sin error consola

### MT-P07-ML-RBAC-001 — Clinician sin acceso

- [x] **Automatizado:** `test_ml_comparison.py` (403 clinician/nurse)
- [ ] `clinician@medscope.ai` → Settings
- [ ] **Esperado:** Pestaña Models no visible O 403 en API
- [ ] `GET /ml/models/comparison` con token clinician → **403**

---

## P1 — Regresión

### MT-P07-ML-COPY-001 — Artefactos faltantes

- [x] **Automatizado:** panel test `is_available: false`
- [ ] (Opcional) Renombrar temporalmente `baseline_comparison.json` y recargar
- [ ] **Esperado:** Mensaje amigable “comparison unavailable”, no crash
- [ ] Restaurar archivo

---

## Criterio de cierre US-042

- [x] RTS-042 en verde (`pytest test_ml_comparison*.py` + vitest panel/chart)
- [x] T-X07 marcado `[x]` en TaskTracker
- [ ] Smoke manual P0 opcional en entorno local
