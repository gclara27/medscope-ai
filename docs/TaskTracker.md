# MedScope AI — Task Tracker

## Backlog maestro con trazabilidad y enlaces

Documento vivo para seguir el progreso del TFM.

- Marca tareas: `[ ]` → `[x]`
- **Clic en enlaces** (Ctrl+clic en el editor) — rutas relativas a `docs/TaskTracker.md`
- Columna **Pedir a la IA** = prompt listo para copiar en Cursor

---

## Documentos del proyecto (enlaces rápidos)

| Documento | Enlace | Cuándo consultar |
|---|---|---|
| Requisitos | [Requirements.md](Requirements/Requirements.md) | Alcance, RF/RNF/RBE |
| Casos de uso | [Use Cases.md](Use%20Cases/Use%20Cases.md) | Flujos UC-* |
| Execution Plan | [ExecutionPlan.md](Execution%20Plan/ExecutionPlan.md) | Fases y orden |
| Base de datos | [Database.md](Database/Database.md) | Esquema, tablas |
| Testing | [Testing.md](Testing/Testing.md) | Tests, RTS-* |
| Despliegue | [Deployment.md](Deployment/Deployment.md) | Cloud prod UC-124 |
| Demo / defensa | [Demo-Playbook-Plan.md](Demo/Demo-Playbook-Plan.md) | Escenarios clínicos + animación simulación |
| Demo público | [Public-Demo-Playground.md](Demo/Public-Demo-Playground.md) | Tour `/demo` sin login |
| Arquitectura / secuencias | [Architecture/](Architecture/README.md) | Diagramas T-803–807, T-811 |
| Memoria TFM | [Thesis/](Thesis/README.md) | Memoria + argumentario defensa (T-809, T-810) |
| Plan opcional | [Optional-Backlog-Plan.md](Optional%20Features/Optional-Backlog-Plan.md) | US, tareas, alcance (T-X03, T-X05–07) |
| Design | [Design/README.md](Design/README.md) | UI, mockups |
| AGENTS | [AGENTS.md](../AGENTS.md) | Convenciones IA |
| Visión producto | [General Description.md](MedScope%20AI%20General%20Description.md) | Narrativa TFM |

## Skills para la IA (por dominio)

| Dominio | Skill | Pedir cuando… |
|---|---|---|
| Backend / API | [skills/backend/SKILL.md](../skills/backend/SKILL.md) | FastAPI, endpoints, JWT |
| Base de datos | [skills/database/SKILL.md](../skills/database/SKILL.md) | SQLAlchemy, Alembic, modelos |
| Frontend | [skills/frontend/SKILL.md](../skills/frontend/SKILL.md) | React, páginas, componentes |
| UI/UX | [skills/ui-ux/SKILL.md](../skills/ui-ux/SKILL.md) | Colores, layout, diseño |
| ML | [skills/ml/SKILL.md](../skills/ml/SKILL.md) | Entrenamiento, inferencia |
| SHAP | [skills/shap/SKILL.md](../skills/shap/SKILL.md) | Explicabilidad |
| Testing | [skills/testing/SKILL.md](../skills/testing/SKILL.md) | pytest, Playwright |
| Clínico | [skills/clinical-domain/SKILL.md](../skills/clinical-domain/SKILL.md) | Terminología, tono |
| Documentación | [skills/documentation/SKILL.md](../skills/documentation/SKILL.md) | Memoria, diagramas |

## Mockups por pantalla

| Pantalla | Mockup | Design system |
|---|---|---|
| Splash | [screens/splash/](Design/screens/splash/light.reference.html) · [dark](Design/screens/splash/dark.reference.html) | [light](Design/design-system.light.md) · [dark](Design/design-system.dark.md) |
| Login | [screens/login/](Design/screens/login/reference.html) | [light](Design/design-system.light.md) |
| Dashboard | [screens/dashboard/](Design/screens/dashboard/reference.html) | [light](Design/design-system.light.md) |
| Formulario | [screens/prediction-form/](Design/screens/prediction-form/reference.html) | [light](Design/design-system.light.md) |
| Resultado + SHAP | [screens/prediction-result/](Design/screens/prediction-result/reference.html) | [light](Design/design-system.light.md) |
| Simulación | [screens/simulation/](Design/screens/simulation/reference.html) | [light](Design/design-system.light.md) |
| Historial | [screens/history/](Design/screens/history/reference.html) | [light](Design/design-system.light.md) |
| Analytics | [screens/analytics/](Design/screens/analytics/reference.html) | [light](Design/design-system.light.md) |
| Support (opcional) | [screens/support/](Design/screens/support/reference.html) | [light](Design/design-system.light.md) |

---

## Índice — Requisitos funcionales (RF)

