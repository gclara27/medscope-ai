# MedScope AI — Requerimientos completos del producto

## Clinical Decision Support & Patient Risk Intelligence Platform

---

# 1. Objetivo del producto

MedScope AI es una plataforma web de apoyo a la decisión clínica basada en inteligencia artificial, diseñada para:

- predecir riesgo de readmisión hospitalaria,  

- explicar las predicciones mediante IA explicable,  

- permitir simulación clínica interactiva,  

- visualizar analítica hospitalaria,  

- y ayudar a profesionales sanitarios a tomar decisiones mejor fundamentadas.  


El producto debe transmitir:

- profesionalidad,  

- confianza,  

- claridad,  

- precisión clínica,  

- modernidad tecnológica.  


---

# 2. Objetivos de negocio

## 2.1 Objetivos principales

- demostrar viabilidad de IA aplicada a salud,  

- mejorar identificación temprana de pacientes de riesgo,  

- reducir incertidumbre clínica,  

- mostrar interpretabilidad del modelo,  

- ofrecer experiencia visual profesional,  

- construir plataforma defendible académicamente.  


---

## 2.2 Objetivos secundarios

- generar arquitectura escalable,  

- permitir futuras integraciones hospitalarias,  

- crear base reutilizable para investigación,  

- mostrar capacidades full-stack + ML + IA explicable.  


---

# 3. Stakeholders

## Primarios

- médicos,  

- enfermería,  

- coordinadores clínicos,  

- analistas hospitalarios.  


## Secundarios

- dirección hospitalaria,  

- investigadores,  

- universidades,  

- equipos de calidad asistencial.  


---

# 4. Tipos de usuarios


| Rol       | Capacidades                          |
| --------- | ------------------------------------ |
| Clinician | Evaluar pacientes, ver explicaciones |
| Nurse     | Consultar riesgo e historial         |
| Analyst   | Visualizar métricas y tendencias     |
| Admin     | Gestionar usuarios y configuración   |


---

# 5. Requerimientos funcionales

# 5.1 Autenticación

## RF-001 — Login

El sistema debe permitir autenticación mediante:

- email,  

- contraseña.  


## RF-002 — Logout

El usuario debe poder cerrar sesión.

## RF-003 — Persistencia de sesión

La sesión debe mantenerse activa mediante JWT.

## RF-004 — Roles

El sistema debe soportar:

- admin,  

- clinician,  

- analyst,  

- nurse.  


---

# 5.2 Dashboard principal

## RF-010 — Dashboard overview

El sistema debe mostrar:

- total evaluaciones,  

- pacientes alto riesgo,  

- tendencias,  

- actividad reciente.  


## RF-011 — KPIs

Mostrar:

- riesgo promedio,  

- readmisiones estimadas,  

- distribución de riesgo.  


## RF-012 — Navegación lateral

Sidebar persistente con acceso a:

- dashboard,  

- evaluación,  

- simulación,  

- historial,  

- analytics,  

- settings.  


---

# 5.3 Evaluación clínica

## RF-020 — Formulario clínico

Permitir introducir:

- edad,  

- género,  

- presión arterial,  

- glucosa,  

- medicaciones,  

- ingresos previos,  

- duración hospitalización,  

- otros indicadores.  


## RF-021 — Validación

Validar:

- rangos,  

- obligatoriedad,  

- coherencia.  


## RF-022 — Evaluación IA

Enviar datos al modelo predictivo.

## RF-023 — Mostrar score

Visualizar:

- porcentaje,  

- categoría,  

- severidad.  


---

# 5.4 Explicabilidad IA

## RF-030 — SHAP explanations

Mostrar factores principales que afectan al riesgo.

## RF-031 — Contribuciones positivas/negativas

Visualizar:

- factores de aumento,  

- factores protectores.  


## RF-032 — Explicación textual

Generar resumen clínico entendible.

---

# 5.5 Simulación clínica

## RF-040 — Simulación interactiva

