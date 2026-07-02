# Diapositivas — vídeo de defensa TFM

Contenido listo para copiar a **PowerPoint** o **Google Slides**.  
**Duración slides (sin demo):** ~4 min · **Demo app en pantalla:** ~6 min · **Total vídeo:** ~12–14 min.

**Imágenes:** exportar diagramas Mermaid a PNG (Mermaid Live Editor) o usar capturas en `docs/figures/`.

---

## Paleta y estilo

| Token | Valor | Uso |
|---|---|---|
| Primary | `#0058bc` | Títulos, acentos |
| Texto | `#191c1d` | Cuerpo |
| Fondo | `#ffffff` o `#f5f7fa` | Limpio, clínico |
| Fuente títulos | Segoe UI / Inter Bold | |
| Fuente cuerpo | Segoe UI / Inter Regular 18–22 pt | |

Logo: `frontend/public/app-icon.png` o icono del splash.

---

## Slide 1 — Portada

**Layout:** título centrado + tu nombre + máster + fecha.

**Texto en slide:**

```
MedScope AI
Sistema de apoyo a la decisión clínica con IA explicable

[Tu nombre completo]
[Máster / Universidad]
[Mes Año]
```

**Notas:** no leer el título entero; la voz lleva el mensaje (ver guion §0:00).

---

## Slide 2 — El problema

**Título:** El problema clínico

**Bullets:**

- Las readmisiones hospitalarias a 30 días son costosas y evitables en parte
- Los sistemas HIS almacenan datos pero no siempre anticipan el riesgo
- Los modelos de IA sin explicación generan desconfianza en el personal clínico
- Necesidad: **predicción + transparencia + exploración de escenarios**

**Imagen opcional:** icono hospital / gráfico conceptual (sin datos reales).

---

## Slide 3 — La solución

**Título:** MedScope AI — ¿Qué es?

**Bullets:**

- Plataforma web **CDSS** (Clinical Decision Support System)
- Predicción de riesgo de readmisión a 30 días (diabetes, dataset UCI)
- **SHAP:** explicación de qué variables impulsan el riesgo
- **Simulación what-if:** ¿qué pasa si mejoramos glucosa o reducimos admisiones previas?
- **No** es un sistema de diagnóstico ni de prescripción

**Imagen:** `docs/figures/screenshots/01_splash.png` (recortada, sin URL si prefieres).

---

## Slide 4 — Objetivos del TFM

**Título:** Objetivos

**Bullets:**

1. Pipeline ML reproducible offline → producción
2. API REST segura (JWT, roles clínico / analista / admin)
3. Interfaz clínica moderna (React + TypeScript)
4. Persistencia PostgreSQL e historial auditable
5. Despliegue cloud real (Vercel + Render + Supabase)

---

## Slide 5 — Arquitectura del sistema

**Título:** Arquitectura — monolito modular

**Imagen principal:** exportar diagrama de [System-Architecture.md](../Architecture/System-Architecture.md) §1 (Mermaid → PNG).

**Bullets laterales:**

- Frontend: React en **Vercel**
- Backend + ML: FastAPI en **Render** (Docker)
- Base de datos: **PostgreSQL** (Supabase)
- ML: entrenamiento **offline**; inferencia al arranque del API

**Pie:** Un repositorio, tres capas desacopladas — sin microservicios.

---

## Slide 6 — Pipeline de machine learning

**Título:** Pipeline ML — train → serialize → infer

**Imagen:** exportar [ML-Pipeline-Diagram.md](../Architecture/ML-Pipeline-Diagram.md) §1.

**Bullets:**

- Dataset: UCI *Diabetes 130-US hospitals* (101.766 encuentros)
- 19 features clínicas · split 80/20 · `random_state=42`
- Modelos evaluados: Logistic Regression, Random Forest, XGBoost
- Artefactos: `model.pkl`, `preprocessor.pkl`, SHAP background
- **Nunca** se reentrena en cada petición

---

