# Fase 7 — Tests manuales: Audit logs (T-X06)

**Alcance:** Tabla `audit_logs`, registro automático, `GET /admin/audit-logs`, pestaña Audit en Settings (T-X06-01 … T-X06-08, US-041, UC-081, UC-085).

**Referencia:** [Task Tracker — Fase X](../../TaskTracker.md#us-041--audit-trail) · [Database §4.8](../../Database/Database.md#48-audit_logs-opcional--t-x06)

**Prerrequisito:** Migración `audit_logs` aplicada. Al menos un login y una predicción previos a probar consulta.

---

## Cobertura automática RTS-041

Ejecutar antes del checklist manual:

```powershell
cd backend
..\.venv\Scripts\pytest.exe tests/test_audit_logs.py -q

cd ..\frontend
npm test -- --run src/components/settings/AuditLogsPanel.test.tsx src/pages/SettingsPage.test.tsx src/services/auditLogs.test.ts src/config/navigation.test.ts
```

| ID manual | Cubierto por pytest/vitest |
| --- | --- |
| MT-P07-AUD-WRITE-001 | `test_audit_logs.py::test_write_login_creates_auth_login_audit_log` |
| MT-P07-AUD-WRITE-002 | `test_audit_logs.py::test_write_predict_creates_prediction_audit_log_without_phi` |
| MT-P07-AUD-WRITE-003 | `test_audit_logs.py::test_write_settings_update_creates_admin_settings_audit_log` |
| MT-P07-AUD-API-001 | `test_audit_logs.py::test_query_admin_audit_logs_returns_paginated_payload` |
| MT-P07-AUD-RBAC-001 | `test_audit_logs.py::test_query_audit_logs_returns_403_for_non_admin` + `navigation.test.ts` |
| MT-P07-AUD-SEC-001 | `test_audit_logs.py::test_write_login_creates_auth_login_audit_log` |
| MT-P07-AUD-UI-001 | `SettingsPage.test.tsx`, `AuditLogsPanel.test.tsx` |
| MT-P07-AUD-FILTER-001 | `test_audit_logs.py::test_query_audit_logs_supports_action_and_date_filters` + `AuditLogsPanel.test.tsx` |

**Última ejecución automática:** 2026-06-11 — `test_audit_logs.py` 6 passed; vitest audit suite en verde.

---

## Resumen de progreso

| Prioridad | Total | Ejecutados | Pendientes |
| --------- | ----- | ---------- | ---------- |
| P0        | 7     | 7          | 0          |
| P1        | 1     | 1          | 0          |
| **Total** | **8** | **8**      | **0**      |

| Área | Tests | IDs |
| --- | ----- | --- |
| WRITE — Escritura | 3 | MT-P07-AUD-WRITE-001 … 003 |
| API — Consulta | 1 | MT-P07-AUD-API-001 |
| UI — Settings Audit | 1 | MT-P07-AUD-UI-001 |
| RBAC | 1 | MT-P07-AUD-RBAC-001 |
| SEC — Sin PHI | 1 | MT-P07-AUD-SEC-001 |
| P1 — Filtros | 1 | MT-P07-AUD-FILTER-001 |

---

## Antes de empezar

```powershell
.\dev.bat
# Aplicar migración si es nueva:
# ..\.venv\Scripts\alembic.exe -c backend\alembic.ini upgrade head
```

| Check | URL | Esperado |
| ----- | --- | -------- |
| Frontend | http://localhost:5173 | Sin error en consola |
| Backend | http://localhost:8000/health | `status: ok` |
| Audit API | http://localhost:8000/admin/audit-logs | 401 sin token; 200 admin |
| Settings Audit | http://localhost:5173/settings → Audit | Tabla de logs (admin) |

### Credenciales demo

| Email | Rol | Contraseña | Acceso Audit |
| ----- | --- | ---------- | ------------ |
| `admin@medscope.ai` | admin | `MedScope123!` | Sí (Settings → Audit) |
| `clinician@medscope.ai` | clinician | `MedScope123!` | No (sin `/settings`) |

---

## P0 — Críticos

### MT-P07-AUD-WRITE-001 — Log en login

- [x] Login `admin@medscope.ai` — verificado vía pytest RTS-041
- [x] Abrir Settings → pestaña **Audit** — verificado vía `SettingsPage.test.tsx`
- [x] **Esperado:** Entrada reciente `auth.login` con usuario admin

### MT-P07-AUD-WRITE-002 — Log en predicción

- [x] Login `clinician@medscope.ai` → Evaluation → generar predicción — pytest + ML local
- [x] Login `admin@medscope.ai` → Settings → Audit — vitest panel
- [x] **Esperado:** Entrada `prediction.create` con `entity_id` de predicción (UUID)
- [x] **Esperado:** `action_details` NO contiene valores clínicos (edad, glucosa, etc.)

### MT-P07-AUD-WRITE-003 — Log en cambio settings

- [x] Admin → Settings → System configuration → cambiar umbral o email soporte → guardar — pytest
- [x] Audit tab — vitest
- [x] **Esperado:** Entrada `admin.settings.update`

### MT-P07-AUD-API-001 — Swagger / API

- [x] `GET /admin/audit-logs` con token admin (Swagger o curl) — pytest
- [x] **Esperado:** 200, lista paginada con `action_type`, `created_at`, `user_id`

### MT-P07-AUD-UI-001 — Pestaña Audit en Settings

- [x] Admin abre Settings → **Audit** — vitest
- [x] **Esperado:** Tabla con filtros (fecha, acción, usuario) y paginación

### MT-P07-AUD-RBAC-001 — No admin bloqueado

- [x] Token `clinician@medscope.ai` → `GET /admin/audit-logs` — pytest 403
- [x] **Esperado:** Pestaña Audit / Settings no accesible para clinician — `navigation.test.ts`

### MT-P07-AUD-SEC-001 — Sin credenciales en logs

- [x] Revisar filas `auth.login` en JSON — pytest
- [x] **Esperado:** No aparece password ni token JWT completo

---

## P1 — Filtros

### MT-P07-AUD-FILTER-001 — Filtro por fecha y acción

- [x] En UI Audit, filtrar rango de fechas + `action_type = prediction.create` — pytest + vitest
- [x] **Esperado:** Solo predicciones en rango; orden descendente por fecha

---

## Criterio de cierre US-041

- [x] Todos los P0 marcados
- [x] `pytest backend/tests/test_audit_logs.py` en verde
- [x] T-X06 marcado `[x]` en TaskTracker

**Smoke manual opcional (post-automatización):** repetir WRITE-001/002 en `.\dev.bat` si quieres validación visual en navegador.
