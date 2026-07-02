# MedScope AI — Borrador de memoria TFM

**Tarea:** T-809 · **Requisito:** RAC-010  
**Tipo:** Trabajo Fin de Máster — Ingeniería de software aplicada a CDSS clínico  
**Estado:** Borrador técnico derivado del repositorio; adaptar a la plantilla y normas de la universidad.

---

## Cómo usar este documento

1. Copiar secciones 3–6 en la memoria oficial (Word/LaTeX).
2. Insertar figuras desde [`docs/figures/`](../figures/README.md) y diagramas desde [`docs/Architecture/`](../Architecture/README.md).
3. Ajustar tono, extensión y bibliografía según el director del TFM.
4. Completar portada, marco teórico y estado del arte con fuentes académicas propias (no duplicadas aquí).

**Documentación fuente:** repositorio `medscope-ai` — `docs/` como fuente de verdad.

---

## 1. Resumen

MedScope AI es una plataforma web de **apoyo a la decisión clínica (CDSS)** orientada a predecir el **riesgo de readmisión hospitalaria a 30 días** en pacientes con diabetes. El sistema integra:

- un pipeline de **machine learning offline** entrenado sobre el dataset público UCI *Diabetes 130-US hospitals*;
- **explicaciones SHAP** interpretables para el clínico;
- **simulación clínica what-if** en tiempo real;
- persistencia en **PostgreSQL**, API **FastAPI** y frontend **React**;
- despliegue cloud gratuito (**Supabase + Render + Vercel**) para demostración del MVP.

El modelo seleccionado (regresión logística, umbral 0,5) prioriza **recall** (0,54 en test hold-out) frente a accuracy global (~61 %), alineado con el objetivo clínico de no perder pacientes de alto riesgo. La accuracy no alcanza el KPI documentado del 75 %, pero el TFM demuestra arquitectura enterprise, explicabilidad, simulación y calidad de ingeniería (215+ tests backend, E2E Playwright, cobertura ~95 % del código de aplicación).

---

## 2. Objetivos

### 2.1 Objetivo general

Diseñar e implementar un prototipo funcional de CDSS que transforme datos clínicos tabulares en predicciones de riesgo explicables y simulables, apto para entornos hospitalarios de estudio.

### 2.2 Objetivos específicos

| ID | Objetivo | Evidencia |
|---|---|---|
| O1 | Pipeline ML reproducible offline | [ML-Pipeline.md](../ML/ML-Pipeline.md), `ml/scripts/` |
| O2 | API REST con autenticación JWT y RBAC | `backend/routers/`, [ER-Diagram.md](../Architecture/ER-Diagram.md) |
| O3 | Explicabilidad SHAP en inferencia | `ShapExplainerService`, captura `05_prediction_result_shap.png` |
| O4 | Simulación what-if | `SimulationService`, captura `06_simulation.png` |
| O5 | Persistencia e historial | PostgreSQL, UC-023, UC-050 |
| O6 | UI profesional y despliegue cloud | [Deployment.md](../Deployment/Deployment.md), Vercel + Render |
| O7 | Demo pública sin credenciales | UC-066, `/demo` |

---

## 3. Metodología

### 3.1 Enfoque global

Se combinan dos marcos complementarios:

1. **CRISP-DM** (adaptado) para el ciclo de vida ML: comprensión del negocio → datos → modelado → evaluación → despliegue offline de artefactos.
2. **Desarrollo incremental por fases** ([Execution Plan](../Execution%20Plan/ExecutionPlan.md)): backend y BD → ML → integración API → frontend → features clínicas → analytics/historial → polish/testing → documentación TFM.

Principio rector: **monolito modular** — un repositorio, módulos desacoplados (`frontend/`, `backend/`, `ml/`), sin microservicios.

### 3.2 Stack tecnológico

| Capa | Tecnologías |
|---|---|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, shadcn/ui, Recharts, React Router, Axios |
| Backend | FastAPI, SQLAlchemy, Alembic, Pydantic, JWT (bcrypt) |
| Base de datos | PostgreSQL 16 (dev Docker, prod Supabase) |
| ML | scikit-learn, pandas, numpy, SHAP, joblib |
| Infraestructura | Docker Compose (dev), Render (API+ML), Vercel (SPA) |
| Calidad | pytest, vitest, Playwright, GitHub Actions CI |

### 3.3 Arquitectura del sistema

La arquitectura lógica sigue capas en el backend (routers → services → repositories → models) y carga del modelo ML **una sola vez** al arranque (`ml_registry`).

