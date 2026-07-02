# Datasets — MedScope AI

Clinical datasets for offline ML training. Raw files are **not committed** (see repo `.gitignore`); this folder holds documentation and a machine-readable manifest.

## Diabetes 130-US hospitals (T-201, RIA-001)

| Field | Value |
|---|---|
| **ID** | `diabetes130-us-hospitals` |
| **Source** | [UCI ML Repository — Diabetes 130-US hospitals](https://archive.ics.uci.edu/dataset/296/diabetes+130-us+hospitals+for+years+1999-2008) |
| **Task** | Predict hospital readmission risk |
| **Target column** | `readmitted` (`<30`, `>30`, `NO`) |
| **Rows** | 101,766 encounters |
| **Columns** | 50 |
| **License** | CC BY 4.0 (UCI) |

### Citation

Strack, B., DeShazo, J., Gennings, C., Olmo, J.L., Ventura, S., Cios, K.J., & Clore, J.N. (2014). *Impact of HbA1c measurement on hospital readmission rates: Analysis of 70,000 clinical database patient records.* BioMed Research International, 2014.

### Download

From the repository root (requires Python 3.12+ and `ml/requirements.txt` or repo `requirements.txt`):

```bash
python ml/scripts/download_dataset.py
```

Output path:

```text
datasets/diabetes130/raw/data.csv
```

Force re-download:

```bash
python ml/scripts/download_dataset.py --force
```

Metadata and checksum: [`manifest.json`](manifest.json).

### Target distribution (raw)

| `readmitted` | Count | MVP interpretation |
|---|---|---|
| `NO` | 54,864 | Not readmitted |
| `>30` | 35,545 | Readmitted after 30 days |
| `<30` | 11,357 | **Positive class** — readmitted within 30 days |

Recommended binary label for MVP: `readmitted == '<30'`.

### Mapping to `patient_inputs` (Database.md §4.4)

| DB field (`patient_inputs`) | Dataset column | Notes |
|---|---|---|
| `age` | `age` | Ordinal bins (`[40-50)`, …); parse in preprocessing (T-203) |
| `gender` | `gender` | Male / Female / Unknown |
| `glucose` | `max_glu_serum` | `None`, `Norm`, `>200`, `>300` |
| `blood_pressure` | — | Not in dataset; UI/simulation field only for MVP |
| `medications_count` | `num_medications` | Integer |
| `previous_admissions` | `number_inpatient` | Prior inpatient visits proxy |
| `hospital_stay_days` | `time_in_hospital` | Length of stay (days) |
| `bmi` | — | `weight` is mostly `?`; omit or impute in later iterations |

Additional rich features for modeling (T-204): `num_lab_procedures`, `num_procedures`, `number_diagnoses`, `A1Cresult`, diabetes medications, diagnoses `diag_1`–`diag_3`, etc.

### Feature engineering (T-204, EP-2.5)

Implemented in `ml/preprocessing/features.py` and integrated in `prepare_model_dataframe()`.

**MVP modeling features (19 total):**

| Group | Features |
|---|---|
| Core (EP-2.5) | `age_midpoint`, `time_in_hospital`, `num_medications`, `number_inpatient`, `max_glu_serum` |
| Clinical numerics | `number_outpatient`, `number_emergency`, `num_lab_procedures`, `num_procedures`, `number_diagnoses` |
| Derived (T-204) | `total_prior_visits`, `active_diabetes_meds_count`, `has_insulin`, `meds_per_day` |
| Categorical | `gender`, `race`, `A1Cresult`, `change`, `diabetesMed` |

**Derived feature definitions:**

- `total_prior_visits` — sum of `number_inpatient`, `number_outpatient`, `number_emergency`
- `active_diabetes_meds_count` — count of diabetes drug columns with value other than `No`
- `has_insulin` — `1` if `insulin` is active (`Steady` / `Up` / `Down`), else `0`
- `meds_per_day` — `num_medications / time_in_hospital` (minimum 1 day)

**Explicitly excluded from MVP** (see `EXCLUDED_FROM_MVP` in `ml/preprocessing/constants.py`):

- `weight` (~97% missing)
- Raw ICD codes `diag_1`–`diag_3` (use `number_diagnoses` instead)
- Individual diabetes drug columns (collapsed into derived features)
- Administrative IDs (`admission_type_id`, `payer_code`, `medical_specialty`, …)

Tests: `ml/tests/test_features.py`

### Preprocessing (T-203, RIA-010)

Implemented in `ml/preprocessing/`:

- `cleaning.py` — load CSV, replace placeholders (`?`, `None`, …), deduplicate by `patient_nbr`, `age_midpoint`, binary target `readmit_30d`
- `pipeline.py` — `Diabetes130Preprocessor` (median impute + `StandardScaler` for numeric; most-frequent + `OneHotEncoder` for categorical; `handle_unknown="ignore"`)
- `features.py` — derived MVP features (T-204)
- `train_test_split_data()` — stratified 80/20 split (`random_state=42`)

Tests: `ml/tests/test_preprocessing.py`, `ml/tests/test_features.py`, `ml/tests/test_train_logistic_regression.py`

### Training (T-205, RIA-011)

```bash
python ml/scripts/train_logistic_regression.py
```

Artifacts (gitignored): `models/logistic_regression/model.pkl`, `preprocessor.pkl`, `metrics.json`

- Stratified 80/20 split (`random_state=42`)
- `LogisticRegression(class_weight="balanced")` — prioriza recall en clase minoritaria
- Preprocessor ajustado solo en train; evaluación en test hold-out

### Random Forest + comparación (T-206, EP-2.6)

```bash
python ml/scripts/train_random_forest.py
```

Artifacts: `models/random_forest/` + `models/baseline_comparison.json`

- `RandomForestClassifier(class_weight="balanced", n_estimators=200)`
- Compara con Logistic Regression priorizando **recall** (desempate: F1 → ROC-AUC → accuracy)

### XGBoost opcional (T-213, EP-2.6)

```bash
python ml/scripts/train_xgboost.py
```

Artifacts: `models/xgboost/` + `models/xgboost_evaluation.json`

- `XGBClassifier` con `scale_pos_weight` del split de entrenamiento
- Comparativa LR / RF / XGBoost; **no reemplaza** el modelo de producción si LR sigue líder en recall

Tests: `ml/tests/test_train_xgboost.py`

### Evaluación de métricas (T-207, RIA-012, UC-111)

```bash
python ml/scripts/evaluate_models.py
```

Report: `models/evaluation_report.json`

- Métricas en test hold-out: accuracy, recall, precision, F1, ROC-AUC
- Matriz de confusión por modelo
- Evaluación a umbral 0.5 y umbral optimizado para **recall**
- Objetivo documentado: accuracy > 75% (Requirements §15)
- Recomendación de modelo baseline para T-208

### Gráficos EDA defensa (T-214, RAC-001)

```bash
python ml/scripts/export_eda_figures.py
```

Outputs: `docs/figures/eda/*.png` + `manifest.json` (memoria y defensa TFM)

### Modelo final (T-208, EP-2.8)

```bash
python ml/scripts/select_final_model.py
```

Outputs:
- `models/final_model_selection.json` — decisión documentada
- `models/final/model.pkl` + `preprocessor.pkl` — artefactos promovidos

**Decisión MVP:** `logistic_regression` @ threshold `0.5`

- Mejor **recall** en producción (0.54 vs 0.20 de Random Forest)
- Random Forest descartado: mayor accuracy pero pierde demasiados casos positivos
- SHAP: `LinearExplainer` (T-210) en lugar de `TreeExplainer`
- Umbrales recall-optimizados descartados por colapsar accuracy

### Serialización producción (T-209, RIA-020)

```bash
python ml/scripts/serialize_model.py
```

Outputs en `models/` (gitignored):

| Archivo | Uso |
|---|---|
| `model.pkl` | Clasificador final para inferencia backend |
| `preprocessor.pkl` | Pipeline de preprocessing ajustado |
| `model_manifest.json` | `model_id`, versión, threshold, features, SHAP explainer, checksums SHA-256 |
| `demo_golden_predictions.json` | Scores fijos T-902 para escenarios demo (defensa) |

Requisito previo: `python ml/scripts/select_final_model.py`

### SHAP explainability (T-210, RIA-030, UC-030)

Documentación académica: [`docs/ML/ML-Pipeline.md`](../docs/ML/ML-Pipeline.md) (T-212, RAC-010).

```bash
python ml/scripts/compute_shap_demo.py
```

Module: `ml/explainability/`

- **LinearExplainer** for production `logistic_regression` (`model_manifest.json`)
- **TreeExplainer** supported when `shap_explainer` is `tree` (Random Forest)
- Returns ranked feature contributions + neutral clinical summary (RF-032)
- Ready for backend integration in T-302 / `POST /predict`

### Preprocessing notes (later tasks)

1. **Deduplicate encounters** per Strack et al. (keep first encounter per patient or apply published filter).
2. **Handle missing / placeholder values** (`?` in `weight`, `None` in lab fields).
3. **Encode categoricals** consistently for train and inference (RIA-010).
4. **Train/test split** with stratification on binary readmission (RIA-011).

### Privacy

- Public, de-identified research data (RNF-034).
- Do not commit raw CSV to Git; only `manifest.json` and this README are tracked.

---

## Folder layout

```text
datasets/
├── README.md              # This file
├── manifest.json          # Source URL, schema, checksum
└── diabetes130/
    └── raw/
        └── data.csv       # Downloaded via ml/scripts/download_dataset.py (gitignored)
```