Permitir modificar variables.

## RF-041 — Recalcular riesgo

Actualizar score dinámicamente.

## RF-042 — Comparación

Mostrar:

- score original,  

- score simulado,  

- diferencia.  


## RF-043 — Visualización impacto

Mostrar cambios visuales.

---

# 5.6 Historial clínico

## RF-050 — Historial evaluaciones

Guardar predicciones realizadas.

## RF-051 — Búsqueda

Filtrar por:

- fecha,  

- riesgo,  

- usuario.  


## RF-052 — Detalle evaluación

Consultar evaluaciones previas.

---

# 5.7 Analytics

## RF-060 — Dashboard analítico

Mostrar:

- tendencias,  

- histogramas,  

- distribución riesgos,  

- evolución temporal.  


## RF-061 — Filtros

Permitir filtros temporales.

## RF-062 — KPIs ejecutivos

Mostrar métricas agregadas.

---

# 5.8 Administración

## RF-070 — Gestión usuarios

Crear/desactivar usuarios.

## RF-071 — Gestión roles

Modificar permisos.

---

# 6. Requerimientos no funcionales

# 6.1 Rendimiento

## RNF-001

Predicción < 1 segundo.

## RNF-002

Carga dashboard < 2 segundos.

---

# 6.2 Disponibilidad

## RNF-010

La aplicación debe tolerar reinicios sin pérdida de datos.

---

# 6.3 Escalabilidad

## RNF-020

Arquitectura desacoplada:

- frontend,  

- backend,  

- ML.  


---

# 6.4 Seguridad

## RNF-030

Contraseñas hasheadas.

## RNF-031

JWT seguro.

## RNF-032

Validación backend.

## RNF-033

Protección CORS.

## RNF-034

No almacenar datos sensibles reales.

---

# 6.5 UX

## RNF-040

Diseño:

- claro,  

- accesible,  

- profesional,  

- hospitalario.  


## RNF-041

Responsive design.

## RNF-042

Baja carga cognitiva.

---

# 6.6 Observabilidad

## RNF-050

Logs backend.

## RNF-051

Logs errores ML.

---

# 7. Requerimientos IA / Machine Learning

# 7.1 Dataset

## RIA-001

Uso dataset clínico público.

## RIA-002

Dataset documentado.

---

# 7.2 Entrenamiento

## RIA-010

Pipeline reproducible.

## RIA-011

Separación train/test.

## RIA-012

Evaluación métricas.

---

# 7.3 Inferencia

## RIA-020

Modelo serializado.

## RIA-021

Inferencia REST.

---

# 7.4 Explicabilidad

## RIA-030

SHAP integrado.

## RIA-031

Top features visibles.

---

# 8. Requerimientos frontend

# 8.1 Framework

## RFW-001

Frontend moderno web-based.

---

# 8.2 Pantallas

## RFW-010

Splash screen.

## RFW-011

Login.

## RFW-012

Dashboard.

## RFW-013

Prediction form.

## RFW-014

Prediction result.

## RFW-015

Explainability.

## RFW-016

Simulation.

## RFW-017

Analytics.

## RFW-018

History.

---

# 8.3 Visualización

## RFW-020

Charts interactivos.

## RFW-021

Gauge charts.

## RFW-022

Risk indicators.

## RFW-023

SHAP bars.

---

# 9. Requerimientos backend

# 9.1 API

## RBE-001

REST API FastAPI.

## RBE-002

Swagger automático.

---

# 9.2 Endpoints

## RBE-010

POST /predict

## RBE-011

POST /simulate

## RBE-012

GET /history

## RBE-013

POST /auth/login

## RBE-014

GET /analytics

---

# 9.3 Arquitectura

## RBE-020

Separación:

- routers,  

- services,  

- repositories,  

- schemas.  


---

# 10. Requerimientos base de datos

# 10.1 Persistencia

## RDB-001

Persistir:

- usuarios,  

- predicciones,  

- simulaciones,  

