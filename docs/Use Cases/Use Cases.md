# MedScope AI — Complete Use Case Catalog

## Clinical Decision Support & Patient Risk Intelligence Platform

---

# 1. Introduction

Los casos de uso definen:

- qué puede hacer el usuario,  

- cómo interactúa con el sistema,  

- qué funcionalidades debemos implementar,  

- y qué flujos deben existir dentro de la aplicación.  


Esto será extremadamente importante para:

- arquitectura,  

- diseño,  

- implementación,  

- testing,  

- memoria del TFM,  

- defensa del proyecto.  


---

# 2. Actores del sistema


| Actor                  | Descripción                  |
| ---------------------- | ---------------------------- |
| Clinician              | Médico o profesional clínico |
| Nurse                  | Enfermería                   |
| Analyst                | Analista hospitalario        |
| Admin                  | Administrador del sistema    |
| ML System              | Motor IA predictivo          |
| Authentication Service | Servicio autenticación       |


---

# 3. Mapa global de casos de uso

```text
                ┌─────────────────────┐
                │     Login System    │
                └──────────┬──────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
   Dashboard         Predictions        Analytics
         │                 │                 │
         │                 ▼                 │
         │          Explainability           │
         │                 │                 │
         │                 ▼                 │
         │            Simulations            │
         │                                   │
         ▼                                   ▼
   History Review                     Executive Metrics

```

---

# 4. Authentication & User Management

---

# UC-001 — User Login

## Goal

Permitir acceso seguro al sistema.

## Primary Actor

Clinician / Nurse / Analyst / Admin

## Preconditions

- Usuario registrado.  


## Main Flow

1. Usuario abre aplicación.
2. Introduce email y contraseña.
3. Backend valida credenciales.
4. JWT generado.
5. Usuario accede al dashboard.

## Alternative Flows

- Credenciales incorrectas.  

- Usuario deshabilitado.  


## Postconditions

- Sesión activa.  


---

# UC-002 — User Logout

## Goal

Cerrar sesión de forma segura.

## Flow

1. Usuario pulsa logout.
2. Token eliminado.
3. Redirección login.

---

# UC-003 — Role Authorization

## Goal

Controlar acceso según permisos.

## Flow

1. Usuario intenta acceder a recurso.
2. Sistema valida rol.
3. Acceso permitido o denegado.

---

# 5. Dashboard

---

# UC-010 — View Clinical Dashboard

## Goal

Visualizar resumen general clínico.

## Actor

Clinician

## Main Flow

1. Usuario entra dashboard.
2. Sistema carga:
  - KPIs  

  - tendencias  

  - evaluaciones recientes  

  - alertas  


## Output

Dashboard visual interactivo.

---

# UC-011 — View Risk Distribution

## Goal

Visualizar distribución de riesgo.

## Actor

Analyst

## Flow

1. Sistema consulta predicciones.
2. Calcula distribución.
3. Renderiza charts.

---

# UC-012 — Navigate Through Platform

## Goal

Permitir navegación intuitiva.

## Flow

1. Usuario usa sidebar.
2. Cambia entre módulos.

---

# 6. Clinical Prediction

---

# UC-020 — Create New Patient Evaluation

## Goal

Realizar evaluación clínica IA.

## Primary Actor

Clinician

## Preconditions

Usuario autenticado.

## Main Flow

1. Usuario abre formulario.
2. Introduce variables clínicas.
3. Sistema valida inputs.
4. Usuario pulsa “Predict”.
5. Backend ejecuta inferencia.
6. Resultado devuelto.

## Output

- risk score  

- category  

- explanation  


---

# UC-021 — Validate Clinical Inputs

## Goal

Garantizar integridad datos.

## Flow

1. Usuario introduce valores.
2. Frontend/backend validan:
  - tipos  

  - rangos  

  - obligatoriedad  


---

# UC-022 — Generate AI Prediction

## Goal

Calcular riesgo mediante ML.

## Actor

ML System

## Flow

1. Backend recibe payload.
2. Preprocesamiento.
3. Modelo ejecuta predict().
4. Probabilidad calculada.
5. Riesgo categorizado.

---

# UC-023 — Store Prediction

## Goal

Persistir evaluación clínica.

## Flow

1. Prediction guardada.
2. Inputs almacenados.
3. Timestamp generado.

---

# 7. Explainable AI

---

# UC-030 — Generate SHAP Explanation

## Goal

Explicar predicción IA.

## Actor

ML System

## Main Flow

1. Modelo genera SHAP values.
2. Features ordenadas.
3. Explicación almacenada.

---

# UC-031 — Visualize Feature Importance

## Goal

Mostrar factores influyentes.

## Actor

Clinician

## Main Flow

1. Frontend recibe SHAP.
2. Renderiza barras horizontales.
3. Muestra:
  - factores positivos  

  - factores negativos  


