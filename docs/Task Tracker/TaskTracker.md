# MedScope AI — Task Tracker

## Backlog maestro con trazabilidad y enlaces

Documento vivo para seguir el progreso del TFM.

- Marca tareas: `[ ]` → `[x]`
- **Clic en enlaces** para ver la descripción completa de cada requisito / caso de uso
- Columna **Pedir a la IA** = prompt listo para copiar en Cursor

---

## Documentos del proyecto (enlaces rápidos)

| Documento | Enlace | Cuándo consultar |
|---|---|---|
| Requisitos | [Requirements.md](../Requirements/Requirements.md) | Alcance, RF/RNF/RBE |
| Casos de uso | [Use Cases.md](../Use%20Cases/Use%20Cases.md) | Flujos UC-* |
| Execution Plan | [ExecutionPlan.md](../Execution%20Plan/ExecutionPlan.md) | Fases y orden |
| Base de datos | [Database.md](../Database/Database.md) | Esquema, tablas |
| Testing | [Testing.md](../Testing/Testing.md) | Tests, RTS-* |
| Design | [Design/README.md](../Design/README.md) | UI, mockups |
| AGENTS | [AGENTS.md](../../AGENTS.md) | Convenciones IA |
| Visión producto | [General Description.md](../MedScope%20AI%20General%20Description.md) | Narrativa TFM |

## Skills para la IA (por dominio)

| Dominio | Skill | Pedir cuando… |
|---|---|---|
| Backend / API | [skills/backend/SKILL.md](../../skills/backend/SKILL.md) | FastAPI, endpoints, JWT |
| Base de datos | [skills/database/SKILL.md](../../skills/database/SKILL.md) | SQLAlchemy, Alembic, modelos |
| Frontend | [skills/frontend/SKILL.md](../../skills/frontend/SKILL.md) | React, páginas, componentes |
| UI/UX | [skills/ui-ux/SKILL.md](../../skills/ui-ux/SKILL.md) | Colores, layout, diseño |
| ML | [skills/ml/SKILL.md](../../skills/ml/SKILL.md) | Entrenamiento, inferencia |
| SHAP | [skills/shap/SKILL.md](../../skills/shap/SKILL.md) | Explicabilidad |
| Testing | [skills/testing/SKILL.md](../../skills/testing/SKILL.md) | pytest, Playwright |
| Clínico | [skills/clinical-domain/SKILL.md](../../skills/clinical-domain/SKILL.md) | Terminología, tono |
| Documentación | [skills/documentation/SKILL.md](../../skills/documentation/SKILL.md) | Memoria, diagramas |

## Mockups por pantalla

| Pantalla | Mockup | Design system |
|---|---|---|
| Splash | [screens/splash/](../Design/screens/splash/) | [light](../Design/design-system.light.md) |
| Login | [screens/login/](../Design/screens/login/) | [light](../Design/design-system.light.md) |
| Dashboard | [screens/dashboard/](../Design/screens/dashboard/) | [light](../Design/design-system.light.md) |
| Formulario | [screens/prediction-form/](../Design/screens/prediction-form/) | [light](../Design/design-system.light.md) |
| Resultado + SHAP | [screens/prediction-result/](../Design/screens/prediction-result/) | [light](../Design/design-system.light.md) |
| Simulación | [screens/simulation/](../Design/screens/simulation/) | [light](../Design/design-system.light.md) |
| Historial | [screens/history/](../Design/screens/history/) | [light](../Design/design-system.light.md) |
| Analytics | [screens/analytics/](../Design/screens/analytics/) | [light](../Design/design-system.light.md) |

---

## Índice — Requisitos funcionales (RF)

