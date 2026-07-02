# Phase 10 — Demo playbook & simulation animation (Fase 9b)

Checklist manual para **T-907** (escenarios clínicos) y **T-908** (animación gauge en simulación).

**Plan maestro:** [Demo-Playbook-Plan.md](../../Demo/Demo-Playbook-Plan.md)  
**Aplicación en inglés.** Documento en español para ejecución y defensa.

| Bloque | Tarea | Estado implementación |
|---|---|---|
| Escenarios clínicos | T-907 | Implementado — ejecutar checklist SCEN |
| Animación simulación | T-908 | Implementado — ejecutar checklist ANIM |

---

## Precondiciones

- [ ] Stack local (`.\scripts\start-dev.ps1`) **o** producción Vercel + Render calentado
- [ ] Login `clinician@medscope.ai` / `MedScope123!`
- [ ] En **prod**: abrir `https://medscope-ai-q8tg.onrender.com/health` y confirmar `ml_ready: true` antes del flujo predict

**URLs producción**

| Recurso | URL |
|---|---|
| Login | https://medscope-ai-delta.vercel.app/login |
| Evaluation | https://medscope-ai-delta.vercel.app/evaluation |
| Health (warm-up) | https://medscope-ai-q8tg.onrender.com/health |

---

## MT-P10-SCEN-001 — Panel de escenarios en Evaluation

1. Ir a `/evaluation` (sidebar **Evaluation**).
2. Verificar sección **Demo clinical scenarios** con subtítulo *De-identified synthetic cases for training and demonstration*.
3. Verificar **4 tarjetas** con icono, vignette EN y badge de riesgo (*LOW / MEDIUM / HIGH RISK*).
4. Clic en **Low risk — stable outpatient**.
5. Comprobar prefill: Age **42**, Blood glucose **108**, Previous admissions **0**, Biological sex **Female**.
6. Clic en **High readmission risk** → Age **72**, Glucose **198**, Previous admissions **5**.
7. Clic en **Moderate risk profile** → Age **58**, Glucose **165**, Previous admissions **1**.

**Esperado:** prefill instantáneo; formulario sigue editable; sin error de consola.

- [ ] OK local
- [ ] OK producción (Vercel)

---

## MT-P10-SCEN-002 — Selección y edición manual

1. En `/evaluation`, clic **High readmission risk** (tarjeta resaltada / seleccionada).
2. Cambiar **Age** manualmente (p. ej. 73).
3. Verificar que la tarjeta high-risk **ya no** aparece como seleccionada.
4. Sin elegir escenario, pulsar **Generate AI Prediction** con valores por defecto del formulario.

**Esperado:** edición manual deselecciona escenario; predict con defaults sigue funcionando.

- [ ] OK local
- [ ] OK producción

---

## MT-P10-SCEN-003 — Predicción desde escenario alto riesgo

1. Recargar `/evaluation`.
2. Clic **High readmission risk**.
3. Pulsar **Generate AI Prediction** (texto durante envío: *Generating prediction…*).
4. Verificar que las tarjetas demo están **deshabilitadas** mientras carga.
5. En **Prediction Result**: gauge + categoría **high** (score ~82% con LR v1.0.0).
6. Resumen XAI y sección SHAP visibles.
7. Ir a **History** → última entrada presente.

**Esperado:** flujo completo sin 422; persistencia en historial.

- [ ] OK local
- [ ] OK producción

---

## MT-P10-SCEN-004 — Escenarios medium y low

| Escenario | Age | Glucose | Admissions | Riesgo esperado |
|---|---|---|---|---|
| Moderate risk profile | 58 | 165 | 1 | Medium (~50%) |
| Low risk — stable outpatient | 42 | 108 | 0 | Low (~35%) |

1. Cargar cada escenario → **Generate AI Prediction**.
2. Confirmar categoría coherente con la tabla (badge en tarjeta es *expected*, no garantía absoluta).

**Esperado:** contraste narrativo claro entre low / medium / high.

- [ ] OK local
- [ ] OK producción

---

## MT-P10-SCEN-005 — Escenario simulation showcase

1. Clic **Intervention simulation**.
2. Leer *Demo tip* en la tarjeta: *reduce Previous admissions to 2 and Glucose to 140*.
3. **Generate AI Prediction** → en resultado, **Run simulation**.
4. En Simulation: Previous admissions → **2**, Glucose → **140** → **Recalculate**.
5. Comparar riesgo simulado vs original (delta negativo; suele bajar ~20 pp).

**Esperado:** riesgo simulado menor que original; waterfall / drivers visibles.

- [ ] OK local
- [ ] OK producción

---

## MT-P10-ANIM-001 — Animación gauge en simulación

1. Tener predicción baseline de riesgo alto (escenario **Intervention simulation** recomendado).
2. En Simulation, cambiar una variable material → **Recalculate** (o esperar debounce del slider).
3. Observar gauge **simulado**: transición animada desde valor anterior (~800 ms, ease-out).
4. Repetir segundo recálculo: anima desde último valor simulado.

**Esperado:** movimiento fluido; sin layout shift; delta badge correcto.

- [ ] OK local
- [ ] OK producción

---

## MT-P10-ANIM-002 — prefers-reduced-motion

1. Activar *reducir movimiento* en SO o DevTools.
2. Recalculate en Simulation.

**Esperado:** valor final instantáneo, sin animación prolongada.

- [ ] OK

---

## MT-P10-ANIM-003 — Dark mode

1. Settings → Appearance → Dark.
2. Repetir MT-P10-ANIM-001.

**Esperado:** colores gauge legibles; animación sin artefactos.

- [ ] OK

---

## MT-P10-DEMO-001 — Guion completo (ensayo T-903)

Seguir [Argumentario-Defensa.md](../../Thesis/Argumentario-Defensa.md) (guion §5) o [Demo-Playbook-Plan § guion](../../Demo/Demo-Playbook-Plan.md#guion-de-defensa-t-810--t-903--t-907-05) en **≤ 10 min**.

| Paso | OK |
|---|---|
| Warm-up `/health` (prod) | [ ] |
| Login → Dashboard | [ ] |
| Escenario High → Generate AI Prediction → SHAP | [ ] |
| Simulation (adm 2, glucose 140) | [ ] |
| History → Analytics | [ ] |
| (Opcional) Moderate/Low + Dark / Models | [ ] |

**Notas de ensayo:**

| Fecha | Entorno | Duración | Incidencias |
|---|---|---|---|
| | local / prod | min | |

---

## Referencias

- [TaskTracker T-907 / T-908](../../TaskTracker.md#fase-9b--demo-wow-tfm)
- [Phase-09 Production Smoke](Phase-09-Production-Smoke.md)
- [Deployment URLs](../../Deployment/Deployment.md)
