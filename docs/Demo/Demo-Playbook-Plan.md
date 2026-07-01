# MedScope AI — Demo Playbook & Simulation WOW (Fase 9b)

Plan maestro para dos mejoras orientadas a **defensa TFM** y demo memorable.  
**No implementa código** — define alcance, tareas (T-907, T-908) y guion de demostración.

| Documento | Rol |
|---|---|
| [TaskTracker.md](../TaskTracker.md) | T-907-* · T-908-* · US-044 · US-045 |
| [ExecutionPlan.md](../Execution%20Plan/ExecutionPlan.md) | Phase 9 — demo preparation |
| [Phase-10-Demo-Playbook.md](../Testing/Manual/Phase-10-Demo-Playbook.md) | Checklist manual post-implementación |
| [Phase-09-Production-Smoke.md](../Testing/Manual/Phase-09-Production-Smoke.md) | Smoke test cloud |

---

## Objetivo

| ID | Feature | Valor TFM |
|---|---|---|
| **T-907** | Clinical demo playbook | Narrativa clínica guiada; demo sin improvisar |
| **T-908** | Simulation risk animation | WOW visual en what-if; refuerza “decision support en tiempo real” |

**Principios:** solo frontend · sin cambios ML/BD · sin comprometer Fase 8 (memoria/diagramas) · incremental (una tarea a la vez).

---

## Orden de implementación

```text
1. T-907  Demo playbook (datos → UI → tests → guion)
2. T-908  Animación simulación (gauge → wiring → a11y → tests)
3. T-903  Ensayo demo completo (usa Phase-10 manual)
```

T-908 puede empezar en paralelo tras T-907-02 si hay dos personas; en solitario, secuencial.

---

## T-907 — Clinical demo playbook (US-044)

### User story US-044

**Como** clínico en demo o defensa, **quiero** cargar casos clínicos predefinidos con un clic, **para** evaluar pacientes de ejemplo sin rellenar el formulario manualmente y seguir una narrativa coherente.

### Alcance

**In scope:**

- Módulo `frontend/src/lib/clinicalDemoScenarios.ts` con 3–4 escenarios tipados
- Panel de tarjetas en `EvaluationPage` (encima o junto a `ClinicalEvaluationForm`)
- Clic en escenario → rellena `ClinicalEvaluationForm` vía callback / controlled state
- Cada tarjeta: título, vignette corta (inglés), badge de riesgo esperado (*expected*, no garantizado), icono Lucide
- Escenario “Simulation showcase” incluye `simulationHint` (texto para el presentador)
- Responsive: grid 1 col móvil, 2–4 cols desktop
- Tests vitest: render, prefill, accesibilidad básica
- Manual `Phase-10-Demo-Playbook.md` + integración con guion T-810

**Out of scope:**

- Backend / nuevos endpoints
- Persistir escenarios en PostgreSQL
- Pacientes identificables (PHI) — solo datos sintéticos
- Auto-ejecutar predicción al elegir escenario (el usuario pulsa *Evaluate*)

> **Validación modelo (LR v1.0.0, thresholds 0.6 / 0.35):** `high-readmission` → 82.5% high · `moderate-risk` → 49.9% medium · `low-risk-stable` → 34.9% low. Simulación showcase: reducir admissions a 2 y glucosa a 140 baja ~21 pp (sigue high; ideal para animación T-908).

### Escenarios propuestos (validar scores al implementar)

Valores alineados con `ClinicalFormValues` + `buildPredictRequest` defaults ocultos (`PREDICT_DEFAULTS` en `clinicalFormDefaults.ts`).

| ID | Título UI | Narrativa (EN) | Riesgo esperado | Valores clave del formulario |
|---|---|---|---|---|
| `high-readmission` | High readmission risk | 72F, 5 prior admissions, elevated glucose, polypharmacy | High | age 72, gender Female, previous_admissions 5, glucose 198, medications_count 12, hospital_stay_days 6, bmi 31.2, blood_pressure 142 |
| `moderate-risk` | Moderate risk profile | 58M, single prior admission, suboptimal glucose control | Medium | age 58, gender Male, previous_admissions 1, glucose 165, medications_count 6, hospital_stay_days 4, bmi 29.0, blood_pressure 128 |
| `low-risk-stable` | Low risk — stable outpatient | 42F, no prior admissions, well-controlled metrics | Low | age 42, gender Female, previous_admissions 0, glucose 108, medications_count 3, hospital_stay_days 2, bmi 24.5, blood_pressure 118 |
| `simulation-showcase` | Intervention simulation | Same as high-risk; demo reducing drivers in Simulation | High → lower after sim | Mismos valores que `high-readmission`; `simulationHint`: "After predict, open Simulation and reduce Previous admissions to 2 and Glucose to 140." |

