# Fase 7 — Tests manuales: Support UI (T-X05)

**Alcance:** Pantalla `/support`, knowledge base, búsqueda, contacto y ticket mailto (T-X05-01 … T-X05-07, US-040, UC-064–065).

**Referencia:** [Task Tracker — Fase X](../../TaskTracker.md#fase-x--backlog-opcional-t-x05t-x07) · [support mockup](../../Design/screens/support/reference.html) · [Plan](../../Optional%20Features/Optional-Backlog-Plan.md)

**Prerrequisito:** Usuario autenticado. `support_contact_email` configurado en Settings (T-X02). Proxy Vite: solo `/support/contact` al backend (no `/support` completo).

---

## Cobertura automática RTS-040

Ejecutar antes del checklist manual:

```powershell
cd frontend
npm test -- --run src/lib/supportKb.test.ts src/lib/supportTicket.test.ts src/services/support.test.ts src/components/support/SupportKbSearch.test.tsx src/components/support/SupportTicketForm.test.tsx src/pages/SupportPage.test.tsx src/config/navigation.test.ts src/layouts/AppLayout.test.tsx

cd ..
.\.venv\Scripts\python.exe -m pytest backend\tests\test_support.py -q
```

| ID manual | Cubierto por vitest/pytest |
| --- | --- |
| MT-P07-SUP-KB-001 | `supportKb.test.ts`, `SupportPage.test.tsx` |
| MT-P07-SUP-SEARCH-001 | `supportKb.test.ts`, `SupportKbSearch.test.tsx`, `SupportPage.test.tsx` |
| MT-P07-SUP-TICKET-001 | `supportTicket.test.ts`, `SupportTicketForm.test.tsx`, `SupportPage.test.tsx` |
| MT-P07-SUP-RBAC-001 | `navigation.test.ts`, `test_support.py` (clinician + nurse) |
| MT-P07-SUP-NAV-001 | `AppLayout.test.tsx` (sidebar Support) |
| MT-P07-SUP-REG-001 | — (solo manual / E2E) |
| MT-P07-SUP-KB-002 | `support.test.ts`, `SupportPage.test.tsx` (parcial) |

---

## Resumen de progreso

| Prioridad | Total | Ejecutados | Pendientes |
| --------- | ----- | ---------- | ---------- |
| P0        | 5     | 0          | 5          |
| P1        | 2     | 0          | 2          |
| **Total** | **7** | **0**      | **7**      |

| Área | Tests | IDs |
| --- | ----- | --- |
| NAV — Navegación | 1 | MT-P07-SUP-NAV-001 |
| KB — Knowledge base | 2 | MT-P07-SUP-KB-001 … 002 |
| SEARCH — Búsqueda | 1 | MT-P07-SUP-SEARCH-001 |
| TICKET — Mailto | 1 | MT-P07-SUP-TICKET-001 |
| RBAC — Roles | 1 | MT-P07-SUP-RBAC-001 |
| P1 — Regresión | 1 | MT-P07-SUP-REG-001 |

---

## Antes de empezar

```powershell
.\dev.bat
```

| Check | URL | Esperado |
| ----- | --- | -------- |
| Frontend | http://localhost:5173 | Sin error en consola |
| Backend | http://localhost:8000/health | `status: ok` |
| Support page | http://localhost:5173/support | Clinical Support Center (con sesión) |
| Support API | http://localhost:8000/support/contact | 401 sin token; 200 con JWT |

### Credenciales demo

| Email | Rol | Contraseña | Acceso `/support` |
| ----- | --- | ---------- | ----------------- |
| `clinician@medscope.ai` | clinician | `MedScope123!` | Sí |
| `nurse@medscope.ai` | nurse | `MedScope123!` | Sí |
| `admin@medscope.ai` | admin | `MedScope123!` | Sí |

---

## P0 — Críticos

### MT-P07-SUP-NAV-001 — Acceso desde sidebar

- [ ] Login como `clinician@medscope.ai`
- [ ] Clic en **Support** en sidebar (o navegar a `/support`)
- [ ] **Esperado:** Página carga con título tipo “Clinical Support Center”
- [ ] **Esperado:** Layout coherente con resto de app (sidebar, márgenes)

### MT-P07-SUP-KB-001 — Categorías knowledge base

- [ ] En `/support`, revisar grid de categorías
- [ ] **Esperado:** ≥4 tarjetas (Getting Started, AI calibration, Data integration, Compliance)
- [ ] **Esperado:** Cada tarjeta tiene título y descripción en inglés

### MT-P07-SUP-SEARCH-001 — Búsqueda FAQ

- [ ] Escribir `compliance` en buscador
- [ ] **Esperado:** Se filtran categorías que coinciden; las demás se ocultan o reducen
- [ ] Borrar búsqueda
- [ ] **Esperado:** Vuelven todas las categorías

### MT-P07-SUP-TICKET-001 — Submit ticket (mailto)

- [ ] Completar categoría, prioridad Standard, descripción de prueba
- [ ] Clic **Submit to IT Support** (o equivalente)
- [ ] **Esperado:** Se abre cliente de correo con destinatario = email de soporte configurado
- [ ] **Esperado:** Asunto/cuerpo incluyen categoría y descripción

### MT-P07-SUP-RBAC-001 — Todos los roles autenticados

- [ ] Repetir acceso con `nurse@medscope.ai` y `admin@medscope.ai`
- [ ] **Esperado:** `/support` accesible sin 403

---

## P1 — Regresión

### MT-P07-SUP-KB-002 — Email de contacto visible

- [ ] Revisar tarjeta de contacto / institutional IT
- [ ] **Esperado:** Email coincide con valor en Settings → System configuration

### MT-P07-SUP-REG-001 — Sin sesión

- [ ] Logout → navegar a `/support`
- [ ] **Esperado:** Redirección a login

---

## Criterio de cierre US-040

- [ ] Todos los P0 marcados (manual en navegador)
- [x] Vitest + pytest RTS-040 en verde (T-X05-07)
- [x] T-X05 marcado `[x]` en TaskTracker