**Figura sugerida:** [System-Architecture.md](../Architecture/System-Architecture.md) §1–2.

Componentes principales:

- **Cliente SPA** — navegación por roles (admin, clinician, analyst, nurse).
- **API FastAPI** — endpoints `/auth`, `/predict`, `/simulate`, `/history`, `/analytics`, `/demo/*`.
- **Runtime ML** — `model.pkl`, `preprocessor.pkl`, `shap_background.npy` en imagen Docker.
- **PostgreSQL** — predicciones, inputs, SHAP, simulaciones (sin PHI real).

Diagramas complementarios:

| Tema | Documento |
|---|---|
| Pipeline ML train → infer | [ML-Pipeline-Diagram.md](../Architecture/ML-Pipeline-Diagram.md) |
| Modelo entidad-relación | [ER-Diagram.md](../Architecture/ER-Diagram.md) |
| Despliegue Docker / cloud | [Deployment-Diagram.md](../Architecture/Deployment-Diagram.md) |
| Navegación frontend | [Frontend-Navigation.md](../Architecture/Frontend-Navigation.md) |
| Secuencias UC críticos | [Sequence-Diagrams.md](../Architecture/Sequence-Diagrams.md) |

### 3.4 Metodología de machine learning

#### 3.4.1 Dataset y problema

- **Fuente:** UCI ML Repository — *Diabetes 130-US hospitals for years 1999–2008* (101.766 encuentros, CC BY 4.0).
- **Variable objetivo:** `readmit_30d` binaria (readmisión &lt; 30 días vs. no).
- **Desbalance:** ~11,2 % positivos → `class_weight="balanced"`.

#### 3.4.2 Preprocesamiento

Pipeline `Diabetes130Preprocessor`:

- Limpieza de placeholders, deduplicación por paciente, ingeniería de **19 features** clínicas.
- Imputación + escalado numérico + one-hot encoding categórico.
- Split **80/20 estratificado**, `random_state=42`.

#### 3.4.3 Modelos evaluados

| Modelo | Rol |
|---|---|
| Logistic Regression | Baseline interpretable + SHAP `LinearExplainer` |
| Random Forest | Baseline no lineal |
| XGBoost (opcional) | Comparativa T-213 |

#### 3.4.4 Criterio de selección

En CDSS, **recall** tiene prioridad sobre accuracy pura: es preferible alertar de más que omitir readmisiones. El modelo final es **Logistic Regression v1.0.0** con umbral 0,5.

**Figura sugerida:** [ML-Pipeline-Diagram.md](../Architecture/ML-Pipeline-Diagram.md) §1–4.

#### 3.4.5 Explicabilidad

`ShapExplainerService` calcula contribuciones por feature, agrega one-hot a variables clínicas y genera resumen textual neutro (RF-032). En producción se usa `LinearExplainer` con muestra background serializada (`shap_background.npy`).

### 3.5 Metodología de desarrollo y calidad

| Actividad | Enfoque |
|---|---|
| Requisitos | Trazabilidad RF/UC/RNF en `docs/Requirements.md` y `docs/Use Cases/` |
| Implementación | Feature-first; tests tras estabilizar módulo |
| Tests backend | pytest + SQLite en memoria; integración opcional con PostgreSQL Docker |
| Tests frontend | vitest + React Testing Library |
| E2E | Playwright — flujo MVP (RTS-030) |
| CI | GitHub Actions en push/PR a `main` |
| Despliegue | Mismo código dev/prod (RDO-010); secretos en dashboards |

**Cobertura backend:** ~95 % del código de aplicación; umbral mínimo CI 60 % ([Testing.md](../Testing/Testing.md) §11).

---

## 4. Desarrollo e implementación (síntesis)

### 4.1 Fases completadas

| Fase | Entregable principal | Estado |
|---|---|---|
| 0 — Inicialización | Repo, Docker, CI | 100 % |
| 1 — Backend + BD | Auth JWT, roles, Alembic, esquema MVP | 100 % |
| 2 — ML | Pipeline offline, serialización | 100 % |
| 3 — ML + Backend | `/predict`, `/simulate`, ml_registry | 100 % |
| 4 — Frontend base | Login, layout, splash, RBAC UI | 100 % |
| 5 — Features clínicas | Evaluación, SHAP, simulación | 100 % |
| 6 — Analytics + History | Historial, KPIs, export PDF | 100 % |
| 7 — Polish + Testing | E2E, cobertura, UI polish | 100 % |
| Cloud UC-124 | Supabase + Render + Vercel | 100 % |
| 8 — Documentación TFM | Diagramas, capturas, memoria | En curso |