> **Nota implementación:** ejecutar `POST /predict` con cada payload en local y ajustar valores si el modelo no devuelve la categoría esperada. Documentar resultado real en Phase-10.

### UI / UX (design system)

- Tarjetas `Card` con borde sutil; hover `border-primary/30`
- Badge riesgo con tokens `RISK_BADGE_CLASSES` (`riskDisplay.ts`)
- Sección titulada **Demo clinical scenarios** + subtítulo *De-identified synthetic cases for training and demonstration*
- No bloquear el formulario manual — escenarios son atajo, no reemplazo

### Archivos previstos

| Archivo | Acción |
|---|---|
| `frontend/src/lib/clinicalDemoScenarios.ts` | Crear |
| `frontend/src/lib/clinicalDemoScenarios.test.ts` | Crear |
| `frontend/src/components/clinical/ClinicalDemoScenarioPanel.tsx` | Crear |
| `frontend/src/components/clinical/ClinicalEvaluationForm.tsx` | Exponer `values` + `onValuesChange` o `key` reset |
| `frontend/src/pages/EvaluationPage.tsx` | Integrar panel |
| `frontend/src/pages/EvaluationPage.test.tsx` | Ampliar |

### Trazabilidad

| Requisito | Cobertura |
|---|---|
| RF-020 | Formulario clínico — prefill |
| RF-040 | Simulación — escenario showcase + hint |
| RUX-001 | Polish visual demo |
| UC-020 | Create prediction — flujo acelerado |
| T-810 | Argumentario defensa — guion minuto a minuto |

---

## T-908 — Simulation risk animation (US-045)

### User story US-045

**Como** clínico, **quiero** ver el gauge de riesgo animarse al recalcular una simulación, **para** percibir el impacto clínico del cambio de variables de forma inmediata y memorable.

### Alcance

**In scope:**

- `RiskGaugeChart` acepta props opcionales: `animateFromPercent?: number`, `animationDurationMs?: number` (default ~800ms)
- Animación de arco + número central (count-up) con easing (ease-out)
- `SimulationComparisonPanel` / `SimulationPage`: al recibir nuevo `simulatedRisk`, animar desde riesgo original (o valor previo simulado)
- Durante `isRecalculating`: mantener spinner existente; animar al completar
- `prefers-reduced-motion`: saltar animación, valor final instantáneo
- Tests: mock `matchMedia`, verificar valor final; test reducido motion
- Dark mode: sin regresión (reutilizar `renderWithTheme`)

**Out of scope:**

- Animar SHAP bars (fase posterior opcional)
- Librería nueva pesada (Framer Motion) salvo que el equipo lo prefiera — preferir CSS/SVG + `requestAnimationFrame` o Recharts animation
- Sonidos / haptics

### Comportamiento deseado

```text
Usuario cambia variable → Recalculate → spinner
→ respuesta API → gauge simulado anima de 78.2% → 54.1%
→ color de arco transiciona si cambia risk_level
→ delta badge ya existente se mantiene
```

### Archivos previstos

| Archivo | Acción |
|---|---|
| `frontend/src/components/charts/RiskGaugeChart.tsx` | Animación |
| `frontend/src/components/charts/RiskGaugeChart.test.tsx` | Ampliar |
| `frontend/src/components/clinical/SimulationComparisonPanel.tsx` | Pasar `animateFrom` |
| `frontend/src/pages/SimulationPage.tsx` | Coordinar from/to en recálculo |
| `frontend/src/lib/motion.ts` | Helper `prefersReducedMotion()` (opcional) |

### Trazabilidad

| Requisito | Cobertura |
|---|---|
| RF-041–043 | Simulación — feedback visual impacto |
| RUX-001 | Polish |
| RNF-002 | Percepción rendimiento (animación corta, no bloquea) |
| UC-043 | Compare original vs simulation |

---

## Guion de defensa (T-810 / T-903 / T-907-05)

**Estado:** guion listo para ensayo · T-907 y T-908 implementados (vitest verde) · pendiente ensayo manual Phase-10 en prod.

**Duración objetivo:** 8–10 minutos (+ 2 min buffer cold start Render).

### Antes de empezar (obligatorio en prod)