---

# UC-032 — Read AI Clinical Summary

## Goal

Interpretar IA fácilmente.

## Flow

1. Sistema genera resumen textual.
2. Usuario interpreta resultado.

---

# 8. Clinical Simulation

---

# UC-040 — Open Simulation Panel

## Goal

Permitir simulación clínica.

## Actor

Clinician

## Flow

1. Usuario abre simulador.
2. Variables actuales cargadas.

---

# UC-041 — Modify Clinical Variables

## Goal

Cambiar parámetros paciente.

## Flow

1. Usuario ajusta sliders.
2. Variables actualizadas.

---

# UC-042 — Recalculate Simulated Risk

## Goal

Recalcular riesgo dinámicamente.

## Flow

1. Sistema ejecuta nueva inferencia.
2. Riesgo actualizado.

---

# UC-043 — Compare Original vs Simulation

## Goal

Comparar impacto clínico.

## Flow

1. Mostrar:
  - riesgo original  

  - riesgo nuevo  

  - delta  


---

# UC-044 — Save Simulation

## Goal

Persistir escenarios simulados.

## Flow

1. Simulación almacenada.
2. Inputs guardados.

---

# 9. Prediction History

---

# UC-050 — View Prediction History

## Actor

Clinician / Nurse / Analyst

## Goal

Consultar evaluaciones previas.

## Flow

1. Usuario abre historial.
2. Sistema carga predicciones.

---

# UC-051 — Search Predictions

## Goal

Filtrar evaluaciones.

## Flow

1. Usuario aplica filtros.
2. Sistema devuelve resultados.

---

# UC-052 — Open Historical Prediction

## Goal

Ver detalle histórico.

## Flow

1. Usuario selecciona evaluación.
2. Sistema muestra:
  - score  

  - SHAP  

  - simulaciones  


---

# 10. Analytics & Reporting

---

# UC-060 — View Analytics Dashboard

## Goal

Visualizar métricas hospitalarias.

## Actor

Analyst

## Flow

1. Sistema agrega métricas.
2. Renderiza dashboards.

---

# UC-061 — Analyze Trends

## Goal

Identificar patrones temporales.

## Flow

1. Usuario selecciona periodo.
2. Charts actualizados.

---

# UC-062 — Analyze Risk Categories

## Goal

Evaluar distribución poblacional.

## Flow

1. Sistema agrupa riesgos.
2. Charts mostrados.

---

# UC-063 — Export Analytics (Optional)

## Goal

Exportar datos.

## Flow

1. Usuario genera export.
2. Archivo descargado.

---

# 10b. Public Explore Demo