Progreso MVP global: **127/152 tareas (84 %)** — [TaskTracker.md](../TaskTracker.md).

### 4.2 Funcionalidades MVP implementadas

- Autenticación email/contraseña y cuatro roles.
- Dashboard con KPIs y actividad reciente.
- Evaluación clínica y predicción &lt; 1 s (objetivo RNF-001).
- Resultado con gauge de riesgo, bandas low/medium/high y gráfico SHAP.
- Simulación what-if con comparativa original vs. simulado.
- Historial filtrable y detalle con SHAP histórico.
- Analytics poblacional (agregaciones sobre predicciones).
- Demo pública guiada (`/demo`) sin persistencia.
- Centro de soporte y ajustes (appearance; admin: usuarios, auditoría, etc.).

### 4.3 Persistencia

Esquema en 3NF: `users` → `predictions` → (`patient_inputs`, `shap_explanations`, `simulations` → `simulation_inputs`). Sin PHI real; datos de-identificados alineados con el dataset de entrenamiento.

### 4.4 Despliegue

**Producción (TFM):**

| Componente | URL |
|---|---|
| Frontend | https://medscope-ai-delta.vercel.app |
| API | https://medscope-ai-q8tg.onrender.com |
| Health | `GET /health` → `ml_ready: true` |

Guía operativa: [Deployment.md](../Deployment/Deployment.md).

---

## 5. Resultados

### 5.1 Resultados del modelo de machine learning

Métricas en **conjunto de test hold-out** (umbral 0,5):

| Métrica | Logistic Regression | Random Forest | XGBoost |
|---|---|---|---|
| Accuracy | 0,607 | **0,822** | 0,665 |
| **Recall** | **0,542** | 0,201 | 0,439 |
| Precision | 0,119 | 0,142 | 0,119 |
| F1 | 0,195 | 0,166 | 0,188 |
| ROC-AUC | **0,610** | 0,593 | 0,588 |

**Decisión:** Logistic Regression en producción — mayor recall con coste de precision y accuracy.

| KPI (Requirements §15) | Objetivo | Resultado |
|---|---|---|
| Accuracy | &gt; 75 % | **No alcanzado** (~61 %) |
| Recall | Prioridad alta | **0,54** — mejor candidato entre modelos evaluados |
| Tiempo inferencia | &lt; 1 s | **Cumplido** en entorno local y cloud (`prediction_time_ms` en API) |
| Dashboard load | &lt; 2 s | Cumplido en SPA desplegada |

**Figuras EDA (análisis exploratorio):** [`docs/figures/eda/`](../figures/eda/README.md) — distribución objetivo, missing values, correlaciones, etc.

### 5.2 Resultados del sistema software

#### 5.2.1 Interfaz de usuario

Capturas de la aplicación en ejecución (T-808):

| Figura | Archivo | Descripción |
|---|---|---|
| 5.1 | `figures/screenshots/03_dashboard.png` | Dashboard clínico |
| 5.2 | `figures/screenshots/04_evaluation_form.png` | Formulario de evaluación |
| 5.3 | `figures/screenshots/05_prediction_result_shap.png` | Gauge + SHAP |
| 5.4 | `figures/screenshots/06_simulation.png` | Simulación what-if |
| 5.5 | `figures/screenshots/07_history.png` | Historial |
| 5.6 | `figures/screenshots/08_analytics.png` | Analytics |
| 5.7 | `figures/screenshots/01_splash.png` | Landing |
| 5.8 | `figures/screenshots/02_demo_case.png` | Demo pública |

Design system: tokens en [design-system.light.md](../Design/design-system.light.md) — azul médico `#0058bc`, tipografía clínica enterprise.

#### 5.2.2 API y trazabilidad

Endpoints MVP verificados con tests de integración y E2E:

```text
POST /auth/login
POST /predict      → risk + SHAP + persistencia
POST /simulate     → delta + persistencia
GET  /history      → filtros RF-051
GET  /analytics    → agregaciones
POST /demo/predict → sin JWT, sin BD
```

#### 5.2.3 Calidad y pruebas

| Área | Resultado |
|---|---|
| Tests backend | 215+ (pytest) |
| Cobertura aplicación | ~95 % |
| Tests ML | 72+ (`ml/tests/`, RTS-010) |
| E2E Playwright | auth, RBAC, flujo MVP completo (RTS-030) |
| Frontend vitest | login, guards, páginas críticas |

