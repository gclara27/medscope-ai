# MedScope AI — Plan de trabajo: backlog opcional T-X05–T-X07

Documento maestro de planificación para las tres features opcionales acordadas.
**No implementa código** — define requisitos, casos de uso, user stories, tareas y tests para implementar **una a una**.

---

## Documentos relacionados

| Documento | Rol |
|---|---|
| [Requirements.md](../Requirements/Requirements.md) | RF-072–077, RIA-040–041, RBE-015–017, RNF-052–053 |
| [Use Cases.md](../Use%20Cases/Use%20Cases.md) | UC-064–066, UC-081 (ampliado), UC-084–085 |
| [TaskTracker.md](../TaskTracker.md) | Fase X — tareas T-X05-01 … T-X07-07 |
| [Database.md](../Database/Database.md) | `audit_logs`, índices, flujos |
| [Testing.md](../Testing/Testing.md) | RTS-040–042, manuales Phase-07 |
| [ExecutionPlan.md](../Execution%20Plan/ExecutionPlan.md) | Phase 6.5 |
| [screens/support/](../Design/screens/support/reference.html) | Mockup T-X05 |

---

## Objetivo

Completar tres capacidades **post-MVP** (Requirements §18) con trazabilidad de TFM:

| ID | Feature | Valor principal |
|---|---|---|
| **T-X05** | Support UI | UX enterprise — ayuda, FAQ, contacto |
| **T-X06** | Audit avanzado | Trazabilidad y gobernanza (UC-081) |
| **T-X07** | Multi-model | Narrativa ML — comparación LR / RF / XGBoost |

---

## Orden de implementación recomendado

```text
1. T-X05  Support UI      → solo frontend (+ lectura settings existente)
2. T-X06  Audit avanzado  → backend + migración + UI admin
3. T-X07  Multi-model     → API lectura artefactos ML + UI analyst/admin
```

**Rationale:** T-X05 es la más aislada y de menor riesgo. T-X06 prepara infraestructura de compliance antes de ampliar superficie ML. T-X07 reutiliza artefactos ya generados en Fase 2 (`baseline_comparison.json`, `xgboost_evaluation.json`, `model_manifest.json`).

---

## Matriz de trazabilidad

| Feature | User story | Requisitos | Casos de uso | Pantalla | API |
|---|---|---|---|---|---|
| T-X05 | US-040 | RF-072, RF-073, RFW-024 | UC-064, UC-065 | `/support` | — (mailto) |
| T-X06 | US-041 | RF-074, RF-075, RNF-052, RNF-053 | UC-081 | Settings → Audit | `GET /admin/audit-logs` |
| T-X07 | US-042 | RF-076, RF-077, RIA-040, RIA-041 | UC-084, UC-085 | Settings → Models | `GET /ml/models/comparison` |

---

## Alcance por feature

### T-X05 — Support UI

**In scope (obligatorio para cerrar T-X05):**

- Ruta `/support` accesible a **todos los usuarios autenticados**
- Enlace en sidebar (pie, junto a logout — ver mockup)
- Hero “Clinical Support Center”
- 4 tarjetas de knowledge base (contenido estático en inglés)
- Búsqueda client-side sobre títulos/descripciones FAQ
- Formulario “Submit a Ticket” → `mailto:` con `support_contact_email` de `system_settings` (T-X02)
- Tarjeta de contacto con email de soporte configurable

**Out of scope (stretch — documentar, no implementar en v1):**

- Backend de tickets persistentes
- Integración HL7 / EHR en KB
- Búsqueda server-side

**Dependencias:** T-X02 (`support_contact_email`), layout existente (`AppLayout`).

---

### T-X06 — Audit avanzado

**In scope:**

- Migración Alembic: tabla `audit_logs` (esquema Database.md §4.8)
- Modelo SQLAlchemy + `AuditLogRepository` + `AuditService`
- Registro automático en acciones críticas:

  | `action_type` | Trigger |
  |---|---|
  | `auth.login` | Login exitoso |
  | `auth.logout` | Logout |
  | `prediction.create` | `POST /predict` exitoso |
  | `simulation.create` | `POST /simulate` exitoso |
  | `admin.user.create` | `POST /admin/users` |
  | `admin.user.update` | `PATCH /admin/users/{id}` |
  | `admin.role.update` | `PATCH /admin/roles` |
  | `admin.settings.update` | `PATCH /admin/settings` |

- `GET /admin/audit-logs` — filtros: `date_from`, `date_to`, `action_type`, `user_id`, paginación
- Permiso: `admin` (o permiso `audit` en matriz de roles)
- UI: pestaña **Audit** en Settings (solo admin)
- **Sin PHI** en `action_details` — solo metadatos (IDs, tipos, timestamps)

