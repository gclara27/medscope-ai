

# Fase 3 — Tests manuales: Integración ML + Backend (parcial)

**Alcance actual:** `POST /predict`, carga ML al arranque, persistencia en PostgreSQL. **Pendiente:** `/simulate`, `/history`, `/analytics`.

**Referencia:** [Task Tracker — Fase 3](../../TaskTracker.md#fase-3--integración-ml--backend) · [ML-Pipeline §8.2](../../ML/ML-Pipeline.md#82-diagrama-de-inferencia-integración-backend)

---

## Resumen de progreso


| Prioridad | Total  | Ejecutados | Pendientes |
| --------- | ------ | ---------- | ---------- |
| P0        | 8      | 0          | 8          |
| P1        | 3      | 0          | 3          |
| **Total** | **11** | **0**      | **11**     |


---

## Antes de empezar

### Arranque recomendado (desarrollo local)

```powershell
.\dev.bat
```

`dev.bat` levanta PostgreSQL, aplica migraciones, **detiene el backend Docker** (libera puerto 8000) y abre uvicorn local con dependencias ML completas.

### Verificación previa


| Check      | URL / comando                                                | Esperado           |
| ---------- | ------------------------------------------------------------ | ------------------ |
| Health     | [http://localhost:8000/health](http://localhost:8000/health) | `"ml_ready": true` |
| Swagger    | [http://localhost:8000/docs](http://localhost:8000/docs)     | UI carga           |
| Artefactos | `models/shap_background.npy` existe                          | Sí                 |


Si `ml_ready: false`, revisar `ml_error` en `/health` y ejecutar:

```powershell
.\.venv\Scripts\python.exe ml\scripts\serialize_model.py
```

### Credenciales


| Email                   | Rol       | Password       |
| ----------------------- | --------- | -------------- |
| `clinician@medscope.ai` | clinician | `MedScope123!` |
| `nurse@medscope.ai`     | nurse     | `MedScope123!` |
| `analyst@medscope.ai`   | analyst   | `MedScope123!` |


---

## P0 — Bloqueantes (predict API)

### MT-P03-INF-001 — Health con ML listo


| Campo          | Valor         |
| -------------- | ------------- |
| **Prioridad**  | P0            |
| **Requisitos** | UC-082, T-301 |


**Pasos**

1. GET [http://localhost:8000/health](http://localhost:8000/health)

**Criterios de aceptación**

- [x] `status: ok`
- [x] `ml_ready: true`
- [x] Sin campo `ml_error`

---

### MT-P03-PRED-001 — Login + Authorize en Swagger


| Campo          | Valor          |
| -------------- | -------------- |
| **Prioridad**  | P0             |
| **Requisitos** | UC-080, RF-003 |


**Pasos**

1. `POST /auth/login` con `clinician@medscope.ai` / `MedScope123!`
2. Copiar `access_token`.
3. **Authorize** en Swagger → pegar token.

**Criterios de aceptación**

- [x] Login 200 con JWT.
- [x] Candado de Swagger activo.

---

### MT-P03-PRED-002 — Predict bajo riesgo


| Campo          | Valor                   |
| -------------- | ----------------------- |
| **Prioridad**  | P0                      |
| **Requisitos** | UC-022, RIA-021, RF-023 |


**Payload de ejemplo (bajo riesgo):**

```json
{
  "age": 25,
  "gender": "Male",
  "hospital_stay_days": 1,
  "medications_count": 0,
  "previous_admissions": 0,
  "glucose": 95,
  "glucose_level": "Norm",
  "blood_pressure": 118,
  "bmi": 22.5,
  "number_outpatient": 0,
  "number_emergency": 0,
  "num_lab_procedures": 5,
  "num_procedures": 0,
  "number_diagnoses": 1,
  "active_diabetes_meds_count": 0,
  "has_insulin": false,
  "race": "Caucasian",
  "a1c_result": "None",
  "medication_change": "No",
  "diabetes_medication": "No"
}
```

**Criterios de aceptación**

- [x] HTTP 200.
- [x] `risk_level: "low"`.
- [x] `risk_score` entre 0 y 1.
- [x] `prediction_time_ms` < 1000 (RNF-001).
- [x] `shap_explanations` con ≥ 1 elemento.

---

### MT-P03-PRED-003 — SHAP y resumen clínico


| Campo          | Valor                  |
| -------------- | ---------------------- |
| **Prioridad**  | P0                     |
| **Requisitos** | UC-030, RF-030, RF-032 |


**Criterios de aceptación**

- [x] Cada SHAP item tiene `feature_name`, `shap_value`, `importance_rank`, `direction`.
- [x] Campo `summary` no vacío.
- [x] `model_version` presente.

---

### MT-P03-PRED-004 — Validación 422


| Campo          | Valor                   |
| -------------- | ----------------------- |
| **Prioridad**  | P0                      |
| **Requisitos** | UC-090, RF-021, RTS-002 |


**Pasos**

1. Enviar payload con `"age": -1` o sin `glucose` / `glucose_level`.

**Criterios de aceptación**

- [x] HTTP 422 con detalle de validación Pydantic.

---

### MT-P03-PRED-005 — RBAC predict


| Campo          | Valor  |
| -------------- | ------ |
| **Prioridad**  | P0     |
| **Requisitos** | UC-003 |


**Pasos**

1. Login como `analyst@medscope.ai`.
2. `POST /predict` con token de analyst.

**Criterios de aceptación**

- [x] HTTP 403 (analyst no puede predecir).
- [x] Clinician y nurse sí pueden (200).

---

### MT-P03-DB-001 — Persistencia en PostgreSQL


| Campo          | Valor         |
| -------------- | ------------- |
| **Prioridad**  | P0            |
| **Requisitos** | UC-023, T-308 |


**Pasos**

1. Tras un predict exitoso, anotar `id` de la respuesta.
2. En psql o DBeaver:

```sql
SELECT p.id, p.risk_level, pi.age
FROM predictions p
JOIN patient_inputs pi ON pi.prediction_id = p.id
WHERE p.id = '<uuid>';
```

1. `SELECT COUNT(*) FROM shap_explanations WHERE prediction_id = '<uuid>';`

**Criterios de aceptación**

- [x] Fila en `predictions`, `patient_inputs`, múltiples en `shap_explanations`.

---

### MT-P03-NEG-001 — Sin token → 401


| Campo         | Valor |
| ------------- | ----- |
| **Prioridad** | P0    |


**Criterios de aceptación**

- [x] `POST /predict` sin Authorization → 401.

---

## P1 — Regresión

### MT-P03-PRED-006 — Latencia repetida

Ejecutar 3 predicts seguidos. Media de `prediction_time_ms` < 1000 ms.

### MT-P03-INF-002 — Reinicio backend

Reiniciar ventana backend; `/health` vuelve a `ml_ready: true` sin re-serializar modelo.

### MT-P03-DOCKER-001 — Docker backend (opcional)

Solo si usas `docker compose up backend`:

- [x] `models/`, `ml/`, `datasets/` montados.
- [x] Imagen reconstruida tras cambios en Dockerfile.
- [x] `/health` → `ml_ready: true`.

---

## Registro de sesiones


| Fecha      | Ejecutado por | Commit / rama | P0  | P1  | Comentarios |
| ---------- | ------------- | ------------- | --- | --- | ----------- |
| 21/06/2026 | GC            |               |     |     |             |