- logs.  


---

# 10.2 Tecnología

## RDB-010

PostgreSQL recomendado.

---

# 10.3 ORM

## RDB-020

SQLAlchemy.

---

# 11. Requerimientos DevOps

# 11.1 Docker

## RDO-001

Backend dockerizado.

## RDO-002

Database dockerizada.

---

# 11.2 Entornos

## RDO-010

Separación:

- dev,  

- prod.  


---

# 11.3 Variables entorno

## RDO-020

Uso .env.

---

# 12. Requerimientos testing

# 12.1 Backend

## RTS-001

Tests endpoints.

## RTS-002

Tests validación.

---

# 12.2 ML

## RTS-010

Validación métricas.

---

# 12.3 Frontend

## RTS-020

Testing navegación básica.

---

# 13. Requerimientos UX/UI

# 13.1 Diseño visual

## RUX-001

Estilo:

- healthcare SaaS,  

- moderno,  

- elegante,  

- enterprise-grade.  


---

# 13.2 Colores

## RUX-010

Base:

- azul médico,  

- gris,  

- blanco,  

- teal suave.  

Especificación detallada: `docs/Design/design-system.light.md`.


## RUX-011

Estados:

- verde,  

- amarillo,  

- rojo.  


---

# 13.3 Accesibilidad

## RUX-020

Contraste adecuado.

## RUX-021

Tipografía legible.

---

# 14. Requerimientos académicos

# 14.1 Defensa

## RAC-001

Mostrar:

- arquitectura,  

- pipeline ML,  

- explicabilidad,  

- simulación,  

- persistencia.  


---

# 14.2 Memoria

## RAC-010

Documentar:

- metodología,  

- dataset,  

- modelos,  

- resultados,  

- conclusiones.  


---

# 15. KPIs de éxito


| KPI               | Objetivo             |
| ----------------- | -------------------- |
| Accuracy          | >75%                 |
| Recall            | Prioridad alta       |
| Tiempo inferencia | <1s                  |
| UX navegación     | Fluida               |
| Estabilidad       | Sin errores críticos |
| Calidad visual    | Profesional          |


---

# 16. Riesgos del proyecto


| Riesgo                 | Mitigación            |
| ---------------------- | --------------------- |
| Scope demasiado grande | MVP estricto          |
| Overengineering        | Priorizar simplicidad |
| Problemas frontend     | UI simple y limpia    |
| Dataset complejo       | Reducir features      |
| SHAP lento             | TreeExplainer         |
| Poco tiempo            | Iteración incremental |


---

# 17. MVP REAL recomendado

## Debe incluir obligatoriamente

✅ Login  
✅ Dashboard  
✅ Predicción IA  
✅ SHAP explanations  
✅ Simulación  
✅ Historial  
✅ Analytics básicos  
✅ Persistencia PostgreSQL  
✅ Docker  
✅ UI profesional

---

# 18. Features opcionales

## Solo si sobra tiempo

- UI de gestión de usuarios (RF-070, RF-071) — en MVP bastan usuarios seed por migración,

- export PDF,  

- multi-model comparison,  

- dark mode,  

- alertas automáticas,  

- auditoría avanzada,  

- integración FHIR,  

- tiempo real,  

- cloud deployment.  


---

# 19. Arquitectura objetivo

Frontend elegido: **React + TypeScript** (no Streamlit).

```text
frontend/ (React + TypeScript + Tailwind)
        ↓
backend/ (FastAPI)
        ↓
ml/ (Scikit-learn — entrenamiento offline)
        ↓
PostgreSQL

```

Repositorio monolítico con módulos desacoplados (`frontend/`, `backend/`, `ml/`).

---

# 20. Resultado esperado final

El proyecto final debe parecer:

- un producto clínico real,  

- una plataforma enterprise moderna,  

- una solución IA profesional,  

- un sistema defendible técnicamente,  

- un TFM visualmente impresionante,  

- y una arquitectura sólida y mantenible.