**Out of scope (stretch):**

- Export CSV de audit logs
- Retención automática / purga
- Alertas en tiempo real

**Dependencias:** T-X02 (RBAC), Fase 1 (users).

---

### T-X07 — Multi-model comparison

**In scope (enfoque ligero — recomendado):**

- `GET /ml/models/comparison` — lectura de artefactos de entrenamiento:
  - `models/model_manifest.json` (modelo en producción)
  - `models/baseline_comparison.json` (`ml/training/constants.py` → `BASELINE_COMPARISON_PATH`)
  - `models/xgboost_evaluation.json` (si existe)
- Respuesta JSON: métricas por modelo (accuracy, recall, f1, roc_auc), ganador por recall, modelo activo
- Permiso: `analytics` o rol `analyst` + `admin`
- UI: pestaña **Models** en Settings o sección en Analytics — tabla + barras Recharts
- Texto clínico: “Production model” vs “evaluation candidates (offline)”

**Out of scope (stretch — T-X07b futuro):**

- Inferencia runtime con selector `model_id` en `POST /predict`
- SHAP comparativo multi-modelo en una sola evaluación
- Retraining desde UI

**Dependencias:** Fase 2 ML (T-206, T-213), `ml_registry`, T-X02 (settings muestra `model_version`).

---

## User stories

### US-040 — Access support center

**Como** usuario autenticado (cualquier rol),  
**quiero** consultar ayuda y contactar soporte desde la aplicación,  
**para** resolver dudas de uso sin abandonar la plataforma.

**Criterios de aceptación:**

1. Existe `/support` con layout consistente (design system).
2. KB muestra ≥4 categorías con descripción.
3. Búsqueda filtra categorías en cliente.
4. El email de contacto proviene de configuración sistema (fallback razonable si API falla).
5. Formulario ticket abre cliente de correo con asunto y cuerpo pre-rellenados.
6. Vitest: render, búsqueda, botón export/mailto.

**Tareas:** T-X05-01 … T-X05-07 · **Manual:** [Phase-07-Support-UI.md](../Testing/Manual/Phase-07-Support-UI.md)

---

### US-041 — Review audit trail

**Como** administrador,  
**quiero** consultar un registro de acciones críticas,  
**para** auditar uso del sistema y cambios de configuración.

**Criterios de aceptación:**

1. Tabla `audit_logs` migrada y poblada en acciones definidas.
2. `GET /admin/audit-logs` con auth admin y filtros.
3. UI lista logs con usuario, acción, entidad, fecha.
4. Roles no admin reciben 403.
5. `action_details` no contiene datos clínicos ni contraseñas.
6. pytest: creación de log en login + predict; filtros API.

**Tareas:** T-X06-01 … T-X06-08 · **Manual:** [Phase-07-Audit-Logs.md](../Testing/Manual/Phase-07-Audit-Logs.md)

---

### US-042 — Compare ML models

**Como** analista o administrador,  
**quiero** ver la comparación de métricas entre modelos evaluados offline,  
**para** entender por qué el modelo en producción fue seleccionado.

**Criterios de aceptación:**

1. API devuelve métricas LR, RF y XGBoost (cuando existan artefactos).
2. UI muestra modelo activo y tabla comparativa.
3. Gráfico de barras por métrica principal (recall prioritario).
4. Mensaje claro si faltan artefactos ML.
5. Clinician/nurse no acceden (403 o ruta oculta).
6. pytest + vitest en servicio y panel.

**Tareas:** T-X07-01 … T-X07-07 · **Manual:** [Phase-07-ML-Model-Comparison.md](../Testing/Manual/Phase-07-ML-Model-Comparison.md)

---

## Definition of Done (común)

Para marcar cada T-X0N como `[x]` en TaskTracker:

1. Código implementado según alcance **in scope**
2. Tests automáticos pasando (backend y/o frontend según feature)
3. Manual test Phase-07 correspondiente ejecutado (mínimo P0)
4. OpenAPI actualizado si hay endpoints nuevos
5. TaskTracker + changelog actualizados
6. Sin RF/UC/US en textos visibles de UI

---

## Estimación orientativa

| Feature | Tareas | Esfuerzo | Riesgo |
|---|---|---|---|
| T-X05 | 7 | 0.5–1 día | Bajo |
| T-X06 | 8 | 1.5–2 días | Medio |
| T-X07 | 7 | 1–1.5 días | Bajo–medio |

---

## Changelog

| Fecha | Cambio |
|---|---|
| 2026-06-11 | Creación plan T-X05–T-X07 con trazabilidad RF/UC/US/tareas/tests |
