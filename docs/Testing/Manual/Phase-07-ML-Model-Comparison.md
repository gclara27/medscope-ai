# Fase 7 — Tests manuales: ML model comparison (T-X07)

**Alcance:** `GET /ml/models/comparison`, panel Models en Settings, métricas offline LR/RF/XGBoost (T-X07-01 … T-X07-07, US-042, UC-084).

**Referencia:** [Task Tracker — Fase X](../../TaskTracker.md#us-042--ml-model-comparison) · [ML-Pipeline](../../ML/ML-Pipeline.md) · [Plan](../../Optional%20Features/Optional-Backlog-Plan.md)

**Prerrequisito:** Artefactos Fase 2 presentes (`models/model_manifest.json`, comparación baselines). ML `ml_ready: true`.

---

## Resumen de progreso

| Prioridad | Total | Ejecutados | Pendientes |
| --------- | ----- | ---------- | ---------- |
| P0        | 5     | 0          | 5          |
| P1        | 2     | 0          | 2          |
| **Total** | **7** | **0**      | **7**      |

| Área | Tests | IDs |
| --- | ----- | --- |
| API | 1 | MT-P07-ML-API-001 |
| UI — Panel | 2 | MT-P07-ML-UI-001 … 002 |
| RBAC | 1 | MT-P07-ML-RBAC-001 |
| CHART | 1 | MT-P07-ML-CHART-001 |
| P1 — Copy | 1 | MT-P07-ML-COPY-001 |

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

- [ ] Login `analyst@medscope.ai` → obtener JWT
- [ ] `GET /ml/models/comparison` con Authorization
- [ ] **Esperado:** 200 JSON con `production_model` y array `models[]` con métricas (recall, accuracy, etc.)

### MT-P07-ML-UI-001 — Pestaña Models en Settings

- [ ] Login `analyst@medscope.ai` → Settings → **Models**
- [ ] **Esperado:** Tabla con Logistic Regression, Random Forest, XGBoost (si artefacto existe)
- [ ] **Esperado:** Badge o texto “Production model” en modelo activo del manifest

### MT-P07-ML-UI-002 — Métricas recall visibles

- [ ] Revisar columna recall por modelo
- [ ] **Esperado:** Valores numéricos coherentes (0–1 o % documentado)
- [ ] **Esperado:** Texto indica comparación **offline** / training evaluation

### MT-P07-ML-CHART-001 — Gráfico comparativo

- [ ] **Esperado:** Gráfico de barras (recall o métrica principal) renderiza sin error consola

### MT-P07-ML-RBAC-001 — Clinician sin acceso

- [ ] `clinician@medscope.ai` → Settings
- [ ] **Esperado:** Pestaña Models no visible O 403 en API
- [ ] `GET /ml/models/comparison` con token clinician → **403**

---

## P1 — Regresión

### MT-P07-ML-COPY-001 — Artefactos faltantes

- [ ] (Opcional) Renombrar temporalmente `baseline_comparison.json` y recargar
- [ ] **Esperado:** Mensaje amigable “comparison unavailable”, no crash
- [ ] Restaurar archivo

---

## Criterio de cierre US-042

- [ ] Todos los P0 marcados
- [ ] `pytest test_ml_comparison.py` + vitest panel en verde
- [ ] T-X07 marcado `[x]` en TaskTracker