1. Abrir en otra pestaña: `GET https://medscope-ai-q8tg.onrender.com/health` → esperar `ml_ready: true`.
2. Tener credenciales: `clinician@medscope.ai` / `MedScope123!`.
3. URLs: [login](https://medscope-ai-delta.vercel.app/login) · [API health](https://medscope-ai-q8tg.onrender.com/health).

### Frases clave (español, para el tribunal)

| Momento | Mensaje |
|---|---|
| Escenarios demo | *Casos sintéticos desidentificados para formación; no sustituyen el juicio clínico.* |
| Badge *expected* | *La etiqueta indica la banda esperada del modelo; el score real puede variar ligeramente con la versión desplegada.* |
| SHAP | *Explicabilidad: qué variables empujan el riesgo hacia arriba o abajo.* |
| Simulación | *What-if en tiempo real: si mejoramos adherencia o reducimos readmisiones, ¿cómo cambia el riesgo?* |
| Cierre | *Monolito desplegado: React + FastAPI + PostgreSQL + ML offline en Render.* |

### Guion minuto a minuto

| Min | Pantalla | Acción concreta | Mensaje clave |
|---|---|---|---|
| 0:00 | `/login` | Login clinician | Plataforma en producción (Vercel + Render + Supabase) |
| 0:30 | Dashboard | Revisar KPIs y alertas alto riesgo | Vista operativa tipo hospital |
| 1:00 | Evaluation (`/evaluation`) | Clic tarjeta **High readmission risk** | Panel *Demo clinical scenarios* — narrativa sin teclear |
| 1:10 | Evaluation | Verificar prefill: age 72, glucose 198, admissions 5 | Formulario editable; badge *HIGH RISK* es expectativa |
| 1:30 | Evaluation | **Generate AI Prediction** | IA + persistencia; ~82.5% high (LR v1.0.0) |
| 2:00 | Result | Gauge + resumen XAI | Categoría + confianza en &lt; 1 s (tras warm-up) |
| 2:30 | Result | Scroll → **View full SHAP analysis** | No es caja negra; drivers ordenados por impacto |
| 3:30 | Result → Simulation | **Run simulation** | Continuidad del caso baseline |
| 4:00 | Simulation | Previous admissions → **2**, Glucose → **140** → Recalculate | Intervención clínica hipotética (~−21 pp vs baseline) |
| 4:30 | Simulation | Waterfall / delta | Qué drivers mueven el riesgo + **animación gauge** (~800 ms) |
| 5:00 | Evaluation (opcional) | Escenario **Moderate risk profile** → predict (~49.9% medium) | Contraste narrativo low / medium / high |
| 5:30 | History | Última predicción del ensayo | PostgreSQL + trazabilidad |
| 6:30 | Analytics | KPIs + tendencia | Capa analítica para gestores |
| 7:30 | Settings (opcional) | Dark mode · pestaña Models | Enterprise UX + gobernanza ML |
| 8:30 | Cierre | Mostrar URL prod + `/health` `ml_ready` | Arquitectura cloud y CDSS explicable |

### Variante corta (sin animación perceptible)

Si `prefers-reduced-motion` está activo en el SO, el gauge salta al valor final; mencionar verbalmente el delta numérico.

### Escenario alternativo para simulación

Usar tarjeta **Intervention simulation** (mismos valores que high-risk). La *Demo tip* en la tarjeta dice: *After predict, open Simulation and reduce Previous admissions to 2 and Glucose to 140.*

### Scores validados (LR v1.0.0, umbrales 0.6 / 0.35)

| Escenario | Riesgo esperado | Score aprox. |
|---|---|---|
| High readmission risk | High | 82.5% |
| Moderate risk profile | Medium | 49.9% |
| Low risk — stable outpatient | Low | 34.9% |
| Intervention simulation (baseline) | High | 82.5% → tras sim ~61% (sigue high; ideal para mostrar delta) |

### Comportamiento UI (para el presentador)

- Clic en escenario → prefill instantáneo; tarjeta con `aria-pressed` visual.
- Editar cualquier campo manualmente → deselecciona el escenario (no hay conflicto).
- Durante *Generating prediction…* las tarjetas demo quedan deshabilitadas.
- El usuario debe pulsar **Generate AI Prediction**; no hay auto-predict al elegir escenario.

---

## Criterios de cierre (Definition of Done)

### T-907 cerrado cuando:

- [x] 4 escenarios cargan el formulario correctamente
- [x] Vitest verde en archivos nuevos/modificados (`clinicalDemoScenarios`, `ClinicalDemoScenarioPanel`, `EvaluationPage`, `ClinicalEvaluationForm`)
- [ ] Manual Phase-10 escenarios (MT-P10-SCEN-001 a 003) ejecutado en local **y** en Vercel
- [x] Guion T-810 actualizado con tiempos y frases (esta sección)

### T-908 cerrado cuando:

- [x] Animación visible en recálculo simulación (light + dark)
- [x] `prefers-reduced-motion` respetado
- [x] Vitest verde
- [ ] Ensayo T-903 incluye momento animación sin glitches

---

## Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| Escenario no devuelve riesgo esperado | Validar payloads con API; ajustar valores; badge dice *expected* |
| Animación molesta en demo larga | Duración ≤ 1s; reduced motion |
| Cold start Render | Calentar `/health` antes; T-901 seeds estables |
| Scope creep | No SHAP diff ni backend en esta fase |