## Slide 7 — Resultados del modelo

**Título:** Resultados ML (test hold-out)

**Tabla en slide:**

| Métrica | Logistic Regression | Random Forest |
|---|---|---|
| Accuracy | 60,7 % | 82,2 % |
| **Recall** | **54,2 %** | 20,1 % |
| ROC-AUC | 0,61 | 0,59 |

**Bullets debajo:**

- **Modelo en producción:** Logistic Regression v1.0.0
- **Criterio:** priorizar recall (detectar readmisiones) frente a accuracy pura
- KPI accuracy &gt; 75 % **no alcanzado** — limitación documentada con honestidad académica

**Imagen opcional:** `docs/figures/eda/02_target_distribution.png` (desbalance de clases).

---

## Slide 8 — Transición a la demo

**Título:** Demostración en producción

**Texto grande (centro):**

```
Demo en vivo
https://medscope-ai-delta.vercel.app
```

**Bullets pequeños:**

- API: `medscope-ai-q8tg.onrender.com`
- Casos sintéticos · sin datos reales de pacientes
- A continuación: recorrido clínico completo

**Nota grabación:** después de esta slide pasas a **compartir pantalla** (app) con tu cámara en PiP.

---

## Slide 9 — Capturas del producto (post-demo o backup)

**Título:** Interfaz clínica — vistas clave

**Layout:** grid 2×2 con capturas:

| | |
|---|---|
| `03_dashboard.png` | `05_prediction_result_shap.png` |
| `06_simulation.png` | `08_analytics.png` |

**Pie:** Capturas reales de la aplicación (Playwright, T-808).

*Usar si el vídeo corta la demo o como refuerzo visual tras la demo en vivo.*

---

## Slide 10 — Calidad e ingeniería

**Título:** Calidad de software

**Bullets:**

- 215+ tests backend (pytest) · cobertura ~95 %
- Tests ML (RTS-010) · E2E Playwright flujo MVP completo
- CI en GitHub Actions · despliegue automático en `main`
- Esquema PostgreSQL en 3NF · migraciones Alembic
- RBAC: admin, clinician, analyst, nurse

**Imagen opcional:** logo GitHub Actions / iconos stack.

---

## Slide 11 — Conclusiones

**Título:** Conclusiones

**Bullets:**

1. CDSS **funcional end-to-end** desplegado en cloud
2. Explicabilidad SHAP y simulación como diferencial frente a un clasificador opaco
3. Arquitectura enterprise lista para evolución (FHIR, multi-centro)
4. Transparencia sobre limitaciones del modelo (precision, generalización)
5. Contribución TFM: **ingeniería + IA explicable**, no solo un porcentaje de accuracy

---

## Slide 12 — Trabajo futuro y cierre

**Título:** Trabajo futuro

**Bullets:**

- Validación externa en otro hospital
- Calibración de umbral y nuevas features
- Integración FHIR / estándares clínicos
- Mejora continua del modelo (ensemble, más datos)

**Texto cierre:**

```
Gracias por su atención
[Tu email / LinkedIn opcional]
```

**Último plano:** cámara solo (tú), sin slide — despedida verbal.

---

## Orden de uso en el vídeo

| Momento vídeo | Slides |
|---|---|
| Intro cámara | — (solo tú) |
| Contexto | 2, 3, 4 |
| Técnico | 5, 6, 7 |
| Puente a demo | 8 |
| **Demo app** | *(ninguna — pantalla completa o PiP)* |
| Refuerzo / cierre | 9 (opcional), 10, 11, 12 |

---

## Exportar diagramas Mermaid a PNG

1. Abrir [mermaid.live](https://mermaid.live)
2. Copiar bloque de `System-Architecture.md` o `ML-Pipeline-Diagram.md`
3. Export PNG 1920×1080
4. Insertar en slides 5 y 6

---

*Complemento de [Guion-Video-Defensa.md](Guion-Video-Defensa.md) — julio 2026.*