> Requirements RFW-027 · Technical: [Public-Demo-Playground.md](../Demo/Public-Demo-Playground.md) · Sequence: [Architecture/Sequence-Diagrams.md §6](../Architecture/Sequence-Diagrams.md#6-public-explore-demo-uc-066)

---

# UC-066 — Explore Public Demo (Guided Tour)

## Goal

Permitir a visitantes probar el flujo CDSS principal **sin credenciales** ni persistencia.

## Actor

Visitante anónimo (evaluador, inversor, usuario en portfolio).

## Preconditions

- Backend con ML cargado (`/health` → `ml_ready: true`).
- Frontend accesible (local o Vercel con `VITE_API_BASE_URL`).

## Flow

1. Visitante abre `/` (splash) y pulsa **Explore demo**, o navega directamente a `/demo`.
2. Sistema muestra pantalla de bienvenida y tour guiado por pasos.
3. Visitante avanza: **case** → **predict** → **explain** → **simulate** → **complete**.
4. En **predict**, sistema llama `POST /demo/predict` con caso sintético; muestra riesgo + SHAP.
5. En **simulate**, sistema llama `POST /demo/simulate` con intervenciones pre-rellenadas; muestra comparación de riesgo.
6. URL sincronizada (`/demo/case`, `/demo/predict`, …) — navegador atrás/adelante cambia paso.
7. En **complete**, visitante puede ir a **Sign in** para la plataforma completa.

## Postconditions

- Ningún registro en PostgreSQL.
- Estado de sesión demo solo en memoria del navegador.

## Acceptance criteria

- Funciona sin JWT.
- Latencia de inferencia típica &lt; 1 s.
- Datos 100 % sintéticos; aviso “no data persisted”.
- Tests: `backend/tests/test_demo.py`, `DemoPlaygroundPage.test.tsx`.

## Distinction

| Flow | Auth | Persistence | Entry |
|---|---|---|---|
| UC-066 Public demo | No | No | `/demo` |
| UC-020 Evaluation | Yes | Yes | `/evaluation` + T-907 scenarios |

---

# 11. Support (optional)

> Requirements §18 — T-X05. Mockup: `docs/Design/screens/support/reference.html`.

---

# UC-064 — Access Support Center

## Goal

Consultar ayuda y documentación de uso dentro de la plataforma.

## Actor

Cualquier usuario autenticado (admin, clinician, analyst, nurse).

## Preconditions

- Sesión JWT válida.

## Flow

1. Usuario abre `/support` desde sidebar o URL.
2. Sistema muestra knowledge base por categorías.
3. Usuario puede buscar términos en contenido FAQ (client-side).
4. Usuario lee artículos/categorías de ayuda.

## Postconditions

- Ninguna persistencia requerida.

## Acceptance criteria

- Layout coherente con design system.
- ≥4 categorías visibles (Getting Started, AI calibration, Data integration, Compliance).
- Accesible para todos los roles autenticados.

---

# UC-065 — Submit Support Ticket

## Goal

Reportar incidencia o solicitud de ayuda al equipo de soporte.

## Actor

Cualquier usuario autenticado.

## Preconditions

- `support_contact_email` configurado en system settings (UC-071).

## Flow

1. Usuario completa categoría, prioridad y descripción.
2. Usuario pulsa enviar.
3. Sistema abre cliente de correo (`mailto:`) con destinatario, asunto y cuerpo pre-rellenados.

## Postconditions

- No se persiste ticket en BD en v1.

## Acceptance criteria

- Email destino = `support_contact_email`.
- Prioridad “Urgent (Clinical)” visible pero no dispara alertas automáticas.

---

# 12. Administration

---

# UC-070 — Manage Users

> **Alcance MVP:** opcional. En el MVP inicial los usuarios pueden crearse por seed/migración (ver Requirements §18). Implementar UI admin solo si hay tiempo.

## Goal

Gestionar usuarios.

## Actor

Admin

## Flow

1. Crear usuario.
2. Desactivar usuario.
3. Editar roles.

---

# UC-071 — Configure System Settings

> **Alcance MVP:** opcional (Requirements §18).

## Goal

Modificar configuración.

## Flow

1. Admin cambia parámetros.
2. Configuración persistida.

---

# 12. Backend & Infrastructure

---

# UC-080 — API Authentication

## Goal

Proteger endpoints.

## Flow

1. JWT validado.
2. Acceso permitido/rechazado.

---

# UC-081 — Persist Audit Logs

> **Alcance:** opcional avanzado (T-X06). Historial de predicciones (UC-050) cubre trazabilidad clínica; este UC cubre **auditoría de sistema**.

## Goal

Mantener trazabilidad de acciones críticas para gobernanza y compliance.

## Actor

Sistema (escritura automática); **Admin** (lectura).

## Flow — escritura

1. Acción crítica ejecutada (login, predict, simulate, admin CRUD, settings).
2. `AuditService` genera registro en `audit_logs`.
3. `action_details` JSON con metadatos (sin PHI).

## Flow — consulta (UC-085)

1. Admin abre pestaña Audit en Settings.
2. Sistema lista logs con filtros (fecha, acción, usuario).
3. Admin revisa trazabilidad.

## Acceptance criteria

- Tabla `audit_logs` según Database.md §4.8.
- `GET /admin/audit-logs` solo admin.
- No passwords ni valores clínicos en logs.

---

# UC-082 — Load ML Model

## Goal

Inicializar inferencia.

## Flow

1. FastAPI startup.
2. Modelo cargado memoria.

---

# UC-083 — Execute Prediction Pipeline

## Goal

Ejecutar pipeline ML.

## Flow

1. Preprocessing.
2. Predict.
3. SHAP.
4. Response.

---

# UC-084 — View ML Model Comparison (Optional)

> T-X07 — Requirements RF-076, RIA-040. Comparación **offline** de baselines entrenados.

## Goal

Visualizar métricas comparativas entre modelos candidatos y el modelo en producción.

## Actor

Analyst, Admin.

## Preconditions

- Artefactos ML generados en Fase 2 (`baseline_comparison.json`, `model_manifest.json`).

## Flow

1. Usuario abre pestaña Models (Settings) o sección equivalente.
2. Sistema llama `GET /ml/models/comparison`.
3. UI muestra tabla de métricas y gráfico (recall prioritario).
4. Se destaca modelo activo en inferencia.

## Acceptance criteria

- Clinician/nurse sin acceso.
- Mensaje claro si faltan artefactos.
- Texto: comparación de entrenamiento, no predicción multi-modelo en vivo.

---

# UC-085 — Query Audit Logs (Optional)

> T-X06 — lectura; escritura en UC-081.

## Goal

Consultar registros de auditoría del sistema.

## Actor

Admin.

## Flow

1. Admin aplica filtros (rango fechas, tipo acción, usuario).
2. Sistema devuelve página de resultados desde `audit_logs`.
3. Admin revisa detalle por fila (`action_details` legible).

## Acceptance criteria

- Paginación o límite razonable (ej. 50 por página).
- Orden descendente por `created_at`.

---

# 13. Error Handling

---

# UC-090 — Handle Invalid Input

## Goal

Gestionar errores usuario.

## Flow

1. Input inválido detectado.
2. Error mostrado.

---

# UC-091 — Handle Backend Failure

## Goal

Evitar caída sistema.

## Flow

1. Exception capturada.
2. Error controlado retornado.

---

# 14. UX/UI Cases

---

# UC-100 — Responsive Navigation

## Goal

Adaptarse a múltiples pantallas.

---

# UC-101 — Display Loading States

## Goal

Mejorar UX.

---

# UC-102 — Display Success Notifications

## Goal

Confirmar acciones usuario.

---

# UC-103 — Display Error Notifications

## Goal

Comunicar problemas claramente.

---

# 15. ML Lifecycle Cases

---

# UC-110 — Train Model Offline

## Goal

Entrenar modelo.

## Actor

ML Engineer

## Flow

1. Dataset cargado.
2. Pipeline ejecutado.
3. Modelo serializado.

---

# UC-111 — Evaluate Model Metrics

## Goal

Validar calidad modelo.

## Flow

1. Métricas calculadas.
2. Resultados almacenados.

---

# UC-112 — Update Model Version

## Goal

Versionar modelos.

## Flow

1. Nuevo modelo desplegado.
2. Version actualizada.

---

# 16. Future Expansion Use Cases

(Opcionales)

---

# UC-120 — Multi-Hospital Support

---

# UC-121 — FHIR Integration

---

# UC-122 — Real-Time Monitoring

---

# UC-123 — AI Alerts

---

# UC-124 — Cloud Deployment

**Actor:** DevOps / desarrollador  
**Prioridad:** MVP (TFM)  
**Estado:** ✅ Completado (julio 2026)

## Descripción

Desplegar el MVP en la nube con arquitectura desacoplada: frontend estático, API con ML en contenedor, PostgreSQL gestionado.

## Stack desplegado

| Capa | Servicio | URL |
|---|---|---|
| UI | Vercel | https://medscope-ai-delta.vercel.app |
| API + ML | Render (Docker) | https://medscope-ai-q8tg.onrender.com |
| BD | Supabase | Panel Supabase *(credenciales en Render)* |

## Criterios de aceptación

- [x] `GET /health` → `ml_ready: true`
- [x] Login desde URL pública de Vercel
- [x] Predicción + SHAP persistida en Supabase
- [x] Simulación, historial y analytics operativos
- [x] CORS restringido al dominio Vercel
- [x] Secretos solo en dashboards (RDO-020)
- [x] CI en GitHub en push/PR a `main`
- [x] Auto-deploy Render + Vercel en `main`

## Documentación

Guía completa: [Deployment.md](../Deployment/Deployment.md)

---

# 17. MVP Use Cases (CRITICAL)

## Estos son LOS MÁS IMPORTANTES


| Priority | Use Case           |
| -------- | ------------------ |
| P0       | Login              |
| P0       | Dashboard          |
| P0       | Create Prediction  |
| P0       | SHAP Explanation   |
| P0       | Simulation         |
| P0       | Prediction History |
| P0       | Analytics          |
| P0       | Persistence        |
| P1       | Public Explore Demo (`/demo`) |


---

# 18. Use Cases That Will Impress the Tribunal

## MOST IMPRESSIVE

### ⭐ Clinical Simulation

Porque:

- visual,  

- interactivo,  

- muy “producto real”.  


---

### ⭐ Explainable AI

Porque:

- IA transparente,  

- clínicamente entendible.  


---

### ⭐ Enterprise Dashboard

Porque:

- transmite madurez profesional.  


---

### ⭐ Public Explore Demo (`/demo`)

Porque:

- accesible sin credenciales,  

- demuestra ML + SHAP + simulación en un tour guiado,  

- ideal para enlaces en portfolio y defensa TFM.  


---

# 19. Recommended Implementation Order

## ORDER MATTERS A LOT

---

# STEP 1

Authentication

---

# STEP 2

Prediction backend

---

# STEP 3

Prediction frontend

---

# STEP 4

SHAP explanations

---

# STEP 5

Simulation engine

---

# STEP 6

Persistence/history

---

# STEP 7

Analytics dashboard

---

# STEP 8

Polish/UI/animations

---

# 20. Final Engineering Advice

La clave NO es:

- tener 100 casos de uso.  


La clave es:

- implementar PERFECTAMENTE  
los casos de uso principales.  


Si consigues:

- flujo sólido,  

- IA funcionando,  

- simulación visual,  

- SHAP elegante,  

- dashboard profesional,  


el proyecto tendrá aspecto de:

## startup real de healthcare AI enterprise.

