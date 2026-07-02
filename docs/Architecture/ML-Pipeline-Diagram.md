# Diagrama del pipeline ML — train → serialize → infer

Artefacto visual para defensa TFM (**RAC-001**, **T-804**).

**Narrativa completa:** [ML-Pipeline.md](../ML/ML-Pipeline.md) · **Arquitectura sistema:** [System-Architecture.md](System-Architecture.md) · **Secuencia inferencia:** [Sequence-Diagrams.md §2](Sequence-Diagrams.md#2-clinical-prediction--shap-uc-020--uc-030)

---

## 1. Vista end-to-end

El pipeline se divide en **dos fases estrictas**: entrenamiento offline (nunca en petición HTTP) e inferencia en runtime (backend FastAPI).

```mermaid
flowchart TB
  subgraph phase_offline [OFFLINE — ml/ + notebooks/]
    direction TB
    A1[(UCI Diabetes 130-US)]
    A2[download_dataset.py]
    A3[diabetes130_eda.ipynb]
    A4[preprocessing: limpieza + 19 features]
    A5[Split 80/20 estratificado]
    A6[train_logistic_regression.py]
    A7[train_random_forest.py]
    A8[evaluate_models.py]
    A9[select_final_model.py]
    A10[serialize_model.py]
    A11[compute_shap_demo.py]

    A1 --> A2 --> A3 --> A4 --> A5
    A5 --> A6 & A7
    A6 & A7 --> A8 --> A9 --> A10
    A10 --> A11
  end

  subgraph phase_artifacts [ARTEFACTOS — models/]
    direction TB
    B1[model.pkl]
    B2[preprocessor.pkl]
    B3[model_manifest.json]
    B4[shap_background.npy]
    B5[evaluation_report.json]
    B6[final_model_selection.json]
  end

  subgraph phase_runtime [RUNTIME — backend/]
    direction TB
    C1[Docker build / deploy Render]
    C2[lifespan: ml_registry.load]
    C3[ShapExplainerService]
    C4[POST /predict]
    C5[POST /simulate]
    C6[POST /demo/predict · /demo/simulate]
    C7[(PostgreSQL — solo rutas autenticadas)]

    C1 --> C2 --> C3
    C3 --> C4 & C5 & C6
    C4 & C5 --> C7
  end

  A10 --> B1 & B2 & B3 & B4
  A8 --> B5
  A9 --> B6
  B1 & B2 & B3 & B4 --> C1
```

---

## 2. Fase offline — entrenamiento y selección

```mermaid
flowchart LR
  subgraph data [Datos]
    RAW[CSV raw<br/>datasets/]
    CLEAN[DataFrame limpio<br/>readmit_30d]
  end

  subgraph features [Features]
    PP[Diabetes130Preprocessor<br/>impute + scale + OHE]
    X[X_train · X_test]
    Y[y_train · y_test]
  end

  subgraph models [Modelos candidatos]
    LR[Logistic Regression<br/>class_weight=balanced]
    RF[Random Forest<br/>200 trees]
    XGB[XGBoost<br/>opcional T-213]
  end

  subgraph decision [Decisión T-208]
    MET[Recall · F1 · ROC-AUC<br/>evaluation_report.json]
    WIN[Producción: LR v1.0.0<br/>final_model_selection.json]
  end

  RAW --> CLEAN --> PP --> X & Y
  X & Y --> LR & RF & XGB
  LR & RF & XGB --> MET --> WIN
```

| Paso | Script | Salida |
|---|---|---|
| Descarga | `ml/scripts/download_dataset.py` | CSV + `datasets/manifest.json` |
| Entrenamiento LR | `ml/scripts/train_logistic_regression.py` | `models/logistic_regression/` |
| Entrenamiento RF | `ml/scripts/train_random_forest.py` | `models/random_forest/` |
| Evaluación | `ml/scripts/evaluate_models.py` | `models/evaluation_report.json` |
| Selección | `ml/scripts/select_final_model.py` | `models/final/`, `final_model_selection.json` |
| Serialización | `ml/scripts/serialize_model.py` | `model.pkl`, `preprocessor.pkl`, `model_manifest.json`, `shap_background.npy` |

**Modelo en producción:** Logistic Regression — mayor **recall** (0,54) frente a RF (0,20) y XGBoost (0,44) en test hold-out.

---

## 3. Fase serialize — artefactos de producción

```mermaid
flowchart TB
  SEL[select_final_model.py<br/>promueve LR a models/final/]
  SER[serialize_model.py]

  subgraph outputs [Copiados a models/ raíz]
    M[model.pkl<br/>joblib classifier]
    P[preprocessor.pkl<br/>sklearn Pipeline ajustado]
    MAN[model_manifest.json<br/>id, version, threshold, features, explainer]
    BG[shap_background.npy<br/>muestra background SHAP]
  end

  DOCKER[Dockerfile COPY models/]
  GIT[Committed o generados en CI]

  SEL --> SER
  SER --> M & P & MAN & BG
  M & P & MAN & BG --> DOCKER
  M & P & MAN & BG -.-> GIT
```

| Artefacto | Uso en runtime |
|---|---|
| `model.pkl` | `predict_proba` → risk_score |
| `preprocessor.pkl` | Paridad train/inference (RIA-010) |
| `model_manifest.json` | Versión expuesta en API, umbral, lista de features |
| `shap_background.npy` | `LinearExplainer` sin dataset en contenedor |

Validación en build Docker:

```dockerfile
RUN test -f /workspace/models/model.pkl && ...
```

---

## 4. Fase infer — runtime backend

```mermaid
sequenceDiagram
  autonumber
  participant Dev as Desarrollador / CI
  participant Art as models/*
  participant Docker as Imagen Render
  participant Reg as ml_registry
  participant API as FastAPI
  participant SVC as PredictionService
  participant SHAP as ShapExplainerService
  participant Client as Cliente React

  Dev->>Art: serialize_model.py (offline)
  Art->>Docker: COPY en build
  Docker->>Reg: load at startup (lifespan)
  Note over Reg: model + preprocessor + SHAP background

  Client->>API: POST /predict (JWT)
  API->>SVC: PredictRequest
  SVC->>Reg: transform + predict_proba
  Reg->>SHAP: explain(features)
  SHAP-->>SVC: shap_explanations + summary
  SVC-->>API: PredictResponse
  API-->>Client: risk %, band, SHAP

  Note over Client,API: /demo/* usa DemoService — mismo Reg, sin PostgreSQL
```

### Reglas de inferencia (RIA-021)

| Regla | Implementación |
|---|---|
| Carga única al arranque | `backend/core/ml_registry.py` + `lifespan` en `main.py` |
| Sin reentrenamiento online | Solo `predict` / `predict_proba` |
| SHAP en producción | `LinearExplainer` + `shap_background.npy` |
| Latencia objetivo | &lt; 1 s (`prediction_time_ms`) |
| Health check | `GET /health` → `ml_ready: true` |

### Endpoints que usan el mismo modelo

| Endpoint | Persistencia | Auth |
|---|---|---|
| `POST /predict` | Sí → PostgreSQL | JWT |
| `POST /simulate` | Sí | JWT |
| `POST /demo/predict` | No | Público |
| `POST /demo/simulate` | No | Público |

---

## 5. Comandos reproducibles (orden)

```bash
# 1. Offline — una vez por versión de modelo
python ml/scripts/download_dataset.py
python ml/scripts/train_logistic_regression.py
python ml/scripts/train_random_forest.py
python ml/scripts/evaluate_models.py
python ml/scripts/select_final_model.py
python ml/scripts/serialize_model.py

# 2. Validación
pytest ml/tests -v
pytest backend/tests/test_demo.py -v   # inferencia efímera

# 3. Deploy — artefactos en imagen Docker → Render
# Ver Deployment.md §5
```

---

## 6. Trazabilidad

| Requisito | Sección |
|---|---|
| RAC-001 pipeline ML | §1–4 |
| RAC-010 metodología y resultados | [ML-Pipeline.md §2–6](../ML/ML-Pipeline.md) |
| RIA-010 paridad preprocess | §3 |
| RIA-020 serialización | §3 |
| RIA-021 inferencia sin retrain | §4 |
| RIA-030 SHAP | §4 |
| UC-082 load model at startup | §4 |
| UC-110–112 ML lifecycle | §2 |
| T-209 serialize | §3 |
| T-301 ml_registry | §4 |

---

*Última actualización: T-804 — julio 2026.*