### 5.3 Resultados de despliegue

- Stack cloud **0 €/mes** en free tier (trade-off: cold starts Render, posible pausa Supabase).
- CI/CD automático en push a `main` (Vercel + Render).
- Migraciones Alembic aplicadas en arranque del contenedor.
- Validación smoke en producción documentada (UC-124).

---

## 6. Discusión

### 6.1 Valor del TFM más allá del accuracy

El KPI de accuracy del 75 % no se cumple con el dataset y features del MVP. Sin embargo, el trabajo aporta:

1. **Arquitectura desplegable** lista para integración hospitalaria de estudio.
2. **Explicabilidad accionable** — el clínico ve *por qué* sube o baja el riesgo.
3. **Simulación** — exploración de escenarios sin modificar el registro.
4. **Reproducibilidad** — scripts, manifest SHA-256, tests automatizados.
5. **Transpareencia académica** — limitaciones documentadas con honestidad.

### 6.2 Limitaciones

| Limitación | Impacto |
|---|---|
| Dataset único (EE.UU. 1999–2008, diabetes) | Generalización limitada |
| Precision baja (~12 %) | Alertas ruidosas |
| Modelo lineal | No captura no-linealidades complejas |
| Campos UI vs. dataset | Gaps (p. ej. BMI fiable) |
| Free tier cloud | Latencia en cold start |

### 6.3 Amenazas a la validez

- **Constructo:** proxy de readmisión a 30 días del dataset UCI, no validación externa en hospital real.
- **Interna:** split hold-out único; sin validación cruzada exhaustiva en producción.
- **Externa:** población y época del dataset no representan necesariamente el contexto actual del evaluador.

---

## 7. Conclusiones

1. Se ha implementado un **CDSS funcional end-to-end** que cumple el alcance MVP definido en requisitos y casos de uso.
2. El pipeline ML es **auditable y reproducible**; el modelo elegido optimiza detección de readmisiones (recall) frente a accuracy global.
3. La **integración SHAP y simulación** constituye el diferencial del producto frente a un clasificador opaco.
4. La **ingeniería de software** (capas, tests, CI/CD, despliegue cloud) demuestra madurez de prototipo enterprise.
5. El sistema es apto como **demostración TFM** y base para evolución (mejoras de modelo, FHIR, multi-centro).

---

## 8. Trabajo futuro

| Línea | Descripción |
|---|---|
| Modelo | Rebalanceo, calibración de umbral, features adicionales, validación externa |
| ML | Promoción condicional de XGBoost/ensemble si mejora recall sin perder explicabilidad |
| Producto | FHIR, multi-hospital, dark mode completo (T-X03), auditoría ampliada (T-X06) |
| Ops | Redis cache, jobs async, monitoring |
| Académico | Estudio de usabilidad con clínicos; métricas de impacto decisional |

---

## 9. Anexos y referencias del repositorio

| Anexo | Ubicación |
|---|---|
| A — Requisitos completos | [Requirements.md](../Requirements/Requirements.md) |
| B — Casos de uso | [Use Cases.md](../Use%20Cases/Use%20Cases.md) |
| C — Pipeline ML detallado | [ML-Pipeline.md](../ML/ML-Pipeline.md) |
| D — Base de datos | [Database.md](../Database/Database.md) |
| E — Testing | [Testing.md](../Testing/Testing.md) |
| F — Diagramas arquitectura | [Architecture/README.md](../Architecture/README.md) |
| G — Capturas UI | [figures/screenshots/README.md](../figures/screenshots/README.md) |
| H — Gráficos EDA | [figures/eda/README.md](../figures/eda/README.md) |
| I — Progreso implementación | [TaskTracker.md](../TaskTracker.md) |

### Bibliografía sugerida (completar en memoria oficial)

- Strack et al. (2014) — dataset Diabetes 130-US.
- Lundberg & Lee (2017) — SHAP.
- Documentación: FastAPI, scikit-learn, SHAP, React.
- Normativa ética CDSS y limitaciones (no diagnóstico automático).

**Defensa oral / vídeo:**

| Formato | Documento |
|---|---|
| Presencial 8–10 min | [Argumentario-Defensa.md](Argumentario-Defensa.md) |
| **Vídeo (cámara + slides + app)** | **[Guion-Video-Defensa.md](Guion-Video-Defensa.md)** + [Slides-Presentacion-Video.md](Slides-Presentacion-Video.md) |

---

*Documento generado como borrador T-809 — julio 2026. Adaptar citas, numeración de figuras y extensión según normativa universitaria.*
