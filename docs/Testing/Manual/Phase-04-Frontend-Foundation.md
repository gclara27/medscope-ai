# Fase 4 — Tests manuales: Frontend base

**Alcance:** Splash, login UI, JWT en cliente, rutas protegidas, navegación por rol, layout responsive (sidebar + móvil), dashboard con gráfico demo Recharts. Las pantallas clínicas (`/evaluation`, `/simulation`, etc.) son **placeholders** hasta Fase 5.

**Referencia:** [Task Tracker — Fase 4](../../TaskTracker.md#fase-4--frontend-base) · [Design — splash](../../Design/screens/splash/light.reference.html) · [Design — login](../../Design/screens/login/reference.html)

---

## Resumen de progreso


| Prioridad | Total  | Ejecutados | Pendientes |
| --------- | ------ | ---------- | ---------- |
| P0        | 10     | 0          | 10         |
| P1        | 3      | 0          | 3          |
| **Total** | **13** | **0**      | **13**     |


| Área | Tests | IDs |
| --- | --- | --- |
| INF — Arranque frontend | 1 | MT-P04-INF-001 |
| SPL — Splash | 2 | MT-P04-SPL-001 … 002 |
| AUTH — Login / logout | 3 | MT-P04-AUTH-001 … 003 |
| RBAC — Rutas y sidebar por rol | 3 | MT-P04-RBAC-001 … 003 |
| LAY — Layout responsive | 1 | MT-P04-LAY-001 |
| DASH — Dashboard demo | 1 | MT-P04-DASH-001 |
| P1 — Regresión | 3 | MT-P04-REG-001 … 003 |

---

## Antes de empezar

### Arranque recomendado

```powershell
.\dev.bat
```

Verifica:

| Check | URL | Esperado |
| --- | --- | --- |
| Frontend | http://localhost:5173 | Carga sin error en consola |
| Backend | http://localhost:8000/health | `status: ok` |
| Proxy Vite | Login desde UI (no CORS) | Petición a `/auth/login` vía proxy |

### Credenciales demo

| Email | Rol | Contraseña |
| --- | --- | --- |
| `admin@medscope.ai` | admin | `MedScope123!` |
| `clinician@medscope.ai` | clinician | `MedScope123!` |
| `analyst@medscope.ai` | analyst | `MedScope123!` |
| `nurse@medscope.ai` | nurse | `MedScope123!` |

### Navegadores

Prueba al menos **Chrome/Edge** en escritorio. Para layout móvil (P1), usa DevTools responsive (&lt; 768 px) o un dispositivo real.

---

## P0 — Bloqueantes

### MT-P04-INF-001 — Frontend accesible


| Campo | Valor |
| --- | --- |
| **Prioridad** | P0 |
| **Requisitos** | T-401, T-404 |


**Pasos**

1. Con `dev.bat` en ejecución, abre http://localhost:5173

**Criterios de aceptación**

- [ ] Redirige o muestra la pantalla Splash (`MedScope AI`, botón **Get Started**).
- [ ] Sin errores críticos en la consola del navegador.

---

### MT-P04-SPL-001 — Splash y redirección automática


| Campo | Valor |
| --- | --- |
| **Prioridad** | P0 |
| **Requisitos** | T-407, RFW-010 |


**Pasos**

1. Abre http://localhost:5173/ en ventana de incógnito (sin sesión).
2. Espera ~3 segundos sin pulsar nada.

**Criterios de aceptación**

- [ ] Título **MedScope AI** y subtítulo visibles.
- [ ] Tras ~2,8 s navega automáticamente a `/login`.

---

### MT-P04-SPL-002 — Botón Get Started


| Campo | Valor |
| --- | --- |
| **Prioridad** | P0 |
| **Requisitos** | T-407 |


**Pasos**

1. En `/`, pulsa **Get Started** antes del timeout.

**Criterios de aceptación**

- [ ] Navega a `/login` si no hay sesión activa.

---

### MT-P04-AUTH-001 — Login correcto


| Campo | Valor |
| --- | --- |
| **Prioridad** | P0 |
| **Requisitos** | UC-001, T-408, T-409 |


**Pasos**

1. En `/login`, introduce `clinician@medscope.ai` / `MedScope123!`.
2. Pulsa **Sign in**.

**Criterios de aceptación**

- [ ] Redirección a `/dashboard`.
- [ ] Sidebar muestra nombre del usuario y rol **clinician**.
- [ ] Tarjetas de sesión en dashboard con email y rol correctos.

---

### MT-P04-AUTH-002 — Login incorrecto


| Campo | Valor |
| --- | --- |
| **Prioridad** | P0 |
| **Requisitos** | UC-001, UC-090 |


**Pasos**

1. En `/login`, email válido y contraseña incorrecta.

**Criterios de aceptación**

- [ ] Mensaje de error visible (Alert rojo), sin stack trace.
- [ ] Permanece en `/login`.

---

### MT-P04-AUTH-003 — Logout y toast


| Campo | Valor |
| --- | --- |
| **Prioridad** | P0 |
| **Requisitos** | UC-002, T-411 |


**Pasos**

1. Con sesión iniciada, pulsa **Log out** en el sidebar.
2. Observa la pantalla de login.

**Criterios de aceptación**

- [ ] Vuelve a `/login`.
- [ ] Toast verde: *You have been signed out successfully.*
- [ ] Acceder a `/dashboard` sin login redirige a `/login`.

---

### MT-P04-RBAC-001 — Sidebar clinician


| Campo | Valor |
| --- | --- |
| **Prioridad** | P0 |
| **Requisitos** | UC-003, RF-012, T-406 |


**Pasos**

1. Login como `clinician@medscope.ai`.
2. Revisa enlaces del sidebar.

**Criterios de aceptación**

- [ ] Visibles: Dashboard, Evaluation, Simulation, History.
- [ ] **No** visibles: Analytics, Settings.

---

### MT-P04-RBAC-002 — Sidebar analyst y nurse


| Campo | Valor |
| --- | --- |
| **Prioridad** | P0 |
| **Requisitos** | UC-003, T-410 |


**Pasos**

1. Login como `analyst@medscope.ai` → revisar sidebar.
2. Logout. Login como `nurse@medscope.ai` → revisar sidebar.

**Criterios de aceptación**

- [ ] **Analyst:** Dashboard, Analytics; sin Evaluation ni Simulation.
- [ ] **Nurse:** Dashboard, History; sin Analytics ni Evaluation.
- [ ] Navegar manualmente a `/analytics` como nurse → `/unauthorized` o equivalente.

---

### MT-P04-RBAC-003 — Admin acceso completo


| Campo | Valor |
| --- | --- |
| **Prioridad** | P0 |
| **Requisitos** | UC-003 |


**Pasos**

1. Login como `admin@medscope.ai`.
2. Recorre cada enlace del sidebar.

**Criterios de aceptación**

- [ ] Todos los ítems MVP visibles: Dashboard, Evaluation, Simulation, History, Analytics, Settings.
- [ ] Cada ruta carga (placeholder o dashboard) sin error 404.

---

### MT-P04-LAY-001 — Layout responsive


| Campo | Valor |
| --- | --- |
| **Prioridad** | P0 |
| **Requisitos** | T-413, RUX-020 |


**Pasos**

1. Con sesión clinician, ancho &gt; 768 px: sidebar fijo a la izquierda.
2. Ancho &lt; 768 px: icono menú (hamburguesa), abrir y cerrar panel.

**Criterios de aceptación**

- [ ] Escritorio: sidebar siempre visible.
- [ ] Móvil: menú colapsado; al abrir, enlaces navegables y se cierra al elegir ruta.

---

### MT-P04-DASH-001 — Dashboard y gráfico demo


| Campo | Valor |
| --- | --- |
| **Prioridad** | P0 |
| **Requisitos** | T-414, RFW-012 |


**Pasos**

1. Login clinician → `/dashboard`.
2. Desplázate hasta la sección de gráfico.

**Criterios de aceptación**

- [ ] Título **Clinical Dashboard** y mensaje de bienvenida con nombre.
- [ ] Gráfico de distribución de riesgo (Recharts) renderizado con datos demo.
- [ ] Texto indica que la actividad clínica real llegará en Fase 5 (placeholder).

---

## P1 — Regresión

### MT-P04-REG-001 — Ruta protegida sin token

En incógnito, navega directamente a http://localhost:5173/dashboard.

- [ ] Redirección a `/login` (o splash → login).

### MT-P04-REG-002 — Placeholders Fase 5

Como clinician, abre `/evaluation` y `/simulation`.

- [ ] Página placeholder con título y descripción; sin error de aplicación.

### MT-P04-REG-003 — Tests automáticos frontend

```powershell
cd frontend
npm run test
npm run lint
```

- [ ] Vitest: 22 tests passed (8 archivos).
- [ ] ESLint sin errores.

---

## Relación con tests automáticos

| Manual | Automatizado (`frontend/src`) |
| --- | --- |
| MT-P04-AUTH-001/002 | `LoginPage.test.tsx` |
| MT-P04-AUTH-003 | `LoginPage.logout.test.tsx` |
| MT-P04-RBAC-* | `RoleRoute.test.tsx`, `navigation.test.ts` |
| MT-P04-LAY-001 | `AppLayout.test.tsx` |
| MT-P04-SPL-* | `SplashPage.test.tsx` |
| Spinner / Alert / Toast | `ux-feedback.test.tsx` |
| JWT service | `auth.test.ts` |

---

## Registro de sesiones


| Fecha | Ejecutado por | Commit / rama | P0 | P1 | Comentarios |
| --- | --- | --- | --- | --- | --- |
| | | | | | |
