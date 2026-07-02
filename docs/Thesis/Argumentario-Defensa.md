# Argumentario de defensa — MedScope AI

Guion oral para la defensa del TFM (**RAC-001**, **T-810**).

**Duración objetivo:** 8–10 minutos presencial · **12–14 min** vídeo (ver [Guion-Video-Defensa.md](Guion-Video-Defensa.md)).  
**Ensayo manual:** [Phase-10 MT-P10-DEMO-001](../Testing/Manual/Phase-10-Demo-Playbook.md#mt-p10-demo-001--guion-completo-ensayo-t-903)  
**Detalle escenarios demo:** [Demo-Playbook-Plan.md § guion](../Demo/Demo-Playbook-Plan.md#guion-de-defensa-t-810--t-903--t-907-05)

---

## 1. Mensaje central (elevator pitch — 30 s)

> MedScope AI es un **sistema de apoyo a la decisión clínica** que predice el riesgo de readmisión a 30 días, lo **explica** con SHAP y permite **simular** intervenciones what-if — todo en una plataforma web desplegada en producción: React, FastAPI, PostgreSQL y ML offline en la nube.

**No decir:** “diagnostica”, “recomienda tratamiento”, “sustituye al médico”.  
**Sí decir:** “apoyo a la decisión”, “transparencia”, “exploración de escenarios”, “datos sintéticos en demo”.

---

## 2. Cobertura RAC-001 (checklist tribunal)

| Requisito | Cómo demostrarlo en la defensa |
|---|---|
| Arquitectura | Diagrama [System-Architecture](../Architecture/System-Architecture.md); mencionar monolito modular |
| Pipeline ML | [ML-Pipeline-Diagram](../Architecture/ML-Pipeline-Diagram.md); entrenamiento offline, inferencia en Render |
| Explicabilidad | Pantalla resultado + SHAP (`05_prediction_result_shap.png`) |
| Simulación | `/simulation` con delta visible + animación gauge |
| Persistencia | History + Analytics; [ER-Diagram](../Architecture/ER-Diagram.md) |

---

## 3. Antes de empezar (obligatorio en producción)

| Paso | Acción |
|---|---|
| 1 | Abrir `https://medscope-ai-q8tg.onrender.com/health` → esperar `"ml_ready": true` (2–3 min si cold start) |
| 2 | Credenciales: `clinician@medscope.ai` / `MedScope123!` |
| 3 | Login: https://medscope-ai-delta.vercel.app/login |
| 4 | Tener abierto en otra pestaña: diagrama arquitectura o captura dashboard (por si falla la red) |

**Plan B si Render no responde:**

1. Demo pública: https://medscope-ai-delta.vercel.app/demo (sin login, sin BD).
2. Stack local: `.\dev.bat` + localhost:5173.
3. Capturas estáticas: [`docs/figures/screenshots/`](../figures/screenshots/README.md).

---

## 4. Estructura de la presentación (8–10 min)

### Bloque A — Contexto (1 min)

**Diapositiva sugerida:** problema + visión ([General Description](../MedScope%20AI%20General%20Description.md)).

| Tiempo | Qué decir |
|---|---|
| 0:00–0:30 | Hospitales necesitan anticipar readmisiones; los sistemas actuales almacenan datos pero no siempre ayudan a **decidir con anticipación**. |
| 0:30–1:00 | MedScope AI combina predicción, **explicabilidad SHAP** y **simulación** en un dashboard clínico moderno — CDSS, no motor de diagnóstico. |

### Bloque B — Arquitectura (1 min, opcional si hay slide)

| Tiempo | Qué decir |
|---|---|
| 1:00–1:30 | Monorepo: frontend React en Vercel, API FastAPI+ML en Render, PostgreSQL en Supabase. |
| 1:30–2:00 | ML entrenado **offline**; en runtime solo inferencia. Tests automatizados y despliegue CI/CD en `main`. |

**Figura:** [Deployment-Diagram](../Architecture/Deployment-Diagram.md) o [System-Architecture](../Architecture/System-Architecture.md).

### Bloque C — Demo en vivo (6–7 min)

Seguir la tabla minuto a minuto (§5). Narrar en **español**; la UI está en inglés (coherente con entorno hospitalario internacional).

### Bloque D — Cierre (1 min)

| Tiempo | Qué decir |
|---|---|
| 9:00–9:30 | Resumen: recall priorizado (~54 %), accuracy ~61 % — **honestidad académica**; el valor está en arquitectura, XAI y simulación. |
| 9:30–10:00 | Trabajo futuro: validación externa, calibración, FHIR. *¿Preguntas?* |

---

## 5. Guion minuto a minuto (demo en vivo)

| Min | Pantalla | Acción | Mensaje clave (español) |
|---|---|---|---|
| 0:00 | `/login` | Login clinician | Plataforma **desplegada** en producción, no solo local |
| 0:30 | Dashboard | KPIs y alertas | Vista operativa tipo hospital |
| 1:00 | Evaluation | Clic **High readmission risk** | Casos sintéticos para demo; no sustituyen juicio clínico |
| 1:10 | Evaluation | Ver prefill: 72 años, glucosa 198, 5 admisiones | Formulario editable; badge *HIGH RISK* es expectativa del escenario |
| 1:30 | Evaluation | **Generate AI Prediction** | Inferencia &lt; 1 s; ~82 % riesgo alto (LR v1.0.0) |
| 2:00 | Result | Gauge + resumen XAI | Categoría clínica + confianza del modelo |
| 2:30 | Result | Scroll → SHAP | No es caja negra: qué variables suben o bajan el riesgo |
| 3:30 | Result → Simulation | **Run simulation** | Continuidad del mismo caso |
| 4:00 | Simulation | Admisiones → **2**, Glucosa → **140** → Recalculate | Intervención hipotética: mejor control metabólico y menos historial |
| 4:30 | Simulation | Delta + animación gauge | What-if en tiempo real (~−21 pp vs baseline) |
| 5:00 | Evaluation *(opc.)* | Escenario **Moderate** → predict (~50 % medium) | Contraste narrativo low / medium / high |
| 5:30 | History | Última predicción | Persistencia PostgreSQL y trazabilidad |
| 6:30 | Analytics | KPIs y tendencias | Capa analítica para gestión |
| 7:30 | Settings *(opc.)* | Dark mode o Models | UX enterprise y gobernanza ML |
| 8:30 | Cierre | URL prod + `/health` | Stack cloud + CDSS explicable |

### Frases clave (memorizar)

| Momento | Frase |
|---|---|
| Escenarios demo | *Casos sintéticos desidentificados para formación; no sustituyen el juicio clínico.* |
| Badge *expected* | *La etiqueta indica la banda esperada; el score real puede variar ligeramente con la versión desplegada.* |
| SHAP | *Explicabilidad: qué variables empujan el riesgo hacia arriba o abajo.* |
| Simulación | *What-if en tiempo real: si mejoramos adherencia o reducimos readmisiones, ¿cómo cambia el riesgo?* |
| Accuracy | *Priorizamos recall para no perder pacientes de alto riesgo; la precision es baja y es una limitación documentada.* |
| Cierre | *Monolito desplegado: React + FastAPI + PostgreSQL + ML offline en Render.* |

### Scores de referencia (LR v1.0.0)

| Escenario | Banda | Score aprox. |
|---|---|---|
| High readmission risk | High | 82,5 % |
| Moderate risk profile | Medium | 49,9 % |
| Low risk — stable outpatient | Low | 34,9 % |
| Tras simulación (adm 2, glucosa 140) | High → menor | ~61 % (delta ~−21 pp) |

---

## 6. Variante: demo pública (sin login)

Útil como **apertura** o backup (UC-066).

| Min | Ruta | Acción |
|---|---|---|
| 0:00 | `/` splash | **Explore demo** |
| 0:30 | `/demo/case` | Caso alto riesgo sintético |
| 1:30 | `/demo/predict` | Generar predicción |
| 2:30 | `/demo/explain` | SHAP |
| 3:30 | `/demo/simulate` | What-if precargado |
| 4:30 | Cierre | *Sin login ni BD; el producto completo añade historial y analytics* |

Ref: [Public-Demo-Playground](../Demo/Public-Demo-Playground.md).

---

## 7. Preguntas frecuentes del tribunal

| Pregunta | Respuesta sugerida |
|---|---|
| ¿Por qué accuracy ~61 % y no 75 %? | Dataset desbalanceado y limitado; priorizamos **recall** en CDSS. Documentado en memoria §5.1. Mejoras: más features, calibración, validación externa. |
| ¿Por qué Logistic Regression y no XGBoost? | LR tiene **mejor recall** en hold-out (0,54 vs 0,44 XGB, 0,20 RF) y SHAP `LinearExplainer` más rápido e interpretable. |
| ¿Es un producto médico certificado? | **No.** Es un prototipo académico CDSS; no CE, no diagnóstico automático. |
| ¿Datos reales de pacientes? | **No.** Dataset UCI de-identificado; demo con casos sintéticos; sin PHI en BD. |
| ¿Por qué no microservicios? | Monolito modular: simplicidad TFM, un deploy, ML en mismo proceso que API. |
| ¿Cómo garantizan explicabilidad? | Mismo preprocessor train/inference; SHAP en cada predicción; top drivers en UI. |
| ¿Cold start en Render? | Free tier; calentamos `/health` antes; aceptable para demo TFM. |
| ¿Qué aporta vs. un notebook? | Arquitectura capas, auth RBAC, persistencia, UI clínica, tests, cloud. |

---

## 8. Diapositivas sugeridas (orden)

| # | Contenido | Fuente |
|---|---|---|
| 1 | Título + problema | General Description |
| 2 | Objetivos y alcance MVP | Memoria-TFM §2 |
| 3 | Arquitectura | System-Architecture diagram |
| 4 | Pipeline ML | ML-Pipeline-Diagram |
| 5 | Demo en vivo | *(pantalla aplicación)* |
| 6 | Resultados ML (tabla métricas) | Memoria-TFM §5.1 |
| 7 | Capturas UI | figures/screenshots |
| 8 | Conclusiones + futuro | Memoria-TFM §7–8 |

---

## 9. Comportamiento UI (recordatorios presentador)

- Escenario demo → prefill instantáneo; editar campo manual deselecciona escenario.
- Durante *Generating prediction…* las tarjetas demo se deshabilitan.
- Hay que pulsar **Generate AI Prediction**; no hay auto-predict.
- `prefers-reduced-motion`: gauge salta al valor final; mencionar delta verbalmente.

---

## 10. Checklist día de la defensa

- [ ] Ensayo completo MT-P10-DEMO-001 (≤ 10 min cronometrados)
- [ ] `/health` con `ml_ready: true` antes de entrar al aula
- [ ] Contraseña demo rotada si la URL es pública
- [ ] Capturas PDF de backup impresas o en USB
- [ ] Diagramas exportados a PNG/PDF desde Mermaid
- [ ] Memoria impresa/PDF según normativa
- [ ] No mostrar contraseñas en pantalla compartida

---

## 11. Trazabilidad

| ID | Cobertura |
|---|---|
| RAC-001 | §2, §5 demo |
| RAC-010 | Memoria escrita; defensa oral complementa |
| T-810 | Este documento |
| T-903 / T-907-05 | Guion operativo en Demo-Playbook-Plan |
| UC-124 | URLs producción §3 |
| RTS-030 | Flujo E2E = guion §5 |

---

*Última actualización: T-810 — julio 2026.*
