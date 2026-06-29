# Fase 8 — Tests manuales: Dark mode (T-X03)

**Alcance:** tema oscuro clínico según `design-system.dark.md`, selector Light / Dark / System, persistencia local (T-X03-01 … T-X03-08, US-043, UC-086).

**Referencia:** [Task Tracker — US-043](../../TaskTracker.md#us-043--dark-mode) · [Plan T-X03](../../Optional%20Features/Optional-Backlog-Plan.md#t-x03--dark-mode) · [design-system.dark.md](../../Design/design-system.dark.md)

**Prerrequisito:** Frontend en `http://localhost:5173` · `.\dev.bat`

---

## Resumen de progreso

| Prioridad | Total | Ejecutados | Pendientes |
| --------- | ----- | ---------- | ---------- |
| P0        | 6     | 0          | 6          |
| P1        | 2     | 0          | 2          |
| **Total** | **8** | **0**      | **8**      |

| Área | Tests | IDs |
| --- | ----- | --- |
| THEME | 2 | MT-P08-THEME-001 … 002 |
| UI — Pantallas P0 | 3 | MT-P08-UI-001 … 003 |
| CHART | 1 | MT-P08-CHART-001 |
| RBAC | 0 | — (todos los roles) |
| P1 — Regresión light | 2 | MT-P08-REG-001 … 002 |

---

## P0 — Críticos

### MT-P08-THEME-001 — Selector y persistencia

- [ ] Login → Settings → **Appearance**
- [ ] Seleccionar **Dark** → la app cambia a fondo navy (`#0b1326` aprox.)
- [ ] Recargar página (F5) → sigue en dark
- [ ] Seleccionar **Light** → vuelve al tema MVP
- [ ] Seleccionar **System** → sigue preferencia del SO

### MT-P08-THEME-002 — Sin flash blanco al cargar

- [ ] Con dark guardado, abrir nueva pestaña en `/login`
- [ ] **Esperado:** no parpadeo prolongado en blanco antes del tema oscuro

### MT-P08-UI-001 — Dashboard y navegación

- [ ] Tema dark → Dashboard, sidebar, KPI cards legibles
- [ ] **Esperado:** texto claro sobre superficies navy; enlaces activos visibles

### MT-P08-UI-002 — Flujo clínico (evaluation + result)

- [ ] Dark → Evaluation → enviar predicción → Result
- [ ] **Esperado:** gauge de riesgo, badges low/medium/high distinguibles (teal / amber / coral)

### MT-P08-UI-003 — Analytics y Settings

- [ ] Dark → Analytics → KPIs + tablas
- [ ] Dark → Settings (Users / Models / Appearance)
- [ ] **Esperado:** bordes y cards visibles; sin texto ilegible

### MT-P08-CHART-001 — Gráficos Recharts

- [ ] Dark → Dashboard (risk distribution) y Analytics (trend + distribution)
- [ ] **Esperado:** ejes y grid visibles; sin error en consola del navegador

---

## P1 — Regresión

### MT-P08-REG-001 — Light sin regresión

- [ ] Tras probar dark, volver a **Light**
- [ ] **Esperado:** aspecto idéntico al MVP pre-T-X03 (colores `design-system.light.md`)

### MT-P08-REG-002 — Login y Support

- [ ] Dark → `/login` (logout previo) y `/support`
- [ ] **Esperado:** formularios y tarjetas KB legibles

---

## Criterio de cierre US-043

- [ ] Todos los P0 marcados
- [ ] `vitest` theme suite en verde (RTS-043)
- [ ] T-X03 marcado `[x]` en TaskTracker
