# Fase 2 — Tests manuales: Pipeline ML

**Alcance:** dataset Diabetes 130-US, EDA, preprocessing, entrenamiento, evaluación, serialización, SHAP offline (sin API).

**Referencia:** [Task Tracker — Fase 2](../../TaskTracker.md#fase-2--machine-learning) · [ML-Pipeline.md](../../ML/ML-Pipeline.md) · [Execution Plan — Phase 2](../../Execution%20Plan/ExecutionPlan.md#phase-2--machine-learning-pipeline)

**Nota:** La integración `POST /predict` se valida en [Phase-03-ML-Backend-Integration.md](Phase-03-ML-Backend-Integration.md).

---

## Resumen de progreso


| Prioridad | Total  | Ejecutados | Pendientes |
| --------- | ------ | ---------- | ---------- |
| P0        | 12     | 0          | 12         |
| P1        | 5      | 0          | 5          |
| P2        | 2      | 0          | 2          |
| **Total** | **19** | **0**      | **19**     |



| Área                          | Tests | IDs                      |
| ----------------------------- | ----- | ------------------------ |
| INF — Entorno Python / venv   | 2     | MT-P02-INF-001 … 002     |
| DATA — Dataset                | 3     | MT-P02-DATA-001 … 003    |
| EDA — Exploración             | 2     | MT-P02-EDA-001 … 002     |
| TRAIN — Entrenamiento         | 3     | MT-P02-TRAIN-001 … 003   |
| METRICS — Evaluación          | 2     | MT-P02-METRICS-001 … 002 |
| ART — Artefactos producción   | 4     | MT-P02-ART-001 … 004     |
| SHAP — Explicabilidad offline | 3     | MT-P02-SHAP-001 … 003    |


---

## Antes de empezar

### Requisitos


| Herramienta                       | Para qué                           |
| --------------------------------- | ---------------------------------- |
| Python 3.11+ con `.venv`          | Scripts ML y pytest                |
| `pip install -r requirements.txt` | Dependencias backend + ML + pytest |


### Comandos de referencia

```powershell
cd C:\Pojects\medscope-ai
.\.venv\Scripts\Activate.ps1
python ml/scripts/download_dataset.py
python ml/scripts/serialize_model.py
pytest ml/tests -v
```

---

## P0 — Bloqueantes (cerrar Fase 2)

### MT-P02-INF-001 — Entorno Python listo


| Campo          | Valor   |
| -------------- | ------- |
| **Prioridad**  | P0      |
| **Requisitos** | RIA-010 |


**Pasos**

1. Activar `.venv` desde la raíz del repo.
2. Ejecutar `python --version` (≥ 3.11).
3. Ejecutar `pip show scikit-learn shap pandas joblib` — todos instalados.

**Criterios de aceptación**

- [ ] Sin errores de import al ejecutar `python -c "import sklearn, shap, pandas"`.

---

### MT-P02-DATA-001 — Descarga del dataset


| Campo          | Valor          |
| -------------- | -------------- |
| **Prioridad**  | P0             |
| **Requisitos** | RIA-001, T-201 |


**Pasos**

1. `python ml/scripts/download_dataset.py`
2. Verificar que existe `datasets/diabetes130/raw/data.csv`.
3. Abrir `datasets/manifest.json` y comprobar SHA-256 y recuento de filas.

**Criterios de aceptación**

- [x] CSV presente (~101k filas).
- [x] `manifest.json` actualizado.

---

### MT-P02-TRAIN-001 — Entrenamiento Logistic Regression


| Campo          | Valor          |
| -------------- | -------------- |
| **Prioridad**  | P0             |
| **Requisitos** | RIA-011, T-205 |


**Pasos**

1. `python ml/scripts/train_logistic_regression.py` (o script equivalente del repo).
2. Verificar `models/logistic_regression/model.pkl` y `metrics.json`.

**Criterios de aceptación**

- [x] Artefactos generados sin excepción.
- [x] Métricas presentes (accuracy, recall, ROC-AUC).

---

### MT-P02-METRICS-001 — Reporte de evaluación


| Campo          | Valor          |
| -------------- | -------------- |
| **Prioridad**  | P0             |
| **Requisitos** | RIA-012, T-207 |


**Pasos**

1. Revisar `models/evaluation_report.json`.
2. Confirmar que **recall LR > recall RF** en umbral 0.5.
3. Documentar que accuracy KPI > 75 % **no se alcanza** (decisión documentada en ML-Pipeline §6).

**Criterios de aceptación**

- [ ] Reporte JSON coherente con [ML-Pipeline.md](../../ML/ML-Pipeline.md).
- [ ] Justificación de priorizar recall entendible para defensa TFM.

---

### MT-P02-ART-001 — Serialización producción


| Campo          | Valor          |
| -------------- | -------------- |
| **Prioridad**  | P0             |
| **Requisitos** | RIA-020, T-209 |


**Pasos**

1. `python ml/scripts/select_final_model.py` (si no existe `models/final/`).
2. `python ml/scripts/serialize_model.py`
3. Comprobar archivos en `models/`:


| Archivo               | Esperado                                                     |
| --------------------- | ------------------------------------------------------------ |
| `model.pkl`           | Clasificador LR                                              |
| `preprocessor.pkl`    | Pipeline ajustado                                            |
| `model_manifest.json` | `model_id`, `production_threshold`, `shap_explainer: linear` |
| `shap_background.npy` | Matriz background SHAP (inferencia sin dataset)              |


**Criterios de aceptación**

- [x] Los cuatro artefactos existen.
- [x] `model_manifest.json` lista 19 `feature_columns`.

---

### MT-P02-SHAP-001 — Demo SHAP offline


| Campo          | Valor                   |
| -------------- | ----------------------- |
| **Prioridad**  | P0                      |
| **Requisitos** | RIA-030, RIA-031, T-210 |


**Pasos**

1. `python ml/scripts/compute_shap_demo.py`
2. Revisar salida: `risk_score` ∈ [0, 1], `risk_level` ∈ {low, medium, high}.
3. Comprobar top features con dirección `increases_risk` / `decreases_risk`.

**Criterios de aceptación**

- [x] SHAP no nulo.
- [x] Resumen clínico textual presente (RF-032).

---

### MT-P02-INF-002 — Suite pytest ML (RTS-010)


| Campo          | Valor          |
| -------------- | -------------- |
| **Prioridad**  | P0             |
| **Requisitos** | RTS-010, T-211 |


**Pasos**

```powershell
pytest ml/tests -v
```

**Criterios de aceptación**

- [x] Todos los tests pasan (1 xfail esperado en accuracy KPI si aplica).
- [x] `test_model_load`, `test_inference`, `test_shap_output` en verde.

---

## P1 — Importantes (regresión)

### MT-P02-EDA-001 — Notebook EDA


| Campo          | Valor          |
| -------------- | -------------- |
| **Prioridad**  | P1             |
| **Requisitos** | T-202, RAC-001 |


**Pasos**

1. Abrir `notebooks/diabetes130_eda.ipynb` en Jupyter.
2. Ejecutar todas las celdas.
3. Comparar con gráficos en `docs/figures/eda/`.

**Criterios de aceptación**

- [x] Notebook ejecuta sin error.
- [x] Hallazgos clave (weight missing, desbalance) visibles.

---

### MT-P02-TRAIN-002 — Random Forest baseline


| Campo          | Valor |
| -------------- | ----- |
| **Prioridad**  | P1    |
| **Requisitos** | T-206 |


**Pasos**

1. Confirmar `models/random_forest/` y `models/baseline_comparison.json`.
2. Verificar que RF no fue promovido a producción.

**Criterios de aceptación**

- [x] Comparación LR vs RF documentada.

---

### MT-P02-TRAIN-003 — XGBoost opcional


| Campo          | Valor |
| -------------- | ----- |
| **Prioridad**  | P1    |
| **Requisitos** | T-213 |


**Pasos**

1. Revisar `models/xgboost_evaluation.json`.
2. Confirmar que LR sigue en `models/final_model_selection.json`.

**Criterios de aceptación**

- [x] XGBoost evaluado pero no en producción.

---

## P2 — Complementarios

### MT-P02-ART-002 — Gráficos EDA exportados


| Campo          | Valor |
| -------------- | ----- |
| **Prioridad**  | P2    |
| **Requisitos** | T-214 |


**Pasos**

1. `python ml/scripts/export_eda_figures.py`
2. Revisar `docs/figures/eda/manifest.json` y PNGs.

**Criterios de aceptación**

- [x] 8 figuras + manifest presentes.

---

## Registro de sesiones


| Fecha | Ejecutado por | Commit / rama | P0  | P1  | P2  | Comentarios |
| ----- | ------------- | ------------- | --- | --- | --- | ----------- |
|       |               |               |     |     |     |             |


