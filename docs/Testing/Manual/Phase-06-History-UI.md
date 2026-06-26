# Fase 6 — Tests manuales: Historial (UI)

**Alcance:** Pantallas `/history`, `/history/:id`, integración `GET /history` y `GET /history/{id}`, lista paginada, filtros, detalle con SHAP (T-601–603, T-604, US-022, UC-050–052).

**Estado fase:** cerrada (implementación + tests automáticos). QA manual opcional en MT-P06-HIST-005/006.

**Referencia:** [Task Tracker — Fase 6](../../TaskTracker.md#fase-6--historial--analytics) · [history mockup](../../Design/screens/history/reference.html)

**Prerrequisito:** Al menos una predicción persistida (clinician → Evaluation → submit). API `/history` validada en [Phase 03](Phase-03-ML-Backend-Integration.md).

---

## Resumen de progreso


| Prioridad | Total | Ejecutados | Pendientes |
| --------- | ----- | ---------- | ---------- |
| P0        | 4     | 4          | 0          |
| P1        | 2     | 0          | 2          |
| **Total** | **6** | **4**      | **2**      |



| Área                    | Tests | IDs                   |
| ----------------------- | ----- | --------------------- |
| INF — Arranque          | 1     | MT-P06-HIST-INF-001   |
| LIST — Lista historial  | 2     | MT-P06-HIST-001 … 002 |
| RBAC — Roles            | 1     | MT-P06-HIST-RBAC-001  |
| P1 — Paginación y roles | 2     | MT-P06-HIST-003 … 004 |


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
2. **Evaluation** → completar formulario → **Generate AI prediction** (repetir si quieres varias filas)

### Credenciales demo


| Email                   | Rol       | Contraseña     |
| ----------------------- | --------- | -------------- |
| `clinician@medscope.ai` | clinician | `MedScope123!` |
| `nurse@medscope.ai`     | nurse     | `MedScope123!` |
| `admin@medscope.ai`     | admin     | `MedScope123!` |
| `analyst@medscope.ai`   | analyst   | `MedScope123!` |


---

## P0 — Bloqueantes (US-022)

### MT-P06-HIST-INF-001 — Stack listo


| Campo          | Valor         |
| -------------- | ------------- |
| **Prioridad**  | P0            |
| **Requisitos** | T-604, UC-050 |


**Pasos**

1. Ejecutar `.\dev.bat`.
2. Verificar health y login clinician sin errores de consola.

**Criterios de aceptación**

- [x] Backend y frontend operativos.
- [x] Al menos 1 predicción en BD tras evaluación clinician.

---

### MT-P06-HIST-001 — Nurse accede al historial


| Campo          | Valor                 |
| -------------- | --------------------- |
| **Prioridad**  | P0                    |
| **Requisitos** | US-022, UC-050, T-601 |


**Pasos**

1. Login `nurse@medscope.ai`.
2. Sidebar → **History** (`/history`).

**Criterios de aceptación**

- [x] Página **Prediction History** carga sin 403 ni error en consola.
- [x] Tabla **Historical AI evaluations** visible.
- [x] Nurse **no** ve Evaluation ni Simulation en sidebar.

---

### MT-P06-HIST-002 — Lista con datos reales


| Campo          | Valor                        |
| -------------- | ---------------------------- |
| **Prioridad**  | P0                           |
| **Requisitos** | T-601, T-604, RF-050, UC-050 |


**Pasos**

1. Tras MT-P06-HIST-INF-001, abrir `/history` como nurse o clinician.

**Criterios de aceptación**

- [x] Filas con fecha/hora, evaluator, snapshot paciente, risk % y badge LOW/MEDIUM/HIGH.
- [x] Resumen textual y `model_version` visibles.
- [x] `GET /history` en DevTools (200) con `items`, `total`, `limit`, `offset`.

---

### MT-P06-HIST-RBAC-001 — Analyst sin historial en nav


| Campo          | Valor          |
| -------------- | -------------- |
| **Prioridad**  | P0             |
| **Requisitos** | UC-003, RF-012 |


**Pasos**

1. Login `analyst@medscope.ai`.
2. Revisar sidebar y navegar manualmente a `/history`.

**Criterios de aceptación**

- [x] **History** no aparece en sidebar.
- [x] Ruta no accesible según RBAC actual (`/unauthorized` o equivalente).

---

## P1 — Importantes

### MT-P06-HIST-003 — Estado vacío


| Campo          | Valor  |
| -------------- | ------ |
| **Prioridad**  | P1     |
| **Requisitos** | UC-050 |


**Pasos**

1. BD sin predicciones (entorno limpio) o usuario sin evaluaciones previas.
2. Abrir `/history` como nurse.

**Criterios de aceptación**

- [x] Mensaje *No evaluations found yet* (sin crash).
- [x] Sin spinner infinito.

---

### MT-P06-HIST-004 — Paginación


| Campo          | Valor |
| -------------- | ----- |
| **Prioridad**  | P1    |
| **Requisitos** | T-601 |


**Pasos**

1. Generar >20 predicciones (o reducir `HISTORY_PAGE_SIZE` en dev si aplica).
2. Abrir `/history` y usar **Next** / **Previous**.

**Criterios de aceptación**

- [x] Contador *Showing X–Y of Z* actualiza.
- [x] `GET /history?offset=…` en red al cambiar página.

---

### MT-P06-HIST-006 — Detalle histórico (T-603)


| Campo          | Valor                 |
| -------------- | --------------------- |
| **Prioridad**  | P0                    |
| **Requisitos** | RF-052, UC-052, T-603 |


**Pasos**

1. Abrir `/history` y pulsar **View** (o la fecha) de una evaluación existente.
2. Verificar gauge de riesgo, resumen XAI y tabla SHAP.
3. Revisar tarjeta **Clinical inputs** con los valores guardados.
4. Si hay simulaciones previas, comprobar panel **Linked simulations**.
5. Como clinician/admin, pulsar **Run simulation** y confirmar que abre `/simulation` con el contexto cargado.

**Criterios de aceptación**

- [x] `GET /history/{prediction_id}` devuelve inputs, SHAP y simulaciones.
- [x] La ruta `/history/:predictionId` muestra el detalle completo.
- [x] Enlace **Back to history** vuelve al listado.
- [x] Rol nurse ve detalle pero no el botón de simulación.

---

### MT-P06-HIST-005 — Filtros de búsqueda (T-602)


| Campo          | Valor                 |
| -------------- | --------------------- |
| **Prioridad**  | P0                    |
| **Requisitos** | RF-051, UC-051, T-602 |


**Pasos**

1. Abrir `/history` con varias evaluaciones de distintos evaluadores y niveles de riesgo.
2. Cambiar **Risk level** a `High risk`.
3. Ajustar rango de fechas (p. ej. Last 30 days o Custom).
4. Seleccionar un evaluador en **Evaluator**.
5. Pulsar **Reset**.

**Criterios de aceptación**

- [x] La tabla se actualiza al cambiar filtros (`GET /history?risk_level=…&date_from=…&user_id=…`).
- [x] El contador *Showing X–Y of Z* refleja el total filtrado.
- [x] Mensaje distinto cuando no hay resultados con filtros activos.
- [x] **Reset** restaura fecha, riesgo y evaluador por defecto.

---

## Relación con tests automáticos


| Manual               | Automatizado (`frontend/src` / `backend/tests`)                           |
| -------------------- | ------------------------------------------------------------------------- |
| MT-P06-HIST-001/002  | `HistoryPage.test.tsx`, `history.test.ts`, `HistoryFiltersPanel.test.tsx` |
| MT-P06-HIST-002      | `HistoryEvaluationsTable.test.tsx`, `test_history.py`                     |
| MT-P06-HIST-006      | `HistoryDetailPage.test.tsx`, `historyDetail.test.ts`, `test_history.py`  |
| MT-P06-HIST-RBAC-001 | `navigation.test.ts`, `AppLayout.test.tsx`, `RoleRoute.test.tsx`          |


---

## Registro de sesiones


| Fecha      | Ejecutado por | Commit / rama | P0  | P1  | Comentarios    |
| ---------- | ------------- | ------------- | --- | --- | -------------- |
| 11/06/2026 | GC            |               | 4/4 | 0/2 | US-022 cerrada |


