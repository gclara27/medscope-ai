# Fase 5 — Tests manuales: Predicción clínica (UI)

**Alcance:** Formulario de evaluación (`/evaluation`), validación cliente, integración `POST /predict`, pantalla de resultado con gauge, resumen XAI, barras SHAP y colores de riesgo RUX-011 (T-510–516, US-020).

**Referencia:** [Task Tracker — Fase 5](../../TaskTracker.md#fase-5--features-clínicas) · [prediction-form](../../Design/screens/prediction-form/reference.html) · [prediction-result](../../Design/screens/prediction-result/reference.html)

**Prerrequisito:** Fase 3 (API `/predict` + ML) y Fase 4 (login, layout, proxy Vite) operativas.

---

## Resumen de progreso

| Prioridad | Total | Ejecutados | Pendientes |
| --------- | ----- | ---------- | ---------- |
| P0        | 9     | 0          | 9          |
| P1        | 3     | 0          | 3          |
| **Total** | **12**| **0**      | **12**     |

| Área | Tests | IDs |
| --- | --- | --- |
| INF — Arranque stack | 1 | MT-P05-INF-001 |
| EVAL — Formulario y API | 3 | MT-P05-EVAL-001 … 003 |
| RES — Pantalla resultado | 4 | MT-P05-RES-001 … 004 |
| P1 — RBAC y regresión | 3 | MT-P05-RBAC-001, MT-P05-REG-001 … 002 |

---

## Antes de empezar

### Arranque recomendado

```powershell
.\dev.bat
```

| Check | URL | Esperado |
| --- | --- | --- |
| Frontend | http://localhost:5173 | Carga sin error en consola |
| Backend | http://localhost:8000/health | `status: ok`, `ml_ready: true` |
| Proxy Vite | Login desde UI | Petición a `/auth/login` sin CORS |

Si `ml_ready: false`, ejecutar `python ml/scripts/serialize_model.py` y reiniciar el backend.

### Credenciales demo

| Email | Rol | Contraseña |
| --- | --- | --- |
| `clinician@medscope.ai` | clinician | `MedScope123!` |
| `nurse@medscope.ai` | nurse | `MedScope123!` |

---

## P0 — Bloqueantes

### MT-P05-INF-001 — Stack listo para predicción UI

| Campo | Valor |
| --- | --- |
| **Prioridad** | P0 |
| **Requisitos** | T-512, UC-022 |

**Pasos**

1. Ejecutar `.\dev.bat`.
2. Abrir http://localhost:8000/health y http://localhost:5173.

**Criterios de aceptación**

- [ ] `ml_ready: true` en `/health`.
- [ ] Login como `clinician@medscope.ai` redirige al dashboard sin errores de consola.

---

### MT-P05-EVAL-001 — Formulario clínico visible

| Campo | Valor |
| --- | --- |
| **Prioridad** | P0 |
| **Requisitos** | T-510, RF-020, UC-020 |

**Pasos**

1. Como clinician, navega a **Evaluation** (`/evaluation`).

**Criterios de aceptación**

- [ ] Título y secciones del formulario (demographics, vitals, admissions).
- [ ] Botón **Generate AI prediction** visible.
- [ ] Ya no es página placeholder (Fase 4).

---

### MT-P05-EVAL-002 — Validación cliente

| Campo | Valor |
| --- | --- |
| **Prioridad** | P0 |
| **Requisitos** | T-511, RF-021, UC-021 |

**Pasos**

1. En `/evaluation`, vacía campos obligatorios o introduce valores fuera de rango (p. ej. edad negativa).
2. Pulsa **Generate AI prediction**.

**Criterios de aceptación**

- [ ] Mensajes de error junto a los campos afectados.
- [ ] No se llama a la API (sin navegación a resultado).
- [ ] Tras corregir valores, el error desaparece al revalidar.

---

### MT-P05-EVAL-003 — Flujo predict end-to-end

| Campo | Valor |
| --- | --- |
| **Prioridad** | P0 |
| **Requisitos** | T-512, UC-022–023, RF-022 |

**Pasos**

1. Completa el formulario con valores válidos (o usa valores por defecto del formulario).
2. Pulsa **Generate AI prediction**.
3. Espera la respuesta.

**Criterios de aceptación**

- [ ] Navegación a `/evaluation/result`.
- [ ] Sin toast/error de API.
- [ ] Tiempo de respuesta percibido &lt; 3 s en entorno local (objetivo RNF-001: &lt; 1 s backend).

---

### MT-P05-RES-001 — Gauge y categoría de riesgo

| Campo | Valor |
| --- | --- |
| **Prioridad** | P0 |
| **Requisitos** | T-513, RF-023, RFW-021 |

**Pasos**

1. Tras MT-P05-EVAL-003, revisa la tarjeta de riesgo.

**Criterios de aceptación**

- [ ] Gauge circular con porcentaje numérico.
- [ ] Badge **LOW / MEDIUM / HIGH RISK** coherente con el score.
- [ ] Bloque de recomendación clínica (RiskIndicator) debajo del gauge.

---

### MT-P05-RES-002 — Barras SHAP

| Campo | Valor |
| --- | --- |
| **Prioridad** | P0 |
| **Requisitos** | T-514, RF-030, UC-030 |

**Pasos**

1. En la misma pantalla, desplázate a **Explainable AI (XAI) Analysis**.

**Criterios de aceptación**

- [ ] Lista de factores ordenados por importancia.
- [ ] Barras rojas hacia la derecha (aumentan riesgo) y teal hacia la izquierda (reducen riesgo).
- [ ] Leyenda **Increased risk** / **Decreased risk** visible.

---

### MT-P05-RES-003 — Resumen XAI textual

| Campo | Valor |
| --- | --- |
| **Prioridad** | P0 |
| **Requisitos** | T-515, RF-032, UC-032 |

**Pasos**

1. Revisa la tarjeta **AI clinical summary** junto al gauge.

**Criterios de aceptación**

- [ ] Texto del backend (`summary`) legible, tono clínico neutral.
- [ ] Factores de riesgo resaltados; disclaimer en bloque **Clinical insight**.
- [ ] Enlace **View full SHAP analysis** lleva a la sección SHAP (`#xai-analysis`).

---

### MT-P05-RES-004 — Colores RUX-011

| Campo | Valor |
| --- | --- |
| **Prioridad** | P0 |
| **Requisitos** | T-516, RUX-011 |

**Pasos**

1. Repite predicción si hace falta para ver distintos niveles (o compara varias ejecuciones).
2. Observa gauge, badge e indicador de recomendación.

**Criterios de aceptación**

- [ ] **Low:** verde (`#16a34a`).
- [ ] **Medium:** ámbar (`#f59e0b`).
- [ ] **High:** rojo (`#dc2626`).
- [ ] Colores de riesgo no se mezclan con `error` del design system salvo en errores de formulario.

---

### MT-P05-RES-005 — Estado sin navegación

| Campo | Valor |
| --- | --- |
| **Prioridad** | P0 |
| **Requisitos** | T-512 |

**Pasos**

1. Abre directamente http://localhost:5173/evaluation/result (sin haber predicho en la sesión).

**Criterios de aceptación**

- [ ] Redirección a `/evaluation` (no pantalla en blanco ni error).

---

## P1 — Importantes

### MT-P05-RBAC-001 — Rol clinician / admin

| Campo | Valor |
| --- | --- |
| **Prioridad** | P1 |
| **Requisitos** | RF-012 |

**Pasos**

1. Login como `nurse@medscope.ai`.
2. Intenta acceder a `/evaluation` por URL.

**Criterios de aceptación**

- [ ] Nurse no ve Evaluation en sidebar (o ruta no accesible según configuración actual).
- [ ] Clinician y admin sí acceden al flujo completo.

---

### MT-P05-REG-001 — Tests automáticos frontend (predicción)

```powershell
cd frontend
npm run test
npm run build
npm run lint
```

**Criterios de aceptación**

- [ ] Vitest: **62** tests passed (**19** archivos).
- [ ] `npm run build` sin errores TypeScript.
- [ ] ESLint sin errores (warnings preexistentes aceptables).

---

### MT-P05-REG-002 — Suite completa repositorio

```powershell
.\scripts\lint.ps1
cd backend; pytest -q
cd ..\ml; pytest -q
```

**Criterios de aceptación**

- [ ] Ruff + ESLint OK.
- [ ] Backend: **93** passed.
- [ ] ML: **80** passed, **1** xfail esperado.

---

## Relación con tests automáticos

| Manual | Automatizado (`frontend/src`) |
| --- | --- |
| MT-P05-EVAL-001/002 | `ClinicalEvaluationForm.test.tsx`, `clinicalFormValidation.test.ts` |
| MT-P05-EVAL-003, MT-P05-RES-* | `EvaluationPage.test.tsx` |
| MT-P05-RES-001 | `RiskGaugeChart.test.tsx`, `riskDisplay.test.ts` |
| MT-P05-RES-002 | `ShapExplanationChart.test.tsx`, `shapDisplay.test.ts` |
| MT-P05-RES-003 | `XaiClinicalSummary.test.tsx`, `xaiSummaryDisplay.test.ts` |
| API predict | `predictions.test.ts`, `backend/tests/test_predictions.py` |

---

## Registro de sesiones

| Fecha | Ejecutado por | Commit / rama | P0 | P1 | Comentarios |
| --- | --- | --- | --- | --- | --- |
| | | | | | |