| ID | Enlace | Resumen |
|---|---|---|
| RF-001 | [Login](../Requirements/Requirements.md#rf-001--login) | Auth email + password |
| RF-002 | [Logout](../Requirements/Requirements.md#rf-002--logout) | Cerrar sesión |
| RF-003 | [Sesión JWT](../Requirements/Requirements.md#rf-003--persistencia-de-sesión) | Token persistente |
| RF-004 | [Roles](../Requirements/Requirements.md#rf-004--roles) | admin, clinician, analyst, nurse |
| RF-010 | [Dashboard](../Requirements/Requirements.md#rf-010--dashboard-overview) | Overview KPIs |
| RF-011 | [KPIs](../Requirements/Requirements.md#rf-011--kpis) | Métricas dashboard |
| RF-012 | [Sidebar](../Requirements/Requirements.md#rf-012--navegación-lateral) | Navegación lateral |
| RF-020 | [Formulario](../Requirements/Requirements.md#rf-020--formulario-clínico) | Inputs clínicos |
| RF-021 | [Validación](../Requirements/Requirements.md#rf-021--validación) | Rangos y coherencia |
| RF-022 | [Evaluación IA](../Requirements/Requirements.md#rf-022--evaluación-ia) | Llamada al modelo |
| RF-023 | [Score](../Requirements/Requirements.md#rf-023--mostrar-score) | % riesgo + categoría |
| RF-030 | [SHAP](../Requirements/Requirements.md#rf-030--shap-explanations) | Factores de riesgo |
| RF-031 | [Contribuciones](../Requirements/Requirements.md#rf-031--contribuciones-positivasnegativas) | +/- factores |
| RF-032 | [Resumen textual](../Requirements/Requirements.md#rf-032--explicación-textual) | Explicación clínica |
| RF-040 | [Simulación](../Requirements/Requirements.md#rf-040--simulación-interactiva) | What-if |
| RF-041 | [Recalcular](../Requirements/Requirements.md#rf-041--recalcular-riesgo) | Nuevo score |
| RF-042 | [Comparación](../Requirements/Requirements.md#rf-042--comparación) | Original vs simulado |
| RF-043 | [Visualización](../Requirements/Requirements.md#rf-043--visualización-impacto) | Impacto visual |
| RF-050 | [Historial](../Requirements/Requirements.md#rf-050--historial-evaluaciones) | Guardar predicciones |
| RF-051 | [Búsqueda](../Requirements/Requirements.md#rf-051--búsqueda) | Filtros historial |
| RF-052 | [Detalle](../Requirements/Requirements.md#rf-052--detalle-evaluación) | Ver evaluación pasada |
| RF-060 | [Analytics](../Requirements/Requirements.md#rf-060--dashboard-analítico) | Dashboard analítico |
| RF-061 | [Filtros temp.](../Requirements/Requirements.md#rf-061--filtros) | Filtros temporales |
| RF-062 | [KPIs ejecutivos](../Requirements/Requirements.md#rf-062--kpis-ejecutivos) | Métricas agregadas |

## Índice — API, DB, ML, Tests

| ID | Enlace |
|---|---|
| RBE-001–014 | [Requisitos backend §9](../Requirements/Requirements.md#9-requerimientos-backend) |
| RDB-001–020 | [Requisitos BD §10](../Requirements/Requirements.md#10-requerimientos-base-de-datos) · [Database.md](../Database/Database.md) |
| RIA-001–031 | [Requisitos IA §7](../Requirements/Requirements.md#7-requerimientos-ia--machine-learning) |
| RTS-001–030 | [Requisitos testing §12](../Requirements/Requirements.md#12-requerimientos-testing) · [Testing.md](../Testing/Testing.md) |
| RNF-001–051 | [No funcionales §6](../Requirements/Requirements.md#6-requerimientos-no-funcionales) |
| RFW-001–023 | [Frontend §8](../Requirements/Requirements.md#8-requerimientos-frontend) |
| MVP §17 | [MVP obligatorio](../Requirements/Requirements.md#17-mvp-real-recomendado) |

## Índice — Casos de uso (UC)

| ID | Enlace | Área |
|---|---|---|
| UC-001–003 | [Auth](../Use%20Cases/Use%20Cases.md#4-authentication--user-management) | Login, logout, roles |
| UC-010–012 | [Dashboard](../Use%20Cases/Use%20Cases.md#5-dashboard) | Dashboard, navegación |
| UC-020–023 | [Predicción](../Use%20Cases/Use%20Cases.md#6-clinical-prediction) | Evaluación + persistencia |
| UC-030–032 | [SHAP](../Use%20Cases/Use%20Cases.md#7-explainable-ai) | Explicabilidad |
| UC-040–044 | [Simulación](../Use%20Cases/Use%20Cases.md#8-clinical-simulation) | Sandbox what-if |
| UC-050–052 | [Historial](../Use%20Cases/Use%20Cases.md#9-prediction-history) | Historial |
| UC-060–062 | [Analytics](../Use%20Cases/Use%20Cases.md#10-analytics) | Métricas población |
| UC-080–083 | [Backend](../Use%20Cases/Use%20Cases.md#12-backend--infrastructure) | API, ML pipeline |
| UC-090–091 | [Errores](../Use%20Cases/Use%20Cases.md#13-error-handling) | Validación, fallos |
| UC-100–103 | [UX](../Use%20Cases/Use%20Cases.md#14-uxui-cases) | Loading, notificaciones |
| UC-110–112 | [ML lifecycle](../Use%20Cases/Use%20Cases.md#15-ml-lifecycle-cases) | Entrenamiento offline |
| UC P0 MVP | [Lista crítica](../Use%20Cases/Use%20Cases.md#17-mvp-use-cases-critical) | Must-have |

---

## Resumen de progreso

| Área | Hechas | Total | % |
|---|---|---|---|
| Fase 0 — Inicialización | 8 | 12 | 67% |
| Fase 1 — Backend + DB | 0 | 18 | 0% |
| Fase 2 — ML | 0 | 14 | 0% |
| Fase 3 — ML + Backend | 0 | 12 | 0% |
| Fase 4 — Frontend base | 0 | 14 | 0% |
| Fase 5 — Features clínicas | 0 | 20 | 0% |
| Fase 6 — Analytics + History | 0 | 10 | 0% |
| Fase 7 — Polish + Testing | 0 | 12 | 0% |
| Fase 8 — TFM + Documentación | 2 | 10 | 20% |
| Fase 9 — Demo | 0 | 6 | 0% |
| **TOTAL MVP** | **10** | **128** | **8%** |

---

# FASE 0 — Inicialización

[Execution Plan — Fase 0](../Execution%20Plan/ExecutionPlan.md#phase-0--project-initialization)

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-001 | [x] | Repo Git + README | [EP-0](../Execution%20Plan/ExecutionPlan.md#phase-0--project-initialization) | — |
| T-002 | [x] | `.gitignore` | [EP-0](../Execution%20Plan/ExecutionPlan.md#phase-0--project-initialization) | — |
| T-003 | [x] | Estructura carpetas | [AGENTS.md](../../AGENTS.md#repository-structure) | — |
| T-004 | [x] | `AGENTS.md` | [AGENTS.md](../../AGENTS.md) | — |
| T-005 | [x] | Skills (9) | [skills/](../../skills/) | — |
| T-006 | [x] | Requirements | [Requirements](../Requirements/Requirements.md) | — |
| T-007 | [x] | Use Cases | [Use Cases](../Use%20Cases/Use%20Cases.md) | — |
| T-008 | [x] | Execution Plan | [ExecutionPlan](../Execution%20Plan/ExecutionPlan.md) | — |
| T-009 | [x] | Design + mockups | [Design](../Design/README.md) | — |
| T-010 | [x] | Database doc | [Database](../Database/Database.md) | — |
| T-011 | [x] | Testing doc | [Testing](../Testing/Testing.md) | — |
| T-012 | [x] | `docker-compose.yml` | [RDO-001](../Requirements/Requirements.md#11-requerimientos-devops) · [EP-0.4](../Execution%20Plan/ExecutionPlan.md#04-create-docker-base) | `Crea docker-compose.yml con postgres y backend según EP-0.4 y RDO-001. Lee AGENTS.md.` |
| T-013 | [x] | `Dockerfile` backend | [RDO-001](../Requirements/Requirements.md#rdo-001) | `Crea Dockerfile para FastAPI en backend/. Multi-stage si aplica.` |
| T-014 | [x] | `.env.example` | [RDO-020](../Requirements/Requirements.md#rdo-020) | `Genera .env.example con DATABASE_URL, JWT_SECRET, etc.` |
| T-015 | [x] | Rama `develop` | [EP-0.5](../Execution%20Plan/ExecutionPlan.md#05-create-branch-strategy) | — |
| T-016 | [x] | README setup local | [EP-0](../Execution%20Plan/ExecutionPlan.md#phase-0--project-initialization) | `Amplía README con pasos install Python, Node, Docker y arranque local.` |

---

# FASE 1 — Backend + Base de datos

[Execution Plan — Fase 1](../Execution%20Plan/ExecutionPlan.md#phase-1--database--backend-foundation) · [Database.md](../Database/Database.md) · [skill backend](../../skills/backend/SKILL.md)

## 1.1 Setup FastAPI

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-101 | [ ] | `backend/main.py` FastAPI | [RBE-001](../Requirements/Requirements.md#rbe-001) · [EP-1.1](../Execution%20Plan/ExecutionPlan.md#11-setup-fastapi) | `Inicializa FastAPI en backend/main.py con CORS y health check. Sigue skills/backend y AGENTS.md.` |
| T-102 | [ ] | `core/config.py` | [RDO-020](../Requirements/Requirements.md#rdo-020) | `Crea core/config.py con pydantic-settings para DB y JWT.` |
| T-103 | [ ] | `core/database.py` | [RDB-020](../Requirements/Requirements.md#rdb-020) · [DB §7](../Database/Database.md#7-estructura-backend-sqlalchemy) | `Configura SQLAlchemy engine, SessionLocal y get_db según Database.md.` |
| T-104 | [ ] | Capas routers/services/repos | [RBE-020](../Requirements/Requirements.md#rbe-020) | `Crea estructura routers/, services/, repositories/, schemas/ en backend/.` |
| T-105 | [ ] | Swagger OpenAPI | [RBE-002](../Requirements/Requirements.md#rbe-002) | `Verifica que /docs expone Swagger automáticamente.` |

## 1.2 PostgreSQL + modelos

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-110 | [ ] | BD `medscope_ai` | [RDB-010](../Requirements/Requirements.md#rdb-010) · [DB §1](../Database/Database.md#1-estrategia) | `Configura PostgreSQL medscope_ai en docker-compose.` |
| T-111 | [ ] | Modelo `Role` | [RF-004](../Requirements/Requirements.md#rf-004--roles) · [DB §4.1](../Database/Database.md#41-roles) | `Crea modelo SQLAlchemy Role según Database.md §4.1.` |
| T-112 | [ ] | Modelo `User` | [RF-001](../Requirements/Requirements.md#rf-001--login) · [DB §4.2](../Database/Database.md#42-users) | `Crea modelo User con role_id FK y password_hash.` |
| T-113 | [ ] | Modelo `Prediction` | [RF-023](../Requirements/Requirements.md#rf-023--mostrar-score) · [UC-023](../Use%20Cases/Use%20Cases.md#uc-023--store-prediction) | `Crea modelo Prediction con risk_score, risk_level, model_version.` |
| T-114 | [ ] | Modelo `PatientInput` | [RF-020](../Requirements/Requirements.md#rf-020--formulario-clínico) · [DB §4.4](../Database/Database.md#44-patient_inputs) | `Crea PatientInput 1:1 con Prediction. Campos del dataset diabetes.` |
| T-115 | [ ] | Modelo `ShapExplanation` | [RF-030](../Requirements/Requirements.md#rf-030--shap-explanations) · [DB §4.5](../Database/Database.md#45-shap_explanations) | `Crea ShapExplanation con feature_name, shap_value, importance_rank.` |
| T-116 | [ ] | `Simulation` + `SimulationInput` | [RF-042](../Requirements/Requirements.md#rf-042--comparación) · [UC-044](../Use%20Cases/Use%20Cases.md#uc-044--save-simulation) | `Crea modelos Simulation y SimulationInput según Database.md §4.6–4.7.` |
| T-117 | [ ] | Alembic migración inicial | [RDB-020](../Requirements/Requirements.md#rdb-020) · [DB §8](../Database/Database.md#8-alembic) | `Configura Alembic y genera migración inicial con tablas MVP.` |
| T-118 | [ ] | Seed roles | [RF-004](../Requirements/Requirements.md#rf-004--roles) · [DB §10](../Database/Database.md#10-seed-data-demo--tfm) | `Crea seed: admin, clinician, analyst, nurse.` |
| T-119 | [ ] | Seed usuarios demo | [DB §10](../Database/Database.md#10-seed-data-demo--tfm) | `Seed usuarios demo con bcrypt para defensa TFM.` |

## 1.3 Autenticación

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-120 | [ ] | bcrypt passwords | [RNF-030](../Requirements/Requirements.md#rnf-030) · [UC-001](../Use%20Cases/Use%20Cases.md#uc-001--user-login) | `Implementa hash bcrypt en servicio de auth.` |
| T-121 | [ ] | `POST /auth/login` | [RBE-013](../Requirements/Requirements.md#rbe-013) · [RF-001](../Requirements/Requirements.md#rf-001--login) | `Implementa POST /auth/login: valida email/password, devuelve JWT.` |
| T-122 | [ ] | JWT emitir + validar | [RF-003](../Requirements/Requirements.md#rf-003--persistencia-de-sesión) · [UC-080](../Use%20Cases/Use%20Cases.md#uc-080--api-authentication) | `JWT stateless: crear token en login, middleware de validación.` |
| T-123 | [ ] | Middleware roles | [RF-004](../Requirements/Requirements.md#rf-004--roles) · [UC-003](../Use%20Cases/Use%20Cases.md#uc-003--role-authorization) | `Dependency get_current_user con verificación de rol.` |
| T-124 | [ ] | Logout | [RF-002](../Requirements/Requirements.md#rf-002--logout) · [UC-002](../Use%20Cases/Use%20Cases.md#uc-002--user-logout) | `Endpoint o lógica logout: cliente elimina token.` |
| T-125 | [ ] | CORS | [RNF-033](../Requirements/Requirements.md#rnf-033) | `Configura CORSMiddleware para frontend localhost.` |

### User stories — Auth

| US | ✓ | Historia | UC | RF |
|---|---|---|---|---|
| [US-001](#us-001) | [ ] | Login clinician → dashboard | [UC-001](../Use%20Cases/Use%20Cases.md#uc-001--user-login) | [RF-001](../Requirements/Requirements.md#rf-001--login) |
| [US-002](#us-002) | [ ] | Logout seguro | [UC-002](../Use%20Cases/Use%20Cases.md#uc-002--user-logout) | [RF-002](../Requirements/Requirements.md#rf-002--logout) |
| [US-003](#us-003) | [ ] | Control por rol | [UC-003](../Use%20Cases/Use%20Cases.md#uc-003--role-authorization) | [RF-004](../Requirements/Requirements.md#rf-004--roles) |

**US-001** — Prompt: `Implementa login según UC-001 y RF-001. Pantalla: Design/screens/login/. Skill: frontend + backend.`

**US-002** — Prompt: `Implementa logout UC-002. Invalida sesión en cliente.`

**US-003** — Prompt: `Protege rutas por rol admin/clinician/analyst/nurse según UC-003 y RF-004.`

---

# FASE 2 — Machine Learning

[Execution Plan — Fase 2](../Execution%20Plan/ExecutionPlan.md#phase-2--machine-learning-pipeline) · [skill ml](../../skills/ml/SKILL.md) · [skill shap](../../skills/shap/SKILL.md)

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-201 | [ ] | Dataset Diabetes 130-US | [RIA-001](../Requirements/Requirements.md#ria-001) | `Descarga y documenta Diabetes 130-US hospitals en datasets/.` |
| T-202 | [ ] | Notebook EDA | [UC-110](../Use%20Cases/Use%20Cases.md#uc-110--train-model-offline) | `Crea notebook EDA en notebooks/ con distribuciones y missing values.` |
| T-203 | [ ] | Preprocessing | [RIA-010](../Requirements/Requirements.md#ria-010) | `Implementa ml/preprocessing/ reproducible train/inference.` |
| T-204 | [ ] | Feature engineering | [EP-2.5](../Execution%20Plan/ExecutionPlan.md#25-feature-engineering) | `Features: age, admissions, meds, glucose, stay duration.` |
| T-205 | [ ] | Logistic Regression | [RIA-011](../Requirements/Requirements.md#ria-011) | `Entrena baseline Logistic Regression.` |
| T-206 | [ ] | Random Forest | [EP-2.6](../Execution%20Plan/ExecutionPlan.md#26-train-baseline-models) | `Entrena Random Forest y compara con baseline.` |
| T-207 | [ ] | Métricas | [RIA-012](../Requirements/Requirements.md#ria-012) · [UC-111](../Use%20Cases/Use%20Cases.md#uc-111--evaluate-model-metrics) | `Evalúa Recall, F1, ROC-AUC. Accuracy > 75%. Prioriza Recall.` |
| T-208 | [ ] | Modelo final | [EP-2.8](../Execution%20Plan/ExecutionPlan.md#28-select-final-model) | `Selecciona mejor modelo y documenta por qué.` |
| T-209 | [ ] | Serializar model.pkl | [RIA-020](../Requirements/Requirements.md#ria-020) | `Guarda model.pkl y preprocessor.pkl en models/ con joblib.` |
| T-210 | [ ] | SHAP TreeExplainer | [RIA-030](../Requirements/Requirements.md#ria-030) · [UC-030](../Use%20Cases/Use%20Cases.md#uc-030--generate-shap-explanation) | `Implementa SHAP TreeExplainer. Skill: shap.` |
| T-211 | [ ] | Tests ML | [RTS-010](../Requirements/Requirements.md#rts-010) · [Testing §8](../Testing/Testing.md#8-ml-tests-rts-010) | `Tests en ml/tests/: load, range, SHAP output.` |
| T-212 | [ ] | Doc pipeline TFM | [RAC-010](../Requirements/Requirements.md#rac-010) | `Documenta pipeline ML para memoria.` |
| T-213 | [ ] | (Opc.) XGBoost | [EP-2.6](../Execution%20Plan/ExecutionPlan.md#26-train-baseline-models) | `Opcional: evalúa XGBoost si hay tiempo.` |
| T-214 | [ ] | Gráficos EDA defensa | [RAC-001](../Requirements/Requirements.md#rac-001) | `Exporta gráficos EDA para TFM.` |

| US | ✓ | Historia | UC | RIA |
|---|---|---|---|---|
| US-010 | [ ] | Predecir readmisión | [UC-022](../Use%20Cases/Use%20Cases.md#uc-022--generate-ai-prediction) | [RIA-021](../Requirements/Requirements.md#ria-021) |
| US-011 | [ ] | Explicar predicción | [UC-030](../Use%20Cases/Use%20Cases.md#uc-030--generate-shap-explanation) | [RIA-030](../Requirements/Requirements.md#ria-030) |

---

# FASE 3 — Integración ML + Backend

[Execution Plan — Fase 3](../Execution%20Plan/ExecutionPlan.md#phase-3--ml--backend-integration)

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-301 | [ ] | Load model startup | [UC-082](../Use%20Cases/Use%20Cases.md#uc-082--load-ml-model) | `Carga model.pkl al startup FastAPI con lifespan event.` |
| T-302 | [ ] | prediction_service | [UC-083](../Use%20Cases/Use%20Cases.md#uc-083--execute-prediction-pipeline) | `Crea prediction_service: preprocess → predict → SHAP.` |
| T-303 | [ ] | simulation_service | [EP-3.5](../Execution%20Plan/ExecutionPlan.md#35-create-simulate-endpoint) | `Crea simulation_service con comparación original/simulado.` |
| T-304 | [ ] | `POST /predict` | [RBE-010](../Requirements/Requirements.md#rbe-010) · [UC-022–023](../Use%20Cases/Use%20Cases.md#6-clinical-prediction) | `POST /predict: validar, inferir, SHAP, persistir, responder JSON.` |
| T-305 | [ ] | `POST /simulate` | [RBE-011](../Requirements/Requirements.md#rbe-011) · [UC-040–044](../Use%20Cases/Use%20Cases.md#8-clinical-simulation) | `POST /simulate según RF-040–042 y UC-040–044.` |
| T-306 | [ ] | `GET /history` | [RBE-012](../Requirements/Requirements.md#rbe-012) · [RF-051](../Requirements/Requirements.md#rf-051--búsqueda) | `GET /history con filtros fecha, riesgo, usuario.` |
| T-307 | [ ] | `GET /analytics` | [RBE-014](../Requirements/Requirements.md#rbe-014) · [UC-060](../Use%20Cases/Use%20Cases.md#uc-060--view-analytics-dashboard) | `GET /analytics: agregaciones sobre predictions.` |
| T-308 | [ ] | Persist transacción predict | [UC-023](../Use%20Cases/Use%20Cases.md#uc-023--store-prediction) · [DB §6](../Database/Database.md#6-flujos-de-persistencia) | `Persistir prediction + patient_inputs + shap en una transacción.` |
| T-309 | [ ] | Persist simulación | [UC-044](../Use%20Cases/Use%20Cases.md#uc-044--save-simulation) | `Persistir simulation + simulation_inputs.` |
| T-310 | [ ] | Schemas Pydantic | [RF-021](../Requirements/Requirements.md#rf-021--validación) · [UC-090](../Use%20Cases/Use%20Cases.md#uc-090--handle-invalid-input) | `Schemas Pydantic para inputs clínicos con validación.` |
| T-311 | [ ] | Exception handlers | [UC-091](../Use%20Cases/Use%20Cases.md#uc-091--handle-backend-failure) | `Handlers globales: JSON error, sin stack trace.` |
| T-312 | [ ] | Latencia < 1s | [RNF-001](../Requirements/Requirements.md#rnf-001) | `Optimiza predict para < 1s. Log prediction_time_ms.` |

| US | ✓ | Historia | UC | RF |
|---|---|---|---|---|
| US-020 | [ ] | Enviar datos → score | [UC-020–023](../Use%20Cases/Use%20Cases.md#6-clinical-prediction) | [RF-022](../Requirements/Requirements.md#rf-022--evaluación-ia) |
| US-021 | [ ] | Simular variables | [UC-040–043](../Use%20Cases/Use%20Cases.md#8-clinical-simulation) | [RF-040](../Requirements/Requirements.md#rf-040--simulación-interactiva) |
| US-022 | [ ] | Ver historial (nurse) | [UC-050](../Use%20Cases/Use%20Cases.md#uc-050--view-prediction-history) | [RF-050](../Requirements/Requirements.md#rf-050--historial-evaluaciones) |
| US-023 | [ ] | Analytics población | [UC-060](../Use%20Cases/Use%20Cases.md#uc-060--view-analytics-dashboard) | [RF-060](../Requirements/Requirements.md#rf-060--dashboard-analítico) |

---

# FASE 4 — Frontend foundation

[Execution Plan — Fase 4](../Execution%20Plan/ExecutionPlan.md#phase-4--frontend-foundation) · [skill frontend](../../skills/frontend/SKILL.md)

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-401 | [ ] | Vite + React + TS | [RFW-001](../Requirements/Requirements.md#rfw-001) | `Inicializa frontend con Vite React TypeScript.` |
| T-402 | [ ] | Tailwind + shadcn | [Design light](../Design/design-system.light.md) | `Instala Tailwind y shadcn/ui. Mapea tokens del design system.` |
| T-403 | [ ] | Tokens Tailwind | [RUX-010](../Requirements/Requirements.md#rux-010) | `Configura tailwind.config con colores de design-system.light.md.` |
| T-404 | [ ] | Router + Axios | [EP-4.2](../Execution%20Plan/ExecutionPlan.md#42-install-ui-stack) | `React Router + Axios con base URL configurable.` |
| T-405 | [ ] | Layout sidebar | [RF-012](../Requirements/Requirements.md#rf-012--navegación-lateral) · [dashboard mockup](../Design/screens/dashboard/) | `Layout: sidebar + topbar según mockup dashboard.` |
| T-406 | [ ] | Nav links MVP | [RF-012](../Requirements/Requirements.md#rf-012--navegación-lateral) | `Sidebar: dashboard, evaluación, simulación, historial, analytics, settings.` |
| T-407 | [ ] | Splash | [RFW-010](../Requirements/Requirements.md#rfw-010) · [splash](../Design/screens/splash/) | `Página Splash según mockup light.mockup.png.` |
| T-408 | [ ] | Login | [RFW-011](../Requirements/Requirements.md#rfw-011) · [login](../Design/screens/login/) | `Página Login + integración POST /auth/login.` |
| T-409 | [ ] | `services/auth.ts` | [UC-001](../Use%20Cases/Use%20Cases.md#uc-001--user-login) | `Servicio Axios para login y almacenamiento JWT.` |
| T-410 | [ ] | JWT cliente | [RF-003](../Requirements/Requirements.md#rf-003--persistencia-de-sesión) | `Context o hook para JWT en requests.` |
| T-411 | [ ] | Rutas protegidas | [UC-003](../Use%20Cases/Use%20Cases.md#uc-003--role-authorization) | `PrivateRoute que redirige a login si no hay token.` |
| T-412 | [ ] | Loading/error/success | [UC-101–103](../Use%20Cases/Use%20Cases.md#14-uxui-cases) | `Componentes toast/spinner para estados UX.` |
| T-413 | [ ] | Responsive | [RNF-041](../Requirements/Requirements.md#rnf-041) · [UC-100](../Use%20Cases/Use%20Cases.md#uc-100--responsive-navigation) | `Layout responsive mobile/desktop.` |
| T-414 | [ ] | Recharts | [RFW-020](../Requirements/Requirements.md#rfw-020) | `Instala y configura Recharts.` |

---

# FASE 5 — Features clínicas

[Execution Plan — Fase 5](../Execution%20Plan/ExecutionPlan.md#phase-5--core-clinical-features)

## Dashboard

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-501 | [ ] | KPI cards | [RF-010](../Requirements/Requirements.md#rf-010--dashboard-overview) · [RF-011](../Requirements/Requirements.md#rf-011--kpis) | `Dashboard con KPI cards según RF-011 y mockup dashboard.` |
| T-502 | [ ] | Actividad reciente | [RF-010](../Requirements/Requirements.md#rf-010--dashboard-overview) · [UC-010](../Use%20Cases/Use%20Cases.md#uc-010--view-clinical-dashboard) | `Lista evaluaciones recientes y alertas alto riesgo.` |
| T-503 | [ ] | Distribución riesgo | [UC-011](../Use%20Cases/Use%20Cases.md#uc-011--view-risk-distribution) | `Chart distribución riesgo con Recharts.` |
| T-504 | [ ] | Performance < 2s | [RNF-002](../Requirements/Requirements.md#rnf-002) | `Optimiza carga dashboard < 2 segundos.` |

## Predicción + SHAP

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-510 | [ ] | Formulario clínico | [RF-020](../Requirements/Requirements.md#rf-020--formulario-clínico) · [prediction-form](../Design/screens/prediction-form/) | `Formulario evaluación según RF-020 y mockup.` |
| T-511 | [ ] | Validación form | [RF-021](../Requirements/Requirements.md#rf-021--validación) · [UC-021](../Use%20Cases/Use%20Cases.md#uc-021--validate-clinical-inputs) | `Validación cliente: rangos y campos obligatorios.` |
| T-512 | [ ] | Integrar /predict | [UC-022](../Use%20Cases/Use%20Cases.md#uc-022--generate-ai-prediction) | `Submit form → POST /predict → navegar a resultado.` |
| T-513 | [ ] | Gauge + score | [RF-023](../Requirements/Requirements.md#rf-023--mostrar-score) · [RFW-021](../Requirements/Requirements.md#rfw-021) | `Pantalla resultado: gauge riesgo + categoría.` |
| T-514 | [ ] | SHAP bars | [RF-030](../Requirements/Requirements.md#rf-030--shap-explanations) · [RFW-023](../Requirements/Requirements.md#rfw-023) | `Barras horizontales SHAP según mockup prediction-result.` |
| T-515 | [ ] | Resumen XAI | [RF-032](../Requirements/Requirements.md#rf-032--explicación-textual) · [UC-032](../Use%20Cases/Use%20Cases.md#uc-032--read-ai-clinical-summary) | `Mostrar summary textual del backend. Tono clínico neutral.` |
| T-516 | [ ] | Colores riesgo | [RUX-011](../Requirements/Requirements.md#rux-011) | `Verde/ámbar/rojo para low/medium/high risk.` |

## Simulación

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-520 | [ ] | Panel simulación | [RF-040](../Requirements/Requirements.md#rf-040--simulación-interactiva) · [simulation](../Design/screens/simulation/) | `Panel sliders según mockup simulation.` |
| T-521 | [ ] | Recalcular | [RF-041](../Requirements/Requirements.md#rf-041--recalcular-riesgo) · [UC-042](../Use%20Cases/Use%20Cases.md#uc-042--recalculate-simulated-risk) | `POST /simulate al cambiar variables.` |
| T-522 | [ ] | Comparación | [RF-042](../Requirements/Requirements.md#rf-042--comparación) · [UC-043](../Use%20Cases/Use%20Cases.md#uc-043--compare-original-vs-simulation) | `UI lado a lado: score original vs simulado.` |
| T-523 | [ ] | Wire simulate API | [US-021](#us-021) | `Conectar simulación completa end-to-end.` |
| T-524 | [ ] | Visual impacto | [RF-043](../Requirements/Requirements.md#rf-043--visualización-impacto) | `Highlight cambios que más afectan el riesgo.` |

| US | ✓ | Historia | UC | RF |
|---|---|---|---|---|
| US-030 | [ ] | Dashboard KPIs | [UC-010](../Use%20Cases/Use%20Cases.md#uc-010--view-clinical-dashboard) | [RF-010](../Requirements/Requirements.md#rf-010--dashboard-overview) |
| US-031 | [ ] | Evaluar paciente | [UC-020–023](../Use%20Cases/Use%20Cases.md#6-clinical-prediction) | [RF-020–023](../Requirements/Requirements.md#53-evaluación-clínica) |
| US-032 | [ ] | Ver factores SHAP | [UC-030–032](../Use%20Cases/Use%20Cases.md#7-explainable-ai) | [RF-030–032](../Requirements/Requirements.md#54-explicabilidad-ia) |
| US-033 | [ ] | Simular escenarios | [UC-040–044](../Use%20Cases/Use%20Cases.md#8-clinical-simulation) | [RF-040–043](../Requirements/Requirements.md#55-simulación-clínica) |

---

# FASE 6 — Historial + Analytics

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-601 | [ ] | Página historial | [RF-050](../Requirements/Requirements.md#rf-050--historial-evaluaciones) · [history](../Design/screens/history/) | `Lista evaluaciones según mockup history.` |
| T-602 | [ ] | Filtros | [RF-051](../Requirements/Requirements.md#rf-051--búsqueda) · [UC-051](../Use%20Cases/Use%20Cases.md#uc-051--search-predictions) | `Filtros fecha, riesgo, usuario en GET /history.` |
| T-603 | [ ] | Detalle histórico | [RF-052](../Requirements/Requirements.md#rf-052--detalle-evaluación) · [UC-052](../Use%20Cases/Use%20Cases.md#uc-052--open-historical-prediction) | `Vista detalle con inputs + SHAP histórico.` |
| T-604 | [ ] | API history | [RBE-012](../Requirements/Requirements.md#rbe-012) | `Integrar GET /history en frontend.` |
| T-605 | [ ] | Analytics page | [RF-060](../Requirements/Requirements.md#rf-060--dashboard-analítico) · [analytics](../Design/screens/analytics/) | `Dashboard analytics según mockup.` |
| T-606 | [ ] | Categorías riesgo | [UC-062](../Use%20Cases/Use%20Cases.md#uc-062--analyze-risk-categories) | `Chart distribución categorías.` |
| T-607 | [ ] | Filtros tiempo | [RF-061](../Requirements/Requirements.md#rf-061--filtros) | `Selector rango temporal.` |
| T-608 | [ ] | KPIs ejecutivos | [RF-062](../Requirements/Requirements.md#rf-062--kpis-ejecutivos) | `Cards métricas agregadas.` |
| T-609 | [ ] | API analytics | [RBE-014](../Requirements/Requirements.md#rbe-014) | `Integrar GET /analytics.` |
| T-610 | [ ] | Settings placeholder | [RF-012](../Requirements/Requirements.md#rf-012--navegación-lateral) | `Link settings con página placeholder.` |

---

# FASE 7 — Polish + Testing

[Testing.md](../Testing/Testing.md) · [skill testing](../../skills/testing/SKILL.md)

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-701 | [ ] | UI polish | [RUX-001](../Requirements/Requirements.md#rux-001) · [Design](../Design/design-system.light.md) | `Pulir spacing y tipografía según design system.` |
| T-702 | [ ] | Errores backend | [UC-091](../Use%20Cases/Use%20Cases.md#uc-091--handle-backend-failure) | `Revisar exception handlers y mensajes usuario.` |
| T-703 | [ ] | Performance | [RNF-001](../Requirements/Requirements.md#rnf-001) · [RNF-002](../Requirements/Requirements.md#rnf-002) | `Profile API y render. Optimizar charts.` |
| T-704 | [ ] | test_auth.py | [RTS-001](../Requirements/Requirements.md#rts-001) · [Testing §6](../Testing/Testing.md#6-backend-tests-prioritarios) | `Tests pytest auth: login, JWT, roles.` |
| T-705 | [ ] | test APIs | [RTS-001](../Requirements/Requirements.md#rts-001) | `Tests predict, simulate, history, analytics.` |
| T-706 | [ ] | Coverage 60–75% | [Testing §11](../Testing/Testing.md#11-cobertura) | `pytest --cov hasta 60-75% backend.` |
| T-707 | [ ] | vitest frontend | [RTS-020](../Requirements/Requirements.md#rts-020) | `Tests básicos login form y navegación.` |
| T-708 | [ ] | Playwright E2E | [RTS-030](../Requirements/Requirements.md#rts-030) · [Testing §10](../Testing/Testing.md#10-e2e--playwright-mvp-demo-flow) | `E2E flujo MVP completo en tests/e2e/.` |
| T-709 | [ ] | docker-compose final | [RDO-001](../Requirements/Requirements.md#rdo-001) | `docker-compose: postgres + backend + frontend.` |
| T-710 | [ ] | Env dev/prod | [RDO-010](../Requirements/Requirements.md#rdo-010) | `Documentar variables entorno.` |
| T-711 | [ ] | Logs | [RNF-050](../Requirements/Requirements.md#rnf-050) | `Logging estructurado backend y ML.` |
| T-712 | [ ] | Accesibilidad | [RUX-020](../Requirements/Requirements.md#rux-020) | `Revisar contraste y tipografía legible.` |

### E2E checklist

- [ ] [Login → Dashboard](../Use%20Cases/Use%20Cases.md#uc-001--user-login)
- [ ] [Predicción + SHAP](../Use%20Cases/Use%20Cases.md#uc-030--generate-shap-explanation)
- [ ] [Simulación](../Use%20Cases/Use%20Cases.md#uc-043--compare-original-vs-simulation)
- [ ] [Historial](../Use%20Cases/Use%20Cases.md#uc-052--open-historical-prediction)
- [ ] [Analytics](../Use%20Cases/Use%20Cases.md#uc-060--view-analytics-dashboard)

---

# FASE 8 — TFM

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-801 | [x] | Docs producto | [RAC-010](../Requirements/Requirements.md#rac-010) | — |
| T-802 | [x] | Docs técnica | [RAC-001](../Requirements/Requirements.md#rac-001) | — |
| T-803 | [ ] | Diagrama arquitectura | [RAC-001](../Requirements/Requirements.md#rac-001) | `Genera diagrama Mermaid: frontend → backend → ML → PostgreSQL.` |
| T-804 | [ ] | Diagrama ML pipeline | [RAC-001](../Requirements/Requirements.md#rac-001) | `Diagrama pipeline ML train → serialize → infer.` |
| T-805 | [ ] | Diagrama ER | [Database](../Database/Database.md#3-modelo-de-entidades) | `Diagrama ER desde Database.md.` |
| T-806 | [ ] | Diagrama Docker | [RDO](../Requirements/Requirements.md#11-requerimientos-devops) | `Diagrama despliegue docker-compose.` |
| T-807 | [ ] | Flujo frontend | [RAC-001](../Requirements/Requirements.md#rac-001) | `Diagrama navegación pantallas MVP.` |
| T-808 | [ ] | Screenshots | [Design](../Design/screens/) | `Captura dashboard, SHAP, simulación, analytics.` |
| T-809 | [ ] | Memoria TFM | [RAC-010](../Requirements/Requirements.md#rac-010) | `Ayuda a redactar capítulo resultados y metodología.` |
| T-810 | [ ] | Argumentario defensa | [EP-8](../Execution%20Plan/ExecutionPlan.md#phase-8--thesis--defense-preparation) | `Prepara guion defensa: XAI + simulación.` |

---

# FASE 9 — Demo

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-901 | [ ] | Seed estable | [DB §10](../Database/Database.md#10-seed-data-demo--tfm) | `Verifica seeds demo para defensa.` |
| T-902 | [ ] | Modelo versionado | [EP-9](../Execution%20Plan/ExecutionPlan.md#phase-9--final-demo-preparation) | `Fijar versión modelo sin variabilidad.` |
| T-903 | [ ] | Ensayo demo | [MVP §17](../Requirements/Requirements.md#17-mvp-real-recomendado) · [UC P0](../Use%20Cases/Use%20Cases.md#17-mvp-use-cases-critical) | `Checklist demo: login → analytics sin fallos.` |
| T-904 | [ ] | Docker one-command | [RDO-001](../Requirements/Requirements.md#rdo-001) | `docker compose up funciona de un comando.` |
| T-905 | [ ] | Backup media | [RAC-001](../Requirements/Requirements.md#rac-001) | `Guardar screenshots y vídeo demo.` |
| T-906 | [ ] | Estabilidad | [KPIs §15](../Requirements/Requirements.md#15-kpis-de-éxito) | `Sin errores críticos en flujo demo.` |

---

# BACKLOG OPCIONAL

[Requirements §18](../Requirements/Requirements.md#18-features-opcionales)

| ID | ✓ | Tarea | Docs |
|---|---|---|---|
| T-X01 | [ ] | UI admin usuarios | [RF-070](../Requirements/Requirements.md#rf-070--gestión-usuarios) · [UC-070](../Use%20Cases/Use%20Cases.md#uc-070--manage-users) |
| T-X02 | [ ] | Settings | [RF-071](../Requirements/Requirements.md#rf-071--gestión-roles) · [UC-071](../Use%20Cases/Use%20Cases.md#uc-071--configure-system-settings) |
| T-X03 | [ ] | Dark mode | [Design dark](../Design/design-system.dark.md) |
| T-X04 | [ ] | Export PDF | [UC-063](../Use%20Cases/Use%20Cases.md#uc-063--export-analytics-optional) |
| T-X05 | [ ] | Support UI | [screens/support](../Design/screens/support/) |
| T-X06 | [ ] | Audit avanzado | [UC-081](../Use%20Cases/Use%20Cases.md#uc-081--persist-audit-logs) |
| T-X07 | [ ] | Multi-model | [§18](../Requirements/Requirements.md#18-features-opcionales) |
| T-X08 | [ ] | FHIR / cloud | [UC-120–124](../Use%20Cases/Use%20Cases.md#16-future-expansion-use-cases) |

---

# Matriz MVP (enlaces)

| Bloque | Tareas | Docs |
|---|---|---|
| Auth | T-120–125, T-408–411 | [RF-001–004](../Requirements/Requirements.md#51-autenticación) |
| Dashboard | T-501–504 | [RF-010–012](../Requirements/Requirements.md#52-dashboard-principal) |
| Predicción | T-510–516 | [RF-020–023](../Requirements/Requirements.md#53-evaluación-clínica) |
| SHAP | T-210, T-514–515 | [RF-030–032](../Requirements/Requirements.md#54-explicabilidad-ia) |
| Simulación | T-520–524 | [RF-040–043](../Requirements/Requirements.md#55-simulación-clínica) |
| Historial | T-601–604 | [RF-050–052](../Requirements/Requirements.md#56-historial-clínico) |
| Analytics | T-605–609 | [RF-060–062](../Requirements/Requirements.md#57-analytics) |
| API | T-304–307 | [RBE-010–014](../Requirements/Requirements.md#92-endpoints) |
| DB | T-110–119 | [Database](../Database/Database.md) |
| ML | T-201–210 | [RIA](../Requirements/Requirements.md#7-requerimientos-ia--machine-learning) |
| Tests | T-704–708 | [Testing](../Testing/Testing.md) |
| Docker | T-012–013, T-709 | [DevOps §11](../Requirements/Requirements.md#11-requerimientos-devops) |

---

# Cómo usar este documento

1. Abre el **enlace Docs** de la tarea para leer el requisito completo.
2. Copia el texto de **Pedir a la IA** en Cursor (ajusta si hace falta).
3. Carga el **skill** indicado en la cabecera de fase.
4. Marca `[x]` al terminar y actualiza **Resumen de progreso**.

---

# Historial

| Fecha | Cambio |
|---|---|
| 2026-06-10 | Creación inicial — 128 tareas MVP |
| 2026-06-10 | Enlaces, índices RF/UC, columna prompts IA |
