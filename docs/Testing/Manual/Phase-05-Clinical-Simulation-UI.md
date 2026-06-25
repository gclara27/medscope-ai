# Fase 5 — Tests manuales: Simulación clínica (UI)

**Alcance:** Pantalla `/simulation`, panel de variables, recálculo automático `POST /simulate`, comparación baseline vs simulado, persistencia de borrador en sesión (T-520–523, US-021).

**Referencia:** [Task Tracker — Simulación](../../TaskTracker.md#simulación) · [simulation mockup](../../Design/screens/simulation/reference.html)

**Prerrequisito:** [Phase 05 — Predicción UI](Phase-05-Clinical-Prediction-UI.md) (evaluación + resultado con predicción persistida).

---

## Resumen de progreso


| Prioridad | Total  | Ejecutados | Pendientes |
| --------- | ------ | ---------- | ---------- |
| P0        | 8      | 8          | 0          |
| P1        | 3      | 3          | 0          |
| **Total** | **10** | **10**     | **0**      |



| Área                          | Tests | IDs                  |
| ----------------------------- | ----- | -------------------- |
| FLOW — Acceso y contexto      | 2     | MT-P05-SIM-001 … 002 |
| PANEL — Variables y recálculo | 3     | MT-P05-SIM-003 … 005 |
| COMP — Comparación y resumen  | 2     | MT-P05-SIM-006 … 007 |
| P1 — Persistencia y RBAC      | 3     | MT-P05-SIM-008 … 010 |


---

## Antes de empezar

Mismo stack que predicción: `.\dev.bat`, login `clinician@medscope.ai` / `MedScope123!`.

Flujo previo obligatorio: **Evaluation → submit → Result → Run simulation**.

---

## P0 — Bloqueantes

### MT-P05-SIM-001 — Acceso desde resultado de predicción


| Campo          | Valor         |
| -------------- | ------------- |
| **Prioridad**  | P0            |
| **Requisitos** | T-523, UC-040 |


**Pasos**

1. Completar una evaluación y abrir `/evaluation/result`.
2. Pulsar **Run simulation**.

**Criterios de aceptación**

- [x] Navega a `/simulation` con variables en baseline.
- [x] Gauges muestran el riesgo original; simulado pendiente de cambios.

---

### MT-P05-SIM-002 — Redirección sin contexto


| Campo          | Valor |
| -------------- | ----- |
| **Prioridad**  | P0    |
| **Requisitos** | T-523 |


**Pasos**

1. En ventana privada, login y abrir directamente [http://localhost:5173/simulation](http://localhost:5173/simulation) (sin evaluación previa).

**Criterios de aceptación**

- [x] Muestra empty state clínico (sin gauges) con enlace **Go to evaluation** hacia `/evaluation`.

---

### MT-P05-SIM-003 — Panel de sliders operativo


| Campo          | Valor         |
| -------------- | ------------- |
| **Prioridad**  | P0            |
| **Requisitos** | T-520, RF-040 |


**Pasos**

1. En simulación, mover age, glucose y blood pressure.

**Criterios de aceptación**

- [x] Campos modificados muestran recuadro azul (sin salto de layout).
- [x] Valores numéricos actualizan en tiempo real.

---

### MT-P05-SIM-004 — Recálculo automático vía API


| Campo          | Valor                 |
| -------------- | --------------------- |
| **Prioridad**  | P0                    |
| **Requisitos** | T-521, RF-041, UC-042 |


**Pasos**

1. Cambiar al menos una variable.
2. Esperar ~0,5 s sin tocar más controles.

**Criterios de aceptación**

- [x] Spinner breve en gauge simulado.
- [x] `POST /simulate` en red (DevTools) con `prediction_id` y `modifications`.
- [x] Sin error en UI.

---

### MT-P05-SIM-005 — Reset to baseline


| Campo          | Valor  |
| -------------- | ------ |
| **Prioridad**  | P0     |
| **Requisitos** | RF-040 |


**Pasos**

1. Tras modificar variables, pulsar **Reset to baseline**.

**Criterios de aceptación**

- [x] Sliders vuelven al baseline; desaparece highlight azul.
- [x] Comparación simulada vuelve a estado inicial.

---

### MT-P05-SIM-006 — Comparación lado a lado


| Campo          | Valor                 |
| -------------- | --------------------- |
| **Prioridad**  | P0                    |
| **Requisitos** | T-522, RF-042, UC-043 |


**Pasos**

1. Tras recálculo, revisar panel derecho.

**Criterios de aceptación**

- [x] Barra resumen: Original / Simulated / Difference.
- [x] Dos gauges: baseline y simulado con badge de delta (pts + nivel).

---

### MT-P05-SIM-007 — Resumen de simulación


| Campo          | Valor  |
| -------------- | ------ |
| **Prioridad**  | P0     |
| **Requisitos** | UC-043 |


**Pasos**

1. Tras recálculo con varios cambios, leer **Simulation summary**.

**Criterios de aceptación**

- [x] Texto narrativo del backend visible.
- [x] Lista de cambios `original → simulado` por variable.

---

## P1 — Importantes

### MT-P05-SIM-008 — Persistencia tras refresh (F5)


| Campo          | Valor |
| -------------- | ----- |
| **Prioridad**  | P1    |
| **Requisitos** | T-523 |


**Pasos**

1. Modificar variables y esperar recálculo.
2. Pulsar F5 en `/simulation`.

**Criterios de aceptación**

- [x] Sliders y resultado simulado se mantienen (`sessionStorage`: `draftValues`, `lastSimResult`).
- [x] No vuelve a baseline salvo **Run simulation** desde resultado o nueva evaluación (`markSimulationForceReset` — el F5 no debe consumir el flag de reset).

---

### MT-P05-SIM-009 — Sidebar Simulation con sesión


| Campo          | Valor |
| -------------- | ----- |
| **Prioridad**  | P1    |
| **Requisitos** | T-523 |


**Pasos**

1. Tras simular, ir a Dashboard y pulsar **Simulation** en sidebar.

**Criterios de aceptación**

- [x] Carga última predicción y borrador si existía.

---

### MT-P05-SIM-010 — RBAC nurse sin simulación


| Campo          | Valor          |
| -------------- | -------------- |
| **Prioridad**  | P1             |
| **Requisitos** | UC-003, RF-004 |


**Pasos**

1. Login `nurse@medscope.ai`.
2. Revisar sidebar y URL `/simulation`.

**Criterios de aceptación**

- [x] Simulation no aparece en navegación (o ruta no accesible).

---

## Fuera de alcance US-021

- **T-524 / RF-043:** gráfico de impacto visual (waterfall) — pendiente US-033.
- **E2E Playwright** completo — Fase 7 (T-708).

---

## Registro de sesiones

| Fecha      | Ejecutado por | Commit / rama | P0  | P1  | Comentarios |
| ---------- | ------------- | ------------- | --- | --- | ----------- |
| 25/06/2026 | GC            |               | 8/8 | 3/3 | Fix F5 persistencia + spinner simulado |