| ID | Enlace | Resumen |
|---|---|---|
| RF-001 | [Login](Requirements/Requirements.md#rf-001--login) | Auth email + password |
| RF-002 | [Logout](Requirements/Requirements.md#rf-002--logout) | Cerrar sesión |
| RF-003 | [Sesión JWT](Requirements/Requirements.md#rf-003--persistencia-de-sesión) | Token persistente |
| RF-004 | [Roles](Requirements/Requirements.md#rf-004--roles) | admin, clinician, analyst, nurse |
| RF-010 | [Dashboard](Requirements/Requirements.md#rf-010--dashboard-overview) | Overview KPIs |
| RF-011 | [KPIs](Requirements/Requirements.md#rf-011--kpis) | Métricas dashboard |
| RF-012 | [Sidebar](Requirements/Requirements.md#rf-012--navegación-lateral) | Navegación lateral |
| RF-020 | [Formulario](Requirements/Requirements.md#rf-020--formulario-clínico) | Inputs clínicos |
| RF-021 | [Validación](Requirements/Requirements.md#rf-021--validación) | Rangos y coherencia |
| RF-022 | [Evaluación IA](Requirements/Requirements.md#rf-022--evaluación-ia) | Llamada al modelo |
| RF-023 | [Score](Requirements/Requirements.md#rf-023--mostrar-score) | % riesgo + categoría |
| RF-030 | [SHAP](Requirements/Requirements.md#rf-030--shap-explanations) | Factores de riesgo |
| RF-031 | [Contribuciones](Requirements/Requirements.md#rf-031--contribuciones-positivasnegativas) | +/- factores |
| RF-032 | [Resumen textual](Requirements/Requirements.md#rf-032--explicación-textual) | Explicación clínica |
| RF-040 | [Simulación](Requirements/Requirements.md#rf-040--simulación-interactiva) | What-if |
| RF-041 | [Recalcular](Requirements/Requirements.md#rf-041--recalcular-riesgo) | Nuevo score |
| RF-042 | [Comparación](Requirements/Requirements.md#rf-042--comparación) | Original vs simulado |
| RF-043 | [Visualización](Requirements/Requirements.md#rf-043--visualización-impacto) | Impacto visual |
| RF-050 | [Historial](Requirements/Requirements.md#rf-050--historial-evaluaciones) | Guardar predicciones |
| RF-051 | [Búsqueda](Requirements/Requirements.md#rf-051--búsqueda) | Filtros historial |
| RF-052 | [Detalle](Requirements/Requirements.md#rf-052--detalle-evaluación) | Ver evaluación pasada |
| RF-060 | [Analytics](Requirements/Requirements.md#rf-060--dashboard-analítico) | Dashboard analítico |
| RF-061 | [Filtros temp.](Requirements/Requirements.md#rf-061--filtros) | Filtros temporales |
| RF-062 | [KPIs ejecutivos](Requirements/Requirements.md#rf-062--kpis-ejecutivos) | Métricas agregadas |
| RF-072 | [Support center](Requirements/Requirements.md#rf-072--centro-de-soporte) | KB + ayuda (T-X05) |
| RF-073 | [Ticket soporte](Requirements/Requirements.md#rf-073--contacto-y-ticket-de-soporte) | mailto + email (T-X05) |
| RF-074 | [Audit registro](Requirements/Requirements.md#rf-074--registro-de-auditoría) | Persistir logs (T-X06) |
| RF-075 | [Audit consulta](Requirements/Requirements.md#rf-075--consulta-de-auditoría) | API + UI admin (T-X06) |
| RF-076 | [ML comparación UI](Requirements/Requirements.md#rf-076--visualizar-comparación-de-modelos) | Métricas offline (T-X07) |
| RF-077 | [ML comparación API](Requirements/Requirements.md#rf-077--api-de-comparación-ml) | GET /ml/models/comparison (T-X07) |
| RF-078 | [Apariencia / tema](Optional%20Features/Optional-Backlog-Plan.md#t-x03--dark-mode) | Light / Dark / System (T-X03, propuesto) |

## Índice — API, DB, ML, Tests

| ID | Enlace |
|---|---|
| RBE-001–014 | [Requisitos backend §9](Requirements/Requirements.md#9-requerimientos-backend) |
| RDB-001–020 | [Requisitos BD §10](Requirements/Requirements.md#10-requerimientos-base-de-datos) · [Database.md](Database/Database.md) |
| RIA-001–031 | [Requisitos IA §7](Requirements/Requirements.md#7-requerimientos-ia--machine-learning) |
| RTS-001–030 | [Requisitos testing §12](Requirements/Requirements.md#12-requerimientos-testing) · [Testing.md](Testing/Testing.md) |
| RTS-040–043 | [Testing opcional §12.5](Requirements/Requirements.md#125-opcional-t-x05t-x07) · [Plan](Optional%20Features/Optional-Backlog-Plan.md) |
| RNF-001–051 | [No funcionales §6](Requirements/Requirements.md#6-requerimientos-no-funcionales) |
| RFW-001–023 | [Frontend §8](Requirements/Requirements.md#8-requerimientos-frontend) |
| MVP §17 | [MVP obligatorio](Requirements/Requirements.md#17-mvp-real-recomendado) |

## Índice — Casos de uso (UC)

| ID | Enlace | Área |
|---|---|---|
| UC-001–003 | [Auth](Use%20Cases/Use%20Cases.md#4-authentication--user-management) | Login, logout, roles |
| UC-010–012 | [Dashboard](Use%20Cases/Use%20Cases.md#5-dashboard) | Dashboard, navegación |
| UC-020–023 | [Predicción](Use%20Cases/Use%20Cases.md#6-clinical-prediction) | Evaluación + persistencia |
| UC-030–032 | [SHAP](Use%20Cases/Use%20Cases.md#7-explainable-ai) | Explicabilidad |
| UC-040–044 | [Simulación](Use%20Cases/Use%20Cases.md#8-clinical-simulation) | Sandbox what-if |
| UC-050–052 | [Historial](Use%20Cases/Use%20Cases.md#9-prediction-history) | Historial |
| UC-060–062 | [Analytics](Use%20Cases/Use%20Cases.md#10-analytics) | Métricas población |
| UC-066 | [Public demo](Use%20Cases/Use%20Cases.md#uc-066--explore-public-demo-guided-tour) | Tour `/demo` sin login |
| UC-064–065 | [Support](Use%20Cases/Use%20Cases.md#11-support-optional) | Centro ayuda (T-X05) |
| UC-081, UC-085 | [Audit](Use%20Cases/Use%20Cases.md#uc-081--persist-audit-logs) | Logs sistema (T-X06) |
| UC-084 | [ML compare](Use%20Cases/Use%20Cases.md#uc-084--view-ml-model-comparison-optional) | Comparación modelos (T-X07) |
| UC-086 | [Tema apariencia](Optional%20Features/Optional-Backlog-Plan.md#us-043--dark-mode-propuesta) | Dark mode (T-X03, propuesto) |
| UC-080–083 | [Backend](Use%20Cases/Use%20Cases.md#12-backend--infrastructure) | API, ML pipeline |
| UC-090–091 | [Errores](Use%20Cases/Use%20Cases.md#13-error-handling) | Validación, fallos |
| UC-100–103 | [UX](Use%20Cases/Use%20Cases.md#14-uxui-cases) | Loading, notificaciones |
| UC-110–112 | [ML lifecycle](Use%20Cases/Use%20Cases.md#15-ml-lifecycle-cases) | Entrenamiento offline |
| UC P0 MVP | [Lista crítica](Use%20Cases/Use%20Cases.md#17-mvp-use-cases-critical) | Must-have |

---

## Resumen de progreso

| Área | Hechas | Total | % |
|---|---|---|---|
| Fase 0 — Inicialización | 16 | 16 | 100% |
| Fase 1 — Backend + DB | 22 | 22 | 100% |
| Fase 2 — ML | 14 | 14 | 100% |
| Fase 3 — ML + Backend | 14 | 14 | 100% |
| Fase 4 — Frontend base | 14 | 14 | 100% |
| Fase 5 — Features clínicas | 16 | 16 | 100% |
| Fase 6 — Analytics + History | 10 | 10 | 100% |
| Fase 7 — Polish + Testing | 12 | 12 | 100% |
| Despliegue cloud (UC-124) | 6 | 6 | 100% |
| Fase 8 — TFM + Documentación | 13 | 13 | 100% |
| Fase 9 — Demo | 6 | 6 | 100% |
| Fase 9b — Demo WOW (TFM) | 9 | 9 | 100% |
| Fase X — Opcional T-X05–07 | 22 | 22 | 100% |
| **TOTAL MVP** | **152** | **152** | **100%** |

---

# FASE 0 — Inicialización

**Progreso:** 16 / 16 (100%)

[Execution Plan — Fase 0](Execution%20Plan/ExecutionPlan.md#phase-0--project-initialization)

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-001 | [x] | Repo Git + README | [EP-0](Execution%20Plan/ExecutionPlan.md#phase-0--project-initialization) | — |
| T-002 | [x] | `.gitignore` | [EP-0](Execution%20Plan/ExecutionPlan.md#phase-0--project-initialization) | — |
| T-003 | [x] | Estructura carpetas | [AGENTS.md](../AGENTS.md#repository-structure) | — |
| T-004 | [x] | `AGENTS.md` | [AGENTS.md](../AGENTS.md) | — |
| T-005 | [x] | Skills (9) | [skills/](../skills/) | — |
| T-006 | [x] | Requirements | [Requirements](Requirements/Requirements.md) | — |
| T-007 | [x] | Use Cases | [Use Cases](Use%20Cases/Use%20Cases.md) | — |
| T-008 | [x] | Execution Plan | [ExecutionPlan](Execution%20Plan/ExecutionPlan.md) | — |
| T-009 | [x] | Design + mockups | [Design](Design/README.md) | — |
| T-010 | [x] | Database doc | [Database](Database/Database.md) | — |
| T-011 | [x] | Testing doc | [Testing](Testing/Testing.md) | — |
| T-012 | [x] | `docker-compose.yml` | [RDO-001](Requirements/Requirements.md#11-requerimientos-devops) · [EP-0.4](Execution%20Plan/ExecutionPlan.md#04-create-docker-base) | `Crea docker-compose.yml con postgres y backend según EP-0.4 y RDO-001. Lee AGENTS.md.` |
| T-013 | [x] | `Dockerfile` backend | [RDO-001](Requirements/Requirements.md#rdo-001) | `Crea Dockerfile para FastAPI en backend/. Multi-stage si aplica.` |
| T-014 | [x] | `.env.example` | [RDO-020](Requirements/Requirements.md#rdo-020) | `Genera .env.example con DATABASE_URL, JWT_SECRET, etc.` |
| T-015 | [x] | Rama `develop` | [EP-0.5](Execution%20Plan/ExecutionPlan.md#05-create-branch-strategy) | — |
| T-016 | [x] | README setup local | [EP-0](Execution%20Plan/ExecutionPlan.md#phase-0--project-initialization) | `Amplía README con pasos install Python, Node, Docker y arranque local.` |

---

# FASE 1 — Backend + Base de datos

**Progreso:** 22 / 22 (100%) — 1.1 ✓ · 1.2 ✓ · 1.3 ✓

[Execution Plan — Fase 1](Execution%20Plan/ExecutionPlan.md#phase-1--database--backend-foundation) · [Database.md](Database/Database.md) · [skill backend](../skills/backend/SKILL.md) · [Tests manuales Fase 1](Testing/Manual/Phase-01-Backend-Database.md)

## 1.1 Setup FastAPI

**5 / 5 (100%)**

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-101 | [x] | `backend/main.py` FastAPI | [RBE-001](Requirements/Requirements.md#rbe-001) · [EP-1.1](Execution%20Plan/ExecutionPlan.md#11-setup-fastapi) | `Inicializa FastAPI en backend/main.py con CORS y health check. Sigue skills/backend y AGENTS.md.` |
| T-102 | [x] | `core/config.py` | [RDO-020](Requirements/Requirements.md#rdo-020) | `Crea core/config.py con pydantic-settings para DB y JWT.` |
| T-103 | [x] | `core/database.py` | [RDB-020](Requirements/Requirements.md#rdb-020) · [DB §7](Database/Database.md#7-estructura-backend-sqlalchemy) | `Configura SQLAlchemy engine, SessionLocal y get_db según Database.md.` |
| T-104 | [x] | Capas routers/services/repos | [RBE-020](Requirements/Requirements.md#rbe-020) | `Crea estructura routers/, services/, repositories/, schemas/ en backend/.` |
| T-105 | [x] | Swagger OpenAPI | [RBE-002](Requirements/Requirements.md#rbe-002) | `Verifica que /docs expone Swagger automáticamente.` |

## 1.2 PostgreSQL + modelos

**10 / 10 (100%)**

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-110 | [x] | BD `medscope_ai` | [RDB-010](Requirements/Requirements.md#rdb-010) · [DB §1](Database/Database.md#1-estrategia) | `Configura PostgreSQL medscope_ai en docker-compose.` |
| T-111 | [x] | Modelo `Role` | [RF-004](Requirements/Requirements.md#rf-004--roles) · [DB §4.1](Database/Database.md#41-roles) | `Crea modelo SQLAlchemy Role según Database.md §4.1.` |
| T-112 | [x] | Modelo `User` | [RF-001](Requirements/Requirements.md#rf-001--login) · [DB §4.2](Database/Database.md#42-users) | `Crea modelo User con role_id FK y password_hash.` |
| T-113 | [x] | Modelo `Prediction` | [RF-023](Requirements/Requirements.md#rf-023--mostrar-score) · [UC-023](Use%20Cases/Use%20Cases.md#uc-023--store-prediction) | `Crea modelo Prediction con risk_score, risk_level, model_version.` |
| T-114 | [x] | Modelo `PatientInput` | [RF-020](Requirements/Requirements.md#rf-020--formulario-clínico) · [DB §4.4](Database/Database.md#44-patient_inputs) | `Crea PatientInput 1:1 con Prediction. Campos del dataset diabetes.` |
| T-115 | [x] | Modelo `ShapExplanation` | [RF-030](Requirements/Requirements.md#rf-030--shap-explanations) · [DB §4.5](Database/Database.md#45-shap_explanations) | `Crea ShapExplanation con feature_name, shap_value, importance_rank.` |
| T-116 | [x] | `Simulation` + `SimulationInput` | [RF-042](Requirements/Requirements.md#rf-042--comparación) · [UC-044](Use%20Cases/Use%20Cases.md#uc-044--save-simulation) | `Crea modelos Simulation y SimulationInput según Database.md §4.6–4.7.` |
| T-117 | [x] | Alembic migración inicial | [RDB-020](Requirements/Requirements.md#rdb-020) · [DB §8](Database/Database.md#8-alembic) | `Configura Alembic y genera migración inicial con tablas MVP.` |
| T-118 | [x] | Seed roles | [RF-004](Requirements/Requirements.md#rf-004--roles) · [DB §10](Database/Database.md#10-seed-data-demo--tfm) | `Crea seed: admin, clinician, analyst, nurse.` |
| T-119 | [x] | Seed usuarios demo | [DB §10](Database/Database.md#10-seed-data-demo--tfm) | `Seed usuarios demo con bcrypt para defensa TFM.` |

## 1.3 Autenticación

**7 / 7 (100%)**

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-120 | [x] | bcrypt passwords | [RNF-030](Requirements/Requirements.md#rnf-030) · [UC-001](Use%20Cases/Use%20Cases.md#uc-001--user-login) | `Implementa hash bcrypt en servicio de auth.` |
| T-121 | [x] | `POST /auth/login` | [RBE-013](Requirements/Requirements.md#rbe-013) · [RF-001](Requirements/Requirements.md#rf-001--login) | `Implementa POST /auth/login: valida email/password, devuelve JWT.` |
| T-122 | [x] | JWT emitir + validar | [RF-003](Requirements/Requirements.md#rf-003--persistencia-de-sesión) · [UC-080](Use%20Cases/Use%20Cases.md#uc-080--api-authentication) | `JWT stateless: crear token en login, middleware de validación.` |
| T-123 | [x] | Middleware roles | [RF-004](Requirements/Requirements.md#rf-004--roles) · [UC-003](Use%20Cases/Use%20Cases.md#uc-003--role-authorization) | `Dependency get_current_user con verificación de rol.` |
| T-124 | [x] | Logout | [RF-002](Requirements/Requirements.md#rf-002--logout) · [UC-002](Use%20Cases/Use%20Cases.md#uc-002--user-logout) | `Endpoint o lógica logout: cliente elimina token.` |
| T-125 | [x] | CORS | [RNF-033](Requirements/Requirements.md#rnf-033) | `Configura CORSMiddleware para frontend localhost. (Implementado en T-101)` |
| T-126 | [x] | Tests auth | [RTS-001](Requirements/Requirements.md#rts-001) · [Testing §6.1](Testing/Testing.md#61-authentication-uc-001003) | `Tras T-121–123: tests pytest login válido/inválido, JWT, roles, 401/403.` |

### User stories — Auth

| US | ✓ | Historia | UC | RF |
|---|---|---|---|---|
| [US-001](#us-001) | [x] | Login clinician → dashboard | [UC-001](Use%20Cases/Use%20Cases.md#uc-001--user-login) | [RF-001](Requirements/Requirements.md#rf-001--login) |
| [US-002](#us-002) | [x] | Logout seguro | [UC-002](Use%20Cases/Use%20Cases.md#uc-002--user-logout) | [RF-002](Requirements/Requirements.md#rf-002--logout) |
| [US-003](#us-003) | [x] | Control por rol | [UC-003](Use%20Cases/Use%20Cases.md#uc-003--role-authorization) | [RF-004](Requirements/Requirements.md#rf-004--roles) |

**US-001** — Prompt: `Implementa login según UC-001 y RF-001. Pantalla: Design/screens/login/. Skill: frontend + backend.`

**US-002** — Prompt: `Implementa logout UC-002. Invalida sesión en cliente.`

**US-003** — Prompt: `Protege rutas por rol admin/clinician/analyst/nurse según UC-003 y RF-004.`

---

# FASE 2 — Machine Learning

**Progreso:** 14 / 14 (100%)

[Execution Plan — Fase 2](Execution%20Plan/ExecutionPlan.md#phase-2--machine-learning-pipeline) · [skill ml](../skills/ml/SKILL.md) · [skill shap](../skills/shap/SKILL.md) · [Tests manuales Fase 2](Testing/Manual/Phase-02-ML-Pipeline.md)

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-201 | [x] | Dataset Diabetes 130-US | [RIA-001](Requirements/Requirements.md#ria-001) | `Descarga y documenta Diabetes 130-US hospitals en datasets/.` |
| T-202 | [x] | Notebook EDA | [UC-110](Use%20Cases/Use%20Cases.md#uc-110--train-model-offline) | `Crea notebook EDA en notebooks/ con distribuciones y missing values.` |
| T-203 | [x] | Preprocessing | [RIA-010](Requirements/Requirements.md#ria-010) | `Implementa ml/preprocessing/ reproducible train/inference.` |
| T-204 | [x] | Feature engineering | [EP-2.5](Execution%20Plan/ExecutionPlan.md#25-feature-engineering) | `Features: age, admissions, meds, glucose, stay duration.` |
| T-205 | [x] | Logistic Regression | [RIA-011](Requirements/Requirements.md#ria-011) | `Entrena baseline Logistic Regression.` |
| T-206 | [x] | Random Forest | [EP-2.6](Execution%20Plan/ExecutionPlan.md#26-train-baseline-models) | `Entrena Random Forest y compara con baseline.` |
| T-207 | [x] | Métricas | [RIA-012](Requirements/Requirements.md#ria-012) · [UC-111](Use%20Cases/Use%20Cases.md#uc-111--evaluate-model-metrics) | `Evalúa Recall, F1, ROC-AUC. Accuracy > 75%. Prioriza Recall.` |
| T-208 | [x] | Modelo final | [EP-2.8](Execution%20Plan/ExecutionPlan.md#28-select-final-model) | `Selecciona mejor modelo y documenta por qué.` |
| T-209 | [x] | Serializar model.pkl | [RIA-020](Requirements/Requirements.md#ria-020) | `Guarda model.pkl y preprocessor.pkl en models/ con joblib.` |
| T-210 | [x] | SHAP explainability | [RIA-030](Requirements/Requirements.md#ria-030) · [UC-030](Use%20Cases/Use%20Cases.md#uc-030--generate-shap-explanation) | `Implementa SHAP (LinearExplainer producción LR; TreeExplainer RF/XGB). Skill: shap.` |
| T-211 | [x] | Tests ML | [RTS-010](Requirements/Requirements.md#rts-010) · [Testing §8](Testing/Testing.md#8-ml-tests-rts-010) | `Tests en ml/tests/: load, range, SHAP output.` |
| T-212 | [x] | Doc pipeline TFM | [RAC-010](Requirements/Requirements.md#rac-010) | `Documenta pipeline ML para memoria.` |
| T-213 | [x] | (Opc.) XGBoost | [EP-2.6](Execution%20Plan/ExecutionPlan.md#26-train-baseline-models) | `Opcional: evalúa XGBoost si hay tiempo.` |
| T-214 | [x] | Gráficos EDA defensa | [RAC-001](Requirements/Requirements.md#rac-001) | `Exporta gráficos EDA para TFM.` |

| US | ✓ | Historia | UC | RIA |
|---|---|---|---|---|
---

# FASE 3 — Integración ML + Backend

**Progreso:** 14 / 14 (100%)

[Execution Plan — Fase 3](Execution%20Plan/ExecutionPlan.md#phase-3--ml--backend-integration) · [Tests manuales Fase 3](Testing/Manual/Phase-03-ML-Backend-Integration.md)

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-301 | [x] | Load model startup | [UC-082](Use%20Cases/Use%20Cases.md#uc-082--load-ml-model) | `Carga model.pkl al startup FastAPI con lifespan event.` |
| T-302 | [x] | prediction_service | [UC-083](Use%20Cases/Use%20Cases.md#uc-083--execute-prediction-pipeline) | `Crea prediction_service: preprocess → predict → SHAP.` |
| T-303 | [x] | simulation_service | [EP-3.5](Execution%20Plan/ExecutionPlan.md#35-create-simulate-endpoint) | `Crea simulation_service con comparación original/simulado.` |
| T-304 | [x] | `POST /predict` | [RBE-010](Requirements/Requirements.md#rbe-010) · [UC-022–023](Use%20Cases/Use%20Cases.md#6-clinical-prediction) | `POST /predict: validar, inferir, SHAP, persistir, responder JSON.` |
| T-305 | [x] | `POST /simulate` | [RBE-011](Requirements/Requirements.md#rbe-011) · [UC-040–044](Use%20Cases/Use%20Cases.md#8-clinical-simulation) | `POST /simulate según RF-040–042 y UC-040–044.` |
| T-306 | [x] | `GET /history` | [RBE-012](Requirements/Requirements.md#rbe-012) · [RF-051](Requirements/Requirements.md#rf-051--búsqueda) | `GET /history con filtros fecha, riesgo, usuario.` |
| T-307 | [x] | `GET /analytics` | [RBE-014](Requirements/Requirements.md#rbe-014) · [UC-060](Use%20Cases/Use%20Cases.md#uc-060--view-analytics-dashboard) | `GET /analytics: agregaciones sobre predictions.` |
| T-308 | [x] | Persist transacción predict | [UC-023](Use%20Cases/Use%20Cases.md#uc-023--store-prediction) · [DB §6](Database/Database.md#6-flujos-de-persistencia) | `Persistir prediction + patient_inputs + shap en una transacción.` |
| T-309 | [x] | Persist simulación | [UC-044](Use%20Cases/Use%20Cases.md#uc-044--save-simulation) | `Persistir simulation + simulation_inputs.` |
| T-310 | [x] | Schemas Pydantic | [RF-021](Requirements/Requirements.md#rf-021--validación) · [UC-090](Use%20Cases/Use%20Cases.md#uc-090--handle-invalid-input) | `Schemas Pydantic para inputs clínicos con validación.` |
| T-311 | [x] | Exception handlers | [UC-091](Use%20Cases/Use%20Cases.md#uc-091--handle-backend-failure) | `Handlers globales: JSON error, sin stack trace.` |
| T-312 | [x] | Latencia < 1s | [RNF-001](Requirements/Requirements.md#rnf-001) | `Optimiza predict para < 1s. Log prediction_time_ms.` |
| T-313 | [x] | Tests APIs predict/simulate | [RTS-001](Requirements/Requirements.md#rts-001) · [Testing §6.2–6.3](Testing/Testing.md#62-prediction-api-uc-020023-uc-030) | `Predict: test_predictions.py (7). Simulate API: test_simulations.py (6) + test_simulation_service.py (5) + test_simulation_mapper.py (4).` |
| T-314 | [x] | Tests history/analytics | [RTS-001](Requirements/Requirements.md#rts-001) · [Testing §6.4](Testing/Testing.md#64-history--analytics-uc-050052-uc-060062) | `History: test_history.py (6). Analytics: test_analytics.py (6). risk_format: test_risk_format.py (1). Exception handlers: test_exception_handlers.py (4).` |

| US | ✓ | Historia | UC | RIA / RF |
|---|---|---|---|---|
| US-010 | [x] | Predecir readmisión (API) | [UC-022](Use%20Cases/Use%20Cases.md#uc-022--generate-ai-prediction) | [RIA-021](Requirements/Requirements.md#ria-021) |
| US-011 | [x] | Explicar predicción (API) | [UC-030](Use%20Cases/Use%20Cases.md#uc-030--generate-shap-explanation) | [RIA-030](Requirements/Requirements.md#ria-030) |
| US-020 | [x] | Enviar datos → score (UI) | [UC-020–023](Use%20Cases/Use%20Cases.md#6-clinical-prediction) | [RF-022](Requirements/Requirements.md#rf-022--evaluación-ia) |
| US-021 | [x] | Simular variables | [UC-040–043](Use%20Cases/Use%20Cases.md#8-clinical-simulation) | [RF-040](Requirements/Requirements.md#rf-040--simulación-interactiva) |
| US-022 | [x] | Ver historial (nurse) | [UC-050](Use%20Cases/Use%20Cases.md#uc-050--view-prediction-history) | [RF-050](Requirements/Requirements.md#rf-050--historial-evaluaciones) |
| US-023 | [x] | Analytics población | [UC-060](Use%20Cases/Use%20Cases.md#uc-060--view-analytics-dashboard) | [RF-060](Requirements/Requirements.md#rf-060--dashboard-analítico) |

---

# FASE 4 — Frontend foundation

**Progreso:** 14 / 14 (100%)

[Execution Plan — Fase 4](Execution%20Plan/ExecutionPlan.md#phase-4--frontend-foundation) · [skill frontend](../skills/frontend/SKILL.md)

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-401 | [x] | Vite + React + TS | [RFW-001](Requirements/Requirements.md#rfw-001) | `Inicializa frontend con Vite React TypeScript.` |
| T-402 | [x] | Tailwind + shadcn | [Design light](Design/design-system.light.md) | `Instala Tailwind y shadcn/ui. Mapea tokens del design system.` |
| T-403 | [x] | Tokens Tailwind | [RUX-010](Requirements/Requirements.md#rux-010) | `Configura tailwind.config con colores de design-system.light.md.` |
| T-404 | [x] | Router + Axios | [EP-4.2](Execution%20Plan/ExecutionPlan.md#42-install-ui-stack) | `React Router + Axios con base URL configurable.` |
| T-405 | [x] | Layout sidebar | [RF-012](Requirements/Requirements.md#rf-012--navegación-lateral) · [dashboard mockup](Design/screens/dashboard/reference.html) | `Layout: sidebar + topbar según mockup dashboard.` |
| T-406 | [x] | Nav links MVP | [RF-012](Requirements/Requirements.md#rf-012--navegación-lateral) | `Sidebar: dashboard, evaluación, simulación, historial, analytics, settings.` |
| T-407 | [x] | Splash | [RFW-010](Requirements/Requirements.md#rfw-010) · [splash](Design/screens/splash/light.reference.html) | `Página Splash según mockup light.mockup.png.` |
| T-408 | [x] | Login | [RFW-011](Requirements/Requirements.md#rfw-011) · [login](Design/screens/login/reference.html) | `Página Login + integración POST /auth/login.` |
| T-409 | [x] | `services/auth.ts` | [UC-001](Use%20Cases/Use%20Cases.md#uc-001--user-login) | `Servicio Axios para login y almacenamiento JWT.` |
| T-410 | [x] | JWT cliente | [RF-003](Requirements/Requirements.md#rf-003--persistencia-de-sesión) | `Context o hook para JWT en requests.` |
| T-411 | [x] | Rutas protegidas | [UC-003](Use%20Cases/Use%20Cases.md#uc-003--role-authorization) | `PrivateRoute que redirige a login si no hay token.` |
| T-412 | [x] | Loading/error/success | [UC-101–103](Use%20Cases/Use%20Cases.md#14-uxui-cases) | `Componentes toast/spinner para estados UX.` |
| T-413 | [x] | Responsive | [RNF-041](Requirements/Requirements.md#rnf-041) · [UC-100](Use%20Cases/Use%20Cases.md#uc-100--responsive-navigation) | `Layout responsive mobile/desktop.` |
| T-414 | [x] | Recharts | [RFW-020](Requirements/Requirements.md#rfw-020) | `Instala y configura Recharts.` |

---

# FASE 5 — Features clínicas

**Progreso:** 16 / 16 (100%)

[Execution Plan — Fase 5](Execution%20Plan/ExecutionPlan.md#phase-5--core-clinical-features)

## Dashboard

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-501 | [x] | KPI cards | [RF-010](Requirements/Requirements.md#rf-010--dashboard-overview) · [RF-011](Requirements/Requirements.md#rf-011--kpis) | `Dashboard con KPI cards según RF-011 y mockup dashboard.` |
| T-502 | [x] | Actividad reciente | [RF-010](Requirements/Requirements.md#rf-010--dashboard-overview) · [UC-010](Use%20Cases/Use%20Cases.md#uc-010--view-clinical-dashboard) | `Lista evaluaciones recientes y alertas alto riesgo.` |
| T-503 | [x] | Distribución riesgo | [UC-011](Use%20Cases/Use%20Cases.md#uc-011--view-risk-distribution) | `Chart distribución riesgo con Recharts.` |
| T-504 | [x] | Performance < 2s | [RNF-002](Requirements/Requirements.md#rnf-002) | `Optimiza carga dashboard < 2 segundos.` |

## Predicción + SHAP

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-510 | [x] | Formulario clínico | [RF-020](Requirements/Requirements.md#rf-020--formulario-clínico) · [prediction-form](Design/screens/prediction-form/reference.html) | `Formulario evaluación según RF-020 y mockup.` |
| T-511 | [x] | Validación form | [RF-021](Requirements/Requirements.md#rf-021--validación) · [UC-021](Use%20Cases/Use%20Cases.md#uc-021--validate-clinical-inputs) | `Validación cliente: rangos y campos obligatorios.` |
| T-512 | [x] | Integrar /predict | [UC-022](Use%20Cases/Use%20Cases.md#uc-022--generate-ai-prediction) | `Submit form → POST /predict → navegar a resultado.` |
| T-513 | [x] | Gauge + score | [RF-023](Requirements/Requirements.md#rf-023--mostrar-score) · [RFW-021](Requirements/Requirements.md#rfw-021) | `Pantalla resultado: gauge riesgo + categoría.` |
| T-514 | [x] | SHAP bars | [RF-030](Requirements/Requirements.md#rf-030--shap-explanations) · [RFW-023](Requirements/Requirements.md#rfw-023) | `Barras horizontales SHAP según mockup prediction-result.` |
| T-515 | [x] | Resumen XAI | [RF-032](Requirements/Requirements.md#rf-032--explicación-textual) · [UC-032](Use%20Cases/Use%20Cases.md#uc-032--read-ai-clinical-summary) | `Mostrar summary textual del backend. Tono clínico neutral.` |
| T-516 | [x] | Colores riesgo | [RUX-011](Requirements/Requirements.md#rux-011) | `Verde/ámbar/rojo para low/medium/high risk.` |

## Simulación

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-520 | [x] | Panel simulación | [RF-040](Requirements/Requirements.md#rf-040--simulación-interactiva) · [simulation](Design/screens/simulation/reference.html) | `Panel sliders según mockup simulation.` |
| T-521 | [x] | Recalcular | [RF-041](Requirements/Requirements.md#rf-041--recalcular-riesgo) · [UC-042](Use%20Cases/Use%20Cases.md#uc-042--recalculate-simulated-risk) | `POST /simulate al cambiar variables.` |
| T-522 | [x] | Comparación | [RF-042](Requirements/Requirements.md#rf-042--comparación) · [UC-043](Use%20Cases/Use%20Cases.md#uc-043--compare-original-vs-simulation) | `UI lado a lado: score original vs simulado.` |
| T-523 | [x] | Wire simulate API | [US-021](#us-021) | `Conectar simulación completa end-to-end.` |
| T-524 | [x] | Visual impacto | [RF-043](Requirements/Requirements.md#rf-043--visualización-impacto) | `Highlight cambios que más afectan el riesgo.` |

| US | ✓ | Historia | UC | RF |
|---|---|---|---|---|
| US-030 | [x] | Dashboard KPIs | [UC-010](Use%20Cases/Use%20Cases.md#uc-010--view-clinical-dashboard) | [RF-010](Requirements/Requirements.md#rf-010--dashboard-overview) |
| US-031 | [x] | Evaluar paciente | [UC-020–023](Use%20Cases/Use%20Cases.md#6-clinical-prediction) | [RF-020–023](Requirements/Requirements.md#53-evaluación-clínica) |
| US-032 | [x] | Ver factores SHAP | [UC-030–032](Use%20Cases/Use%20Cases.md#7-explainable-ai) | [RF-030–032](Requirements/Requirements.md#54-explicabilidad-ia) |
| US-021 | [x] | Simular variables | [UC-040–043](Use%20Cases/Use%20Cases.md#8-clinical-simulation) | [RF-040](Requirements/Requirements.md#rf-040--simulación-interactiva) |
| US-033 | [x] | Simular escenarios (+ impacto visual) | [UC-040–044](Use%20Cases/Use%20Cases.md#8-clinical-simulation) | [RF-040–043](Requirements/Requirements.md#55-simulación-clínica) |

---

# FASE 6 — Historial + Analytics

**Progreso:** 10 / 10 (100%) · **Estado:** cerrada (2026-06-11)

Entregables: historial (`/history`, filtros, detalle SHAP), analytics (`/analytics`), settings placeholder admin (`/settings`). User stories **US-022** y **US-023** cerradas.

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-601 | [x] | Página historial | [RF-050](Requirements/Requirements.md#rf-050--historial-evaluaciones) · [history](Design/screens/history/reference.html) | `Lista evaluaciones según mockup history.` |
| T-602 | [x] | Filtros | [RF-051](Requirements/Requirements.md#rf-051--búsqueda) · [UC-051](Use%20Cases/Use%20Cases.md#uc-051--search-predictions) | `Filtros fecha, riesgo, usuario en GET /history.` |
| T-603 | [x] | Detalle histórico | [RF-052](Requirements/Requirements.md#rf-052--detalle-evaluación) · [UC-052](Use%20Cases/Use%20Cases.md#uc-052--open-historical-prediction) | `Vista detalle con inputs + SHAP histórico.` |
| T-604 | [x] | API history | [RBE-012](Requirements/Requirements.md#rbe-012) | `Integrar GET /history en frontend.` |
| T-605 | [x] | Analytics page | [RF-060](Requirements/Requirements.md#rf-060--dashboard-analítico) · [analytics](Design/screens/analytics/reference.html) | `Dashboard analytics según mockup.` |
| T-606 | [x] | Categorías riesgo | [UC-062](Use%20Cases/Use%20Cases.md#uc-062--analyze-risk-categories) | `Chart distribución categorías.` |
| T-607 | [x] | Filtros tiempo | [RF-061](Requirements/Requirements.md#rf-061--filtros) | `Selector rango temporal.` |
| T-608 | [x] | KPIs ejecutivos | [RF-062](Requirements/Requirements.md#rf-062--kpis-ejecutivos) | `Cards métricas agregadas.` |
| T-609 | [x] | API analytics | [RBE-014](Requirements/Requirements.md#rbe-014) | `Integrar GET /analytics.` |
| T-610 | [x] | Settings placeholder | [RF-012](Requirements/Requirements.md#rf-012--navegación-lateral) | `Link settings con página placeholder.` |

---

# FASE 7 — Polish + Testing

**Progreso:** 12 / 12 (100%)

[Testing.md](Testing/Testing.md) · [skill testing](../skills/testing/SKILL.md)

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-701 | [x] | UI polish | [RUX-001](Requirements/Requirements.md#rux-001) · [Design](Design/design-system.light.md) | `Pulir spacing y tipografía según design system.` |
| T-702 | [x] | Errores backend | [UC-091](Use%20Cases/Use%20Cases.md#uc-091--handle-backend-failure) | `Revisar exception handlers y mensajes usuario.` |
| T-703 | [x] | Performance | [RNF-001](Requirements/Requirements.md#rnf-001) · [RNF-002](Requirements/Requirements.md#rnf-002) | `Profile API y render. Optimizar charts.` |
| T-704 | [x] | test_auth.py | [RTS-001](Requirements/Requirements.md#rts-001) · [Testing §6](Testing/Testing.md#6-backend-tests-prioritarios) | `Tests pytest auth: login, JWT, roles.` |
| T-705 | [x] | test APIs | [RTS-001](Requirements/Requirements.md#rts-001) · [Testing §6.2–6.4](Testing/Testing.md#62-prediction-api-uc-020023-uc-030) | `test_apis.py (26): predict, simulate, history, analytics + flujo MVP.` |
| T-706 | [x] | Coverage 60–75% | [Testing §11](Testing/Testing.md#11-cobertura) | `test-backend.ps1 + pyproject coverage; ~95% app code, fail_under 60.` |
| T-707 | [x] | vitest frontend | [RTS-020](Requirements/Requirements.md#rts-020) · [Testing §9](Testing/Testing.md#9-frontend-tests-rts-020) | `rts020.test.tsx + test-frontend.ps1; login, guards, sidebar MVP.` |
| T-708 | [x] | Playwright E2E | [RTS-030](Requirements/Requirements.md#rts-030) · [Testing §10](Testing/Testing.md#10-e2e--playwright-mvp-demo-flow) | `tests/e2e: auth, rbac, mvp-flow + test-e2e.ps1 (5 tests).` |
| T-709 | [x] | docker-compose final | [RDO-001](Requirements/Requirements.md#rdo-001) | `postgres + backend + frontend (nginx); docker-up.ps1; migrations entrypoint.` |
| T-710 | [x] | Env dev/prod | [RDO-010](Requirements/Requirements.md#rdo-010) · [Environment.md](Environment/Environment.md) | `docs/Environment/Environment.md + .env.example ampliados.` |
| T-711 | [x] | Logs | [RNF-050](Requirements/Requirements.md#rnf-050) | `ml/logging_config.py + middleware/handlers; LOG_LEVEL/LOG_FORMAT.` |
| T-712 | [x] | Accesibilidad | [RUX-020](Requirements/Requirements.md#rux-020) | `contrast audit + readable tokens; skip link; rux020.test.tsx.` |

### E2E checklist

- [x] [Login → Dashboard](Use%20Cases/Use%20Cases.md#uc-001--user-login)
- [x] [Predicción + SHAP](Use%20Cases/Use%20Cases.md#uc-030--generate-shap-explanation)
- [x] [Simulación](Use%20Cases/Use%20Cases.md#uc-043--compare-original-vs-simulation)
- [x] [Historial](Use%20Cases/Use%20Cases.md#uc-052--open-historical-prediction)
- [x] [Analytics](Use%20Cases/Use%20Cases.md#uc-060--view-analytics-dashboard)

---

# DESPLIEGUE CLOUD — UC-124

**Progreso:** 6 / 6 (100%) · [Deployment.md](Deployment/Deployment.md)

| ID | ✓ | Tarea | Docs | Notas |
|---|---|---|---|---|
| T-713 | [x] | Prep repo Fase 0 | [Deployment §3](Deployment/Deployment.md#3-fase-0--preparar-el-repositorio) | Dockerfile, `vercel.json`, CI, artefactos ML |
| T-714 | [x] | Supabase + migraciones | [Deployment §4](Deployment/Deployment.md#4-fase-1--supabase-base-de-datos) | Session pooler, `alembic upgrade head` |
| T-715 | [x] | Render API + ML | [Deployment §5](Deployment/Deployment.md#5-fase-2--render-backend-api) | Docker, `/health` `ml_ready: true` |
| T-716 | [x] | Vercel frontend | [Deployment §6](Deployment/Deployment.md#6-fase-3--vercel-frontend) | Root `frontend`, `VITE_API_BASE_URL` |
| T-717 | [x] | CORS + E2E prod | [Deployment §6.4](Deployment/Deployment.md#64-verificación-end-to-end) | https://medscope-ai-delta.vercel.app |
| T-718 | [x] | CI/CD `main` | [Deployment §7](Deployment/Deployment.md#7-cicd--deploy-automático-en-main) | GitHub Actions + webhooks |

---

# FASE 8 — TFM

**Progreso:** 13 / 13 (100%)

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-801 | [x] | Docs producto (base) | [RAC-010](Requirements/Requirements.md#rac-010) | Requirements, Use Cases, General Description, ML-Pipeline (T-212) |
| T-801a | [x] | Actualización producto post-MVP | [RAC-010](Requirements/Requirements.md#rac-010) | UC-066, RFW-027, splash, opcionales, General Description jul 2026 |
| T-802 | [x] | Docs técnica (base) | [RAC-001](Requirements/Requirements.md#rac-001) | AGENTS, Database, ML-Pipeline, Deployment |
| T-802a | [x] | Actualización técnica post-MVP | [RAC-001](Requirements/Requirements.md#rac-001) | [Public-Demo-Playground.md](Demo/Public-Demo-Playground.md), endpoints `/demo`, AGENTS |
| T-811 | [x] | Diagramas secuencia UC | [Sequence-Diagrams.md](Architecture/Sequence-Diagrams.md) | Login, predict, simulate, history, support, demo público |
| T-803 | [x] | Diagrama arquitectura | [System-Architecture.md](Architecture/System-Architecture.md) | Monorepo, capas backend, ML runtime, PostgreSQL, cloud resumen |
| T-804 | [x] | Diagrama ML pipeline | [ML-Pipeline-Diagram.md](Architecture/ML-Pipeline-Diagram.md) | Train → serialize → infer: offline, artefactos, runtime, endpoints |
| T-805 | [x] | Diagrama ER | [ER-Diagram.md](Architecture/ER-Diagram.md) | Mermaid ER: tablas MVP, cardinalidades, flujos persistencia, opcionales |
| T-806 | [x] | Diagrama Docker | [Deployment-Diagram.md](Architecture/Deployment-Diagram.md) | docker-compose dev, Dockerfile, cloud Supabase+Render+Vercel, CI/CD |
| T-807 | [x] | Flujo frontend | [Frontend-Navigation.md](Architecture/Frontend-Navigation.md) | Rutas React Router, sidebar, RBAC, flujo clínico, demo /demo |
| T-808 | [x] | Screenshots | [figures/screenshots](figures/screenshots/README.md) | 8 capturas Playwright: dashboard, SHAP, simulación, analytics + splash/demo |
| T-809 | [x] | Memoria TFM | [Memoria-TFM.md](Thesis/Memoria-TFM.md) | Capítulos metodología, resultados, discusión, conclusiones (RAC-010) |
| T-810 | [x] | Argumentario defensa | [Argumentario-Defensa.md](Thesis/Argumentario-Defensa.md) | Guion 8–10 min, FAQ tribunal, plan B, checklist; ensayo Phase-10 |

---

# FASE 9 — Demo

**Progreso:** 6 / 6 (100%)

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-901 | [x] | Seed estable | [DB §10](Database/Database.md#10-seed-data-demo--tfm) | `Verifica seeds demo para defensa.` |
| T-902 | [x] | Modelo versionado | [EP-9](Execution%20Plan/ExecutionPlan.md#phase-9--final-demo-preparation) | `Fijar versión modelo sin variabilidad.` |
| T-903 | [x] | Ensayo demo | [MVP §17](Requirements/Requirements.md#17-mvp-real-recomendado) · [Phase-10](Testing/Manual/Phase-10-Demo-Playbook.md) | `Ejecutar MT-P10-DEMO-001 con guion Demo-Playbook-Plan (T-907 escenarios + T-908 anim cuando esté).` |
| T-904 | [x] | Docker one-command | [RDO-001](Requirements/Requirements.md#rdo-001) | `docker compose up funciona de un comando.` |
| T-905 | [x] | Backup media | [RAC-001](Requirements/Requirements.md#rac-001) | `Guardar screenshots y vídeo demo.` |
| T-906 | [x] | Estabilidad | [KPIs §15](Requirements/Requirements.md#15-kpis-de-éxito) | `Sin errores críticos en flujo demo.` |

---

# FASE 9b — Demo WOW (TFM)

**Progreso:** 9 / 9 (100%) · **Plan:** [Demo-Playbook-Plan.md](Demo/Demo-Playbook-Plan.md) · **Manual:** [Phase-10-Demo-Playbook](Testing/Manual/Phase-10-Demo-Playbook.md)

Mejoras visuales y narrativas para defensa (sin backend ni ML). Implementar **T-907 antes que T-908**.

## US-044 — Clinical demo playbook (T-907)

**Como** clínico en demo, **quiero** cargar casos sintéticos predefinidos, **para** seguir una narrativa clínica sin rellenar el formulario a mano.

**Prompt:** `Implementa T-907 según docs/Demo/Demo-Playbook-Plan.md: clinicalDemoScenarios.ts, ClinicalDemoScenarioPanel, integración EvaluationPage. Skill: frontend + ui-ux.`

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-907-01 | [x] | Datos escenarios | [Plan § escenarios](Demo/Demo-Playbook-Plan.md#escenarios-propuestos-validar-scores-al-implementar) | `Crea clinicalDemoScenarios.ts con 4 casos tipados + tests unitarios payload.` |
| T-907-02 | [x] | Panel UI tarjetas | [RF-020](Requirements/Requirements.md#rf-020--formulario-clínico) · [RUX-001](Requirements/Requirements.md#rux-001) | `ClinicalDemoScenarioPanel: cards, badges riesgo, vignette EN.` |
| T-907-03 | [x] | Integración formulario | [UC-020](Use%20Cases/Use%20Cases.md#uc-020--enter-clinical-variables) | `EvaluationPage + ClinicalEvaluationForm: prefill on scenario select.` |
| T-907-04 | [x] | Tests vitest | [RTS-020](Requirements/Requirements.md#rts-020) | `EvaluationPage + scenario panel tests; sin regresión formulario.` |
| T-907-05 | [x] | Guion defensa | [T-810](#fase-8--tfm) · [T-903](#fase-9--demo) | `Actualizar guion en Demo-Playbook-Plan; cerrar manual Phase-10 escenarios.` |

## US-045 — Simulation risk animation (T-908)

**Como** clínico, **quiero** ver el gauge animarse al recalcular simulación, **para** percibir el impacto del cambio al instante.

**Prompt:** `Implementa T-908 según Demo-Playbook-Plan.md: animación RiskGaugeChart, wiring SimulationPage, prefers-reduced-motion. Skill: frontend + ui-ux.`

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-908-01 | [x] | Animación RiskGaugeChart | [RF-043](Requirements/Requirements.md#rf-043--visualización-impacto) | `Arc + count-up; props animateFromPercent; duration ~800ms ease-out.` |
| T-908-02 | [x] | Wiring simulación | [UC-043](Use%20Cases/Use%20Cases.md#uc-043--compare-original-vs-simulation) | `SimulationPage + SimulationComparisonPanel pasan from/to al recálculo.` |
| T-908-03 | [x] | Accesibilidad motion | [RUX-020](Requirements/Requirements.md#rux-020) | `prefers-reduced-motion: sin animación; valor final directo.` |
| T-908-04 | [x] | Tests vitest | [RTS-020](Requirements/Requirements.md#rts-020) | `RiskGaugeChart + SimulationPage; dark mode sin regresión.` |

### US-044 · US-045 (resumen)

| US | ✓ | Título | UC | RF |
|---|---|---|---|---|
| [US-044](#us-044--clinical-demo-playbook-t-907) | [x] | Demo playbook clínico | UC-020 | RF-020, RF-040, RUX-001 |
| [US-045](#us-045--simulation-risk-animation-t-908) | [x] | Animación riesgo simulación | UC-043 | RF-041–043, RUX-001 |

---

# BACKLOG OPCIONAL

[Requirements §18](Requirements/Requirements.md#18-features-opcionales) · **Plan maestro:** [Optional-Backlog-Plan.md](Optional%20Features/Optional-Backlog-Plan.md)

| ID | ✓ | Tarea | Docs |
|---|---|---|---|
| T-X01 | [x] | UI admin usuarios | [RF-070](Requirements/Requirements.md#rf-070--gestión-usuarios) · [UC-070](Use%20Cases/Use%20Cases.md#uc-070--manage-users) |
| T-X02 | [x] | Settings | [RF-071](Requirements/Requirements.md#rf-071--gestión-roles) · [UC-071](Use%20Cases/Use%20Cases.md#uc-071--configure-system-settings) |
| T-X03 | [x] | Dark mode | [US-043](#us-043--dark-mode) · [Design dark](Design/design-system.dark.md) · [Plan](Optional%20Features/Optional-Backlog-Plan.md#t-x03--dark-mode) |
| T-X04 | [x] | Export PDF | [UC-063](Use%20Cases/Use%20Cases.md#uc-063--export-analytics-optional) |
| T-X05 | [x] | Support UI | [US-040](#us-040) · [RF-072–073](Requirements/Requirements.md#59-soporte-opcional--18) · [UC-064–065](Use%20Cases/Use%20Cases.md#uc-064--access-support-center) |
| T-X06 | [x] | Audit avanzado | [US-041](#us-041) · [RF-074–075](Requirements/Requirements.md#510-auditoría-opcional--18) · [UC-081](Use%20Cases/Use%20Cases.md#uc-081--persist-audit-logs) |
| T-X07 | [x] | Multi-model | [US-042](#us-042) · [RF-076–077](Requirements/Requirements.md#511-comparación-de-modelos-ml-opcional--18) · [UC-084](Use%20Cases/Use%20Cases.md#uc-084--view-ml-model-comparison-optional) |
| T-X08 | [x] | Cloud deploy (UC-124) | [Deployment](Deployment/Deployment.md) · [UC-124](Use%20Cases/Use%20Cases.md#uc-124--cloud-deployment) | Supabase + Render + Vercel live |

---

# FASE X-b — Dark mode (T-X03)

**Progreso:** 8 / 8 (100%) · **User story:** [US-043](#us-043--dark-mode) · **Manual:** [Phase-08-Dark-Mode](Testing/Manual/Phase-08-Dark-Mode.md) · **Audit:** [dark-mode-token-audit](Design/dark-mode-token-audit.md) · **P0 pass:** [dark-mode-p0-pass](Design/dark-mode-p0-pass.md)

**Prompt:** `Implementa T-X03 dark mode según Optional-Backlog-Plan.md y design-system.dark.md: CSS variables, ThemeProvider, Settings Appearance. Skill: frontend + ui-ux.`

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-X03-01 | [x] | Auditoría tokens | [Audit](Design/dark-mode-token-audit.md) | `Lista hex hardcodeados en frontend/src; matriz light vs dark.` |
| T-X03-02 | [x] | CSS variables dual theme | [Audit](Design/dark-mode-token-audit.md) | `index.css :root + .dark desde design-system.dark.md.` |
| T-X03-03 | [x] | Refactor Tailwind | [Audit](Design/dark-mode-token-audit.md) | `tailwind.config.js lee CSS vars; quita hex light fijos.` |
| T-X03-04 | [x] | ThemeProvider | [RF-078](Optional%20Features/Optional-Backlog-Plan.md#t-x03--dark-mode) | `localStorage + system pref + class en html; anti-FOUC.` |
| T-X03-05 | [x] | Appearance panel | [UC-086](Optional%20Features/Optional-Backlog-Plan.md#us-043--dark-mode-propuesta) | `Settings → Appearance: Light / Dark / System.` |
| T-X03-06 | [x] | Charts dark | [Audit](Design/dark-mode-token-audit.md) | `recharts.ts + gauges + SHAP theme-aware.` |
| T-X03-07 | [x] | Pasada visual P0 | [P0 pass](Design/dark-mode-p0-pass.md) | `Login, dashboard, evaluation, analytics, simulation, history.` |
| T-X03-08 | [x] | Tests RTS-043 | [Testing](Testing/Testing.md) | `vitest theme + manual Phase-08-Dark-Mode P0.` |

## US-043 — Dark mode

**Como** usuario autenticado, **quiero** elegir tema claro u oscuro, **para** trabajar cómodo en distintos entornos.

| Criterio | Verificación |
|---|---|
| Selector en Settings | T-X03-05 ✓ |
| Persistencia | T-X03-04 ✓ + manual MT-P08-THEME-001 |
| Sin regresión light | T-X03-07 ✓ + `darkModeP0.test` + manual MT-P08-REG-001 |
| Charts legibles | T-X03-06 ✓ + manual MT-P08-CHART-001 |

---

# FASE X — Backlog opcional T-X05–T-X07

**Progreso:** 22 / 22 (100%) · **Orden:** T-X05 → T-X06 → T-X07 · **T-X05:** cerrado (US-040) · **T-X06:** cerrado (US-041) · **T-X07:** cerrado (US-042)

Implementar **una feature a la vez**. Cada bloque cierra su user story y manual Phase-07.

## US-040 — Support center

**Prompt:** `Implementa T-X05 Support UI según Optional-Backlog-Plan.md y mockup support/reference.html. Skill: frontend + ui-ux.`

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-X05-01 | [x] | Contenido KB estático | [RF-072](Requirements/Requirements.md#rf-072--centro-de-soporte) | `Crea supportKb.ts con 4 categorías FAQ en inglés.` |
| T-X05-02 | [x] | SupportPage | [RFW-024](Requirements/Requirements.md#rfw-024) · [mockup](Design/screens/support/reference.html) | `Página /support con hero, grid KB, layout design system.` |
| T-X05-03 | [x] | Búsqueda client-side | [UC-064](Use%20Cases/Use%20Cases.md#uc-064--access-support-center) | `Input búsqueda filtra categorías por título/descripción.` |
| T-X05-04 | [x] | Email desde settings | [RF-073](Requirements/Requirements.md#rf-073--contacto-y-ticket-de-soporte) | `Lee support_contact_email vía GET /admin/settings o contexto.` |
| T-X05-05 | [x] | Formulario mailto | [UC-065](Use%20Cases/Use%20Cases.md#uc-065--submit-support-ticket) | `Submit ticket abre mailto con categoría, prioridad, body.` |
| T-X05-06 | [x] | Ruta + sidebar | [RF-012](Requirements/Requirements.md#rf-012--navegación-lateral) | `Añade /support en router y enlace sidebar (todos los roles).` |
| T-X05-07 | [x] | Tests RTS-040 | [Testing](Testing/Testing.md#3-requisitos-de-testing-traceability) | `Vitest SupportPage + manual Phase-07-Support-UI.` |

## US-041 — Audit trail

**Prompt:** `Implementa T-X06 audit avanzado: migración audit_logs, AuditService, GET /admin/audit-logs, pestaña Settings. Skill: backend + database + frontend.`

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-X06-01 | [x] | Migración audit_logs | [Database §4.8](Database/Database.md#48-audit_logs-opcional--t-x06) | `Alembic: tabla audit_logs + índices.` |
| T-X06-02 | [x] | Modelo + repository | [RDB-001](Requirements/Requirements.md#rdb-001) | `AuditLog SQLAlchemy + AuditLogRepository.` |
| T-X06-03 | [x] | AuditService | [RF-074](Requirements/Requirements.md#rf-074--registro-de-auditoría) · [RNF-053](Requirements/Requirements.md#rnf-053) | `record() sin PHI; action_types v1 del plan.` |
| T-X06-04 | [x] | Hooks en routers | [UC-081](Use%20Cases/Use%20Cases.md#uc-081--persist-audit-logs) | `Registrar login, predict, simulate, admin.*.` |
| T-X06-05 | [x] | GET /admin/audit-logs | [RBE-016](Requirements/Requirements.md#rbe-016) · [RF-075](Requirements/Requirements.md#rf-075--consulta-de-auditoría) | `Filtros fecha, action_type, user_id, paginación.` |
| T-X06-06 | [x] | AuditLogsPanel UI | [RFW-025](Requirements/Requirements.md#rfw-025) · [UC-085](Use%20Cases/Use%20Cases.md#uc-085--query-audit-logs-optional) | `Pestaña Audit en Settings, solo admin.` |
| T-X06-07 | [x] | Tests RTS-041 | [Testing](Testing/Testing.md) | `pytest test_audit_logs.py: write + query + 403.` |
| T-X06-08 | [x] | Manual Phase-07 | [Manual](Testing/Manual/Phase-07-Audit-Logs.md) | `Ejecutar checklist P0 audit.` |

## US-042 — ML model comparison

**Prompt:** `Implementa T-X07 multi-model: GET /ml/models/comparison leyendo artefactos ML offline, panel Models en Settings. Skill: backend + ml + frontend.`

| ID | ✓ | Tarea | Docs | Pedir a la IA |
|---|---|---|---|---|
| T-X07-01 | [x] | ML comparison service | [RIA-040](Requirements/Requirements.md#ria-040) | `Lee baseline_comparison.json, xgboost_evaluation, manifest.` |
| T-X07-02 | [x] | GET /ml/models/comparison | [RBE-017](Requirements/Requirements.md#rbe-017) · [RF-077](Requirements/Requirements.md#rf-077--api-de-comparación-ml) | `Endpoint JSON; permiso analyst/admin.` |
| T-X07-03 | [x] | Schemas Pydantic | [RF-076](Requirements/Requirements.md#rf-076--visualizar-comparación-de-modelos) | `ModelComparisonResponse con métricas por modelo.` |
| T-X07-04 | [x] | ModelComparisonPanel | [RFW-026](Requirements/Requirements.md#rfw-026) · [UC-084](Use%20Cases/Use%20Cases.md#uc-084--view-ml-model-comparison-optional) | `Tabla métricas + badge production model.` |
| T-X07-05 | [x] | Chart barras recall | [RIA-041](Requirements/Requirements.md#ria-041) | `Recharts comparativa recall (y opcional F1/AUC).` |
| T-X07-06 | [x] | Settings tab Models | [RF-012](Requirements/Requirements.md#rf-012--navegación-lateral) | `Pestaña Models en Settings; RBAC analyst/admin.` |
| T-X07-07 | [x] | Tests RTS-042 | [Testing](Testing/Testing.md) | `pytest API + vitest panel + manual Phase-07-ML.` |

### US-040 · US-041 · US-042 · US-043 (resumen)

| US | ✓ | Título | UC | RF |
|---|---|---|---|---|
| [US-043](#us-043--dark-mode) | [x] | Dark mode | UC-086 (prop.) | RF-078 (prop.), RUX-012 (prop.) |
| [US-040](#us-040) | [x] | Support center | UC-064–065 | RF-072–073 |
| [US-041](#us-041) | [x] | Audit trail | UC-081, UC-085 | RF-074–075 |
| [US-042](#us-042) | [x] | ML model comparison | UC-084 | RF-076–077, RIA-040–041 |
| [US-044](#us-044--clinical-demo-playbook-t-907) | [x] | Demo playbook clínico | UC-020 | RF-020, RF-040, RUX-001 |
| [US-045](#us-045--simulation-risk-animation-t-908) | [x] | Animación riesgo simulación | UC-043 | RF-041–043, RUX-001 |

---

# Matriz MVP (enlaces)

| Bloque | Tareas | Docs |
|---|---|---|
| Auth | T-120–125, T-408–411 | [RF-001–004](Requirements/Requirements.md#51-autenticación) |
| Dashboard | T-501–504 | [RF-010–012](Requirements/Requirements.md#52-dashboard-principal) |
| Predicción | T-510–516 | [RF-020–023](Requirements/Requirements.md#53-evaluación-clínica) |
| SHAP | T-210, T-514–515 | [RF-030–032](Requirements/Requirements.md#54-explicabilidad-ia) |
| Simulación | T-520–524 | [RF-040–043](Requirements/Requirements.md#55-simulación-clínica) |
| Historial | T-601–603 | [RF-050–052](Requirements/Requirements.md#56-historial-clínico) |
| Analytics | T-605–609 | [RF-060–062](Requirements/Requirements.md#57-analytics) |
| Settings (placeholder) | T-610 | [RF-012](Requirements/Requirements.md#rf-012--navegación-lateral) |
| API | T-304–307 | [RBE-010–014](Requirements/Requirements.md#92-endpoints) |
| DB | T-110–119 | [Database](Database/Database.md) |
| ML | T-201–210 | [RIA](Requirements/Requirements.md#7-requerimientos-ia--machine-learning) |
| Tests | T-704–708 | [Testing](Testing/Testing.md) |
| Docker | T-012–013, T-709 | [DevOps §11](Requirements/Requirements.md#11-requerimientos-devops) |
| Demo WOW | T-907–908 | [Demo-Playbook-Plan](Demo/Demo-Playbook-Plan.md) |
| Public demo | UC-066 | [Public-Demo-Playground](Demo/Public-Demo-Playground.md) · [Sequence §6](Architecture/Sequence-Diagrams.md#6-public-explore-demo-uc-066) |
| Fase 8 secuencias | T-811 | [Sequence-Diagrams](Architecture/Sequence-Diagrams.md) |
| Fase 8 arquitectura | T-803 | [System-Architecture](Architecture/System-Architecture.md) |
| Fase 8 ML pipeline | T-804 | [ML-Pipeline-Diagram](Architecture/ML-Pipeline-Diagram.md) |
| Fase 8 ER | T-805 | [ER-Diagram](Architecture/ER-Diagram.md) |
| Fase 8 despliegue | T-806 | [Deployment-Diagram](Architecture/Deployment-Diagram.md) |
| Fase 8 frontend nav | T-807 | [Frontend-Navigation](Architecture/Frontend-Navigation.md) |
| Fase 8 screenshots | T-808 | [figures/screenshots](figures/screenshots/README.md) |
| Fase 8 memoria | T-809 | [Memoria-TFM](Thesis/Memoria-TFM.md) |
| Fase 8 defensa | T-810 | [Argumentario-Defensa](Thesis/Argumentario-Defensa.md) |

---

# Cómo usar este documento

1. Abre el **enlace Docs** de la tarea para leer el requisito completo.
2. Copia el texto de **Pedir a la IA** en Cursor (ajusta si hace falta).
3. Carga el **skill** indicado en la cabecera de fase.
4. Marca `[x]` al terminar y actualiza **Resumen de progreso**.
5. Si cierras una **user story (US-xxx)**, genera tests manuales en `docs/Testing/Manual/` (ver `AGENTS.md` → Testing Rules → Cierre de user story).

---

# Historial

| Fecha | Cambio |
|---|---|
| 2026-06-10 | Creación inicial — 128 tareas MVP |
| 2026-06-10 | Enlaces, índices RF/UC, columna prompts IA |
| 2026-06-11 | Actualizado resumen: 34/134 MVP (25%). Fase 0 completa; Fase 1 al 73% (T-117–119) |
| 2026-06-11 | T-120: AuthService bcrypt + UserRepository.get_by_email |
| 2026-06-11 | T-121: POST /auth/login con JWT + tests API |
| 2026-06-11 | T-122: get_current_user + GET /auth/me + validación JWT |
| 2026-06-11 | T-123: require_roles() + GET /auth/admin/ping |
| 2026-06-11 | T-124: POST /auth/logout (JWT stateless, cliente descarta token) |
| 2026-06-11 | T-126: test_auth.py consolidado + fixtures auth en conftest |
| 2026-06-11 | Movido a `docs/TaskTracker.md`; eliminada carpeta `docs/Task Tracker/` |
| 2026-06-11 | US-001: frontend login → dashboard (T-401, T-403–405, T-408–411). MVP 49/134 (37%) |
| 2026-06-11 | US-002: logout seguro frontend (UC-002, RF-002). MVP 50/134 (37%) |
| 2026-06-11 | US-003: RoleRoute + navegación por rol (UC-003, RF-004). MVP 52/134 (39%) |
| 2026-06-11 | T-201: dataset Diabetes 130-US documentado + script descarga. MVP 53/134 (40%) |
| 2026-06-11 | T-202: notebook EDA `notebooks/diabetes130_eda.ipynb`. MVP 54/134 (40%) |
| 2026-06-11 | T-203: `ml/preprocessing/` pipeline reproducible train/inference + tests. MVP 55/134 (41%) |
| 2026-06-11 | T-204: feature engineering (`features.py`) — 4 derivadas + set MVP 19 features. MVP 56/134 (42%) |
| 2026-06-11 | T-205: baseline Logistic Regression + métricas test split + script entrenamiento. MVP 57/134 (43%) |
| 2026-06-11 | T-206: Random Forest + comparación baselines (`baseline_comparison.json`). MVP 58/134 (43%) |
| 2026-06-11 | T-207: evaluación formal métricas + threshold recall + `evaluation_report.json`. MVP 59/134 (44%) |
| 2026-06-11 | T-208: selección modelo final LR + `final_model_selection.json` + `models/final/`. MVP 60/134 (45%) |
| 2026-06-11 | T-209: serialización producción `models/model.pkl`, `preprocessor.pkl`, `model_manifest.json`. MVP 61/134 (46%) |
| 2026-06-11 | T-210: SHAP LinearExplainer + resumen clínico en `ml/explainability/`. MVP 62/134 (46%) |
| 2026-06-11 | T-211: suite RTS-010 en `ml/tests/` (load, inference, métricas, SHAP). MVP 63/134 (47%) |
| 2026-06-11 | T-212: `docs/ML/ML-Pipeline.md` — metodología, dataset, modelos, resultados, conclusiones (RAC-010). MVP 64/134 (48%) |
| 2026-06-11 | T-213: XGBoost opcional + `models/xgboost_evaluation.json`; LR sigue modelo producción. MVP 65/134 (49%) |
| 2026-06-11 | T-214: gráficos EDA exportados en `docs/figures/eda/` + script reproducible. Fase 2 completa. MVP 67/134 (50%) |
| 2026-06-11 | US-010/US-011: `POST /predict` con ML real + SHAP + persistencia (T-301–304, T-308, T-310, T-312). Fase 3 6/14. MVP 75/134 (56%) |
| 2026-06-11 | Fase 4 completa (T-401–414): shadcn/ui, splash, UX spinner/alert, layout responsive, Recharts en dashboard. MVP 80/134 (60%) |
| 2026-06-21 | Revisión Fase 2 + predict: tests manuales Phase-02/03, `shap_background.npy`, docs ML/Testing/README actualizados |
| 2026-06-23 | Fase 3 API completa: `/simulate`, `/history`, `/analytics`, exception handlers (T-305–311). Lint Ruff+ESLint. Docs Testing/Manual/Database/README sincronizados |
| 2026-06-11 | **US-021** simulación UI (T-520–523): panel, recálculo API, comparación, sesión persistente. Manual Phase-05-Simulation. MVP 91/134 (68%). T-524 pendiente (US-033 / RF-043) |
| 2026-06-11 | Fixes simulación UI: spinner stuck (`useMemo` contexto + contador in-flight), F5 restaura borrador (`markSimulationForceReset`). Vitest frontend **92** tests. Manuales Phase-04/05 simulación sincronizados |
| 2026-06-11 | **US-023** analytics UI (T-605–609): `AnalyticsPage`, KPIs, trend + risk charts, filtros fecha, `getAnalytics`. Manual Phase-06-Analytics. Vitest **126**. MVP 98/134 (73%). T-602–603, T-610 pendientes |
| 2026-06-11 | **T-501** dashboard KPI cards: `GET /dashboard`, `DashboardKpiCards`, datos reales RF-011. MVP 99/134 (74%). T-502–504 pendientes |
| 2026-06-11 | **T-502** actividad reciente: alertas alto riesgo + evaluaciones recientes en dashboard (UC-010). MVP 100/134 (75%). T-503–504 pendientes |
| 2026-06-11 | **T-503** chart distribución riesgo en dashboard con Recharts + datos `GET /dashboard` (UC-011). MVP 101/134 (75%). T-504 pendiente |
| 2026-06-11 | **T-504 / US-030** dashboard optimizado RNF-002: snapshot SQL, lazy chart, test bajo 2s. MVP 102/134 (76%). T-524 pendiente |
| 2026-06-11 | **T-524 / US-033** impacto visual simulación: waterfall `SimulationImpactChart`, highlight campos top SHAP. Fase 5 completa. MVP 103/134 (77%) |
| 2026-06-11 | **T-X01** UI admin usuarios: `GET/POST/PATCH /admin/users`, `UserManagementPanel` en Settings (UC-070) |
| 2026-06-11 | **T-704** `test_auth.py` RTS-001: 27 tests login/JWT/roles/logout/audit (UC-001–003) |
| 2026-06-11 | **T-702** errores UC-091: `api_errors.py`, handlers JSON + logging 4xx, `apiErrors.ts` centralizado. MVP 108/134 (81%) |
| 2026-06-11 | **T-701** UI polish: `PageShell`/`PageHeader`, tokens tipografía, JetBrains Mono, márgenes 40px desktop. MVP 107/134 (80%) |
| 2026-06-11 | **T-610** settings placeholder: `SettingsPage` admin-only, nav + RBAC. Fase 6 completa. MVP 106/134 (79%) |
| 2026-06-11 | **T-603** detalle historial: `GET /history/{id}`, `HistoryDetailPage` inputs + SHAP + simulaciones. MVP 105/134 (78%) |
| 2026-06-11 | **T-X02** settings avanzado: políticas de rol (RF-071), configuración sistema (UC-071), permisos en login + RBAC API/UI |
| 2026-06-11 | **T-X04** export PDF analytics: `GET /analytics/export.pdf`, botón en `AnalyticsPage` (UC-063) |
| 2026-06-11 | **Plan T-X05–T-X07:** RF-072–077, UC-064–066/084–085, US-040–042, Fase X (22 tareas), RTS-040–042, manuales Phase-07 |
| 2026-06-11 | **T-X05 / US-040** Support UI completo: KB, búsqueda, contacto API, ticket mailto, sidebar, RTS-040 (9 archivos test) |
| 2026-06-11 | **T-703** performance RNF-001/002: middleware `X-Process-Time-Ms`, analytics SQL 2 queries, lazy Recharts, manualChunks, tests perf |
| 2026-06-11 | **T-X03 / US-043** dark mode cerrado: P0 visual pass, RTS-043 suite, 8/8 tareas |
| 2026-06-11 | **T-X03-06** charts theme-aware: `chartTheme.ts`, `useChartColors`, gauges, Recharts, Toast icons |
| 2026-06-11 | **T-X03-05** Appearance panel Settings + nav settings para todos los roles autenticados |
| 2026-06-11 | **T-X03-04** ThemeProvider: `useTheme`, localStorage, system pref, anti-FOUC script, tests RTS-043 |
| 2026-06-11 | **T-X03-03** Tailwind refactor: MedScope tokens vía `rgb(var(--color-*))`, sin hex fijos |
| 2026-06-11 | **T-X03-02** CSS variables dual theme: `index.css` `:root` + `.dark`, `riskColors.js` dark palette |
| 2026-06-11 | **T-X03-01** auditoría tokens dark mode: `dark-mode-token-audit.md` (matriz light/dark, inventario hex) |
| 2026-06-11 | **Plan T-X03** dark mode: US-043, T-X03-01…08, RTS-043, Phase-08 manual, Optional-Backlog-Plan |
| 2026-06-30 | **Despliegue cloud UC-124** completado: Supabase + Render (`medscope-ai-q8tg`) + Vercel (`medscope-ai-delta`). PRs #16–#19. T-713–718 |
| 2026-06-30 | Docs Deployment/Environment/README/TaskTracker actualizados con URLs y troubleshooting de prod |
| 2026-07-01 | **T-908 cerrado (US-045):** animación gauge simulación, prefers-reduced-motion, wiring SimulationPage, vitest |
| 2026-07-01 | **T-907 cerrado (US-044):** escenarios clínicos, panel, formulario, vitest, guion defensa + manual Phase-10 SCEN |
| 2026-07-02 | **T-803:** [System-Architecture.md](Architecture/System-Architecture.md) — diagramas Mermaid monorepo, capas backend, flujos ML/BD |
| 2026-07-02 | **Fase 8 docs:** T-801a/T-802a/T-811 — UC-066, RFW-027, Public-Demo-Playground, Sequence-Diagrams, General Description, AGENTS actualizados |
| 2026-07-02 | **T-804:** [ML-Pipeline-Diagram.md](Architecture/ML-Pipeline-Diagram.md) — diagramas Mermaid train → serialize → infer (offline, artefactos, runtime) |
| 2026-07-02 | **T-805:** [ER-Diagram.md](Architecture/ER-Diagram.md) — diagrama ER PostgreSQL MVP + flujos persistencia |
| 2026-07-02 | **T-806:** [Deployment-Diagram.md](Architecture/Deployment-Diagram.md) — docker-compose, cloud, CI/CD |
| 2026-07-02 | **T-807:** [Frontend-Navigation.md](Architecture/Frontend-Navigation.md) — rutas, sidebar, RBAC, flujos clínico y demo |
| 2026-07-02 | **T-808:** `docs/figures/screenshots/` — 8 capturas Playwright + `scripts/capture-thesis-screenshots.ps1` |
| 2026-07-02 | **T-809:** [Memoria-TFM.md](Thesis/Memoria-TFM.md) — borrador capítulos metodología y resultados (RAC-010) |
| 2026-07-02 | **T-810:** [Argumentario-Defensa.md](Thesis/Argumentario-Defensa.md) — guion defensa 8–10 min, FAQ, checklist · **Fase 8 completa** |
| 2026-06-11 | **T-901:** seeds demo estables — tests integración (`test_seeds.py`), script `scripts/verify_demo_seeds.py`, prod OK (4/4 login) |
| 2026-06-11 | **T-902:** modelo LR v1.0.0 fijado — `demo_golden_predictions.json`, checksums SHA-256 en manifest, tests + `scripts/verify_demo_model.py` |
| 2026-06-11 | **T-903:** ensayo MT-P10-DEMO-001 — `tests/e2e/demo-rehearsal.spec.ts` + `scripts/run-demo-rehearsal.ps1` (local 2/2 OK) |
| 2026-07-02 | **Auditoría backlog:** MVP 152/152 (100%); contadores Fase 8 y Fase X alineados; pendiente entrega Fundae (vídeo, URLs) |
| 2026-07-02 | **T-906:** estabilidad demo — `scripts/verify_demo_stability.py` + prod OK (health, seeds, golden, MVP API, frontend) |
| 2026-07-02 | **T-905:** backup media defensa — `scripts/backup_demo_media.py`, zip SHA-256 en `backups/`, tests `test_backup_media.py` |
| 2026-06-11 | **T-904:** Docker one-command — nginx DNS dinámico, `scripts/docker-up.ps1` (prepare + health wait), `scripts/verify-docker-stack.ps1` |
| 2026-07-02 | **Vídeo defensa:** [Guion-Video-Defensa.md](Thesis/Guion-Video-Defensa.md) + [Slides-Presentacion-Video.md](Thesis/Slides-Presentacion-Video.md) |
| 2026-07-02 | **Entrega Fundae:** [Entrega-TFM-Fundae.md](Thesis/Entrega-TFM-Fundae.md) — auditoría requisitos BIG School + README actualizado |
