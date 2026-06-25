# Fase 6 — Tests manuales: Analytics (UI)

**Alcance:** Pantalla `/analytics`, integración `GET /analytics`, KPIs, tendencia, distribución de riesgo, filtros temporales (T-605–609, US-023, UC-060–062).

**Referencia:** [Task Tracker — Fase 6](../../TaskTracker.md#fase-6--historial--analytics) · [analytics mockup](../../Design/screens/analytics/reference.html)

**Prerrequisito:** Al menos una predicción persistida. API `/analytics` validada en [Phase 03](Phase-03-ML-Backend-Integration.md).

---

## Resumen de progreso


| Prioridad | Total | Ejecutados | Pendientes |
| --------- | ----- | ---------- | ---------- |
| P0        | 5     | 5          | 0          |
| P1        | 2     | 2          | 0          |
| **Total** | **7** | **7**      | **0**      |



| Área                   | Tests | IDs                    |
| ---------------------- | ----- | ---------------------- |
| INF — Arranque         | 1     | MT-P06-ANAL-INF-001    |
| DASH — Dashboard       | 2     | MT-P06-ANAL-001 … 002  |
| FILTER — Filtros fecha | 1     | MT-P06-ANAL-FILTER-001 |
| RBAC — Roles           | 1     | MT-P06-ANAL-RBAC-001   |
| P1 — Regresión         | 2     | MT-P06-ANAL-003 … 004  |


---

## Antes de empezar

```powershell
.\dev.bat
```


| Check    | URL                                                          | Esperado                       |
| -------- | ------------------------------------------------------------ | ------------------------------ |
| Frontend | [http://localhost:5173](http://localhost:5173)               | Sin error en consola           |
| Backend  | [http://localhost:8000/health](http://localhost:8000/health) | `status: ok`, `ml_ready: true` |


### Seed de datos

1. Login `clinician@medscope.ai` / `MedScope123!`
2. **Evaluation** → completar formulario → **Generate AI prediction** (repetir para más volumen)

### Credenciales demo


| Email                   | Rol       | Contraseña     | Acceso `/analytics` |
| ----------------------- | --------- | -------------- | ------------------- |
| `analyst@medscope.ai`   | analyst   | `MedScope123!` | Sí                  |
| `admin@medscope.ai`     | admin     | `MedScope123!` | Sí                  |
| `clinician@medscope.ai` | clinician | `MedScope123!` | No (RBAC)           |
| `nurse@medscope.ai`     | nurse     | `MedScope123!` | No (RBAC)           |


---

## P0 — Bloqueantes (US-023)

### MT-P06-ANAL-INF-001 — Stack listo


| Campo          | Valor                |
| -------------- | -------------------- |
| **Prioridad**  | P0                   |
| **Requisitos** | T-605, T-609, UC-060 |


**Pasos**

1. Ejecutar `.\dev.bat`.
2. Login `analyst@medscope.ai` sin errores de consola.

**Criterios de aceptación**

- [x] `/analytics` carga sin error 500.
- [x] Spinner desaparece y se muestran KPIs o estado vacío coherente.

**Ejecución manual**


| Fecha      | Resultado | Notas |
| ---------- | --------- | ----- |
| 25/06/2026 | [OK] Pass |       |


| Campo          | Valor         |
| -------------- | ------------- |
| **Prioridad**  | P0            |
| **Requisitos** | T-608, RF-062 |


**Pasos**

1. Ir a **Analytics**.
2. Verificar 4 tarjetas: total evaluations, average risk, high risk, avg inference time.

**Criterios de aceptación**

- [x] Valores numéricos coinciden con datos persistidos (aprox.).
- [x] Sin valores `NaN` ni placeholders rotos.

**Ejecución manual**


| Fecha      | Resultado | Notas |
| ---------- | --------- | ----- |
| 25/06/2026 | [OK] Pass |       |


---

### MT-P06-ANAL-002 — Charts población


| Campo          | Valor                 |
| -------------- | --------------------- |
| **Prioridad**  | P0                    |
| **Requisitos** | T-606, UC-061, UC-062 |


**Pasos**

1. En `/analytics`, revisar gráfico de tendencia (volumen + riesgo medio).
2. Revisar gráfico de distribución Low / Medium / High.

**Criterios de aceptación**

- [x] Ambos charts renderizan sin error.
- [x] Colores de riesgo coherentes (verde / ámbar / rojo).

**Ejecución manual**


| Fecha      | Resultado | Notas |
| ---------- | --------- | ----- |
| 25/06/2026 | [OK] Pass |       |


---

### MT-P06-ANAL-FILTER-001 — Filtro temporal


| Campo          | Valor         |
| -------------- | ------------- |
| **Prioridad**  | P0            |
| **Requisitos** | T-607, RF-061 |


**Pasos**

1. Cambiar preset a **Last 90 days** → datos se recargan.
2. Cambiar a **All time** → KPIs/charts actualizan.
3. **Custom range** con fechas válidas → Apply → datos filtrados.

**Criterios de aceptación**

- [x] Label "Showing:" refleja el rango activo.
- [x] Rango inválido (from > to) muestra error y no aplica.

**Ejecución manual**


| Fecha      | Resultado | Notas |
| ---------- | --------- | ----- |
| 25/06/2026 | [OK] Pass |       |


---

### MT-P06-ANAL-RBAC-001 — Roles analytics


| Campo          | Valor          |
| -------------- | -------------- |
| **Prioridad**  | P0             |
| **Requisitos** | UC-060, RF-004 |


**Pasos**

1. Login `clinician@medscope.ai` → sidebar no muestra Analytics (o ruta bloqueada).
2. Login `analyst@medscope.ai` → Analytics accesible.

**Criterios de aceptación**

- [x] Clinician/nurse no acceden al dashboard analítico.
- [x] Analyst/admin sí acceden.

**Ejecución manual**


| Fecha      | Resultado | Notas |
| ---------- | --------- | ----- |
| 25/06/2026 | [OK] Pass |       |


---

## P1 — Regresión

### MT-P06-ANAL-003 — Estado vacío


| Campo          | Valor  |
| -------------- | ------ |
| **Prioridad**  | P1     |
| **Requisitos** | UC-060 |


**Pasos**

1. Aplicar custom range sin predicciones en ese periodo.

**Criterios de aceptación**

- [x] KPIs en cero y mensajes vacíos en charts sin crash.

**Ejecución manual**


| Fecha      | Resultado | Notas |
| ---------- | --------- | ----- |
| 25/06/2026 | [OK] Pass |       |


---

### MT-P06-ANAL-004 — Error API


| Campo          | Valor  |
| -------------- | ------ |
| **Prioridad**  | P1     |
| **Requisitos** | UC-091 |


**Pasos**

1. Detener backend, recargar `/analytics`.

**Criterios de aceptación**

- [x] Mensaje de error legible (sin stack trace).

**Ejecución manual**


| Fecha      | Resultado | Notas |
| ---------- | --------- | ----- |
| 25/06/2026 | [OK] Pass |       |


---

## Trazabilidad automática


| ID manual              | Tests vitest                                                              |
| ---------------------- | ------------------------------------------------------------------------- |
| MT-P06-ANAL-001        | `AnalyticsKpiCards.test.tsx`                                              |
| MT-P06-ANAL-002        | `AnalyticsTrendChart.test.tsx`, `AnalyticsRiskDistributionChart.test.tsx` |
| MT-P06-ANAL-FILTER-001 | `AnalyticsDateRangeFilter.test.tsx`, `analyticsDateRange.test.ts`         |
| MT-P06-ANAL-INF-001    | `AnalyticsPage.test.tsx`, `analytics.test.ts`                             |
| MT-P06-ANAL-003        | `AnalyticsPage.test.tsx` (estado vacío vía filtros)                       |
| MT-P06-ANAL-004        | `analyticsErrors.test.ts`, `AnalyticsPage.test.tsx` (403)                 |
| Backend                | `backend/tests/test_analytics.py`                                         |
