# Phase 09 — Production smoke test (cloud)

Checklist manual para validar el MVP desplegado en **Vercel + Render + Supabase** (UC-124).

**Aplicación en inglés.** Documento en español para la defensa del TFM.

---

## URLs de producción

| Recurso | URL |
|---|---|
| Login | https://medscope-ai-delta.vercel.app/login |
| Dashboard | https://medscope-ai-delta.vercel.app/dashboard |
| API health | https://medscope-ai-q8tg.onrender.com/health |
| API docs | https://medscope-ai-q8tg.onrender.com/docs |

Guía completa: [Deployment.md](../../Deployment/Deployment.md)

---

## Antes de empezar

- [ ] Abrir `/health` en Render **2–3 minutos antes** (cold start free tier).
- [ ] Confirmar Supabase **activo** (no pausado).
- [ ] Usar credenciales demo o usuario propio.
- [ ] **Seeds (T-901):** `python scripts/verify_demo_seeds.py` → 4/4 login OK en Render.

| Email | Password (seed) | Rol |
|---|---|---|
| `admin@medscope.ai` | `MedScope123!` | admin |
| `clinician@medscope.ai` | `MedScope123!` | clinician |
| `analyst@medscope.ai` | `MedScope123!` | analyst |
| `nurse@medscope.ai` | `MedScope123!` | nurse |

---

## Checklist

### Infraestructura

- [ ] `GET /health` → `{"status":"ok","ml_ready":true}`
- [ ] **Estabilidad (T-906):** `.\scripts\verify-demo-stability.ps1 -Production` — sin errores críticos en flujo demo
- [ ] `/docs` carga Swagger en Render
- [ ] Recargar `/dashboard` en Vercel no da 404 (SPA `vercel.json`)

### Autenticación (UC-001)

- [ ] `python scripts/verify_demo_seeds.py` — los 4 usuarios demo autentican en Render
- [ ] Login desde Vercel → redirige a dashboard
- [ ] Logout cierra sesión
- [ ] Usuario sin permiso no accede a rutas admin

### Predicción + SHAP (UC-020, UC-030)

- [ ] Evaluation → generar predicción
- [ ] Score de riesgo y categoría visibles
- [ ] Gráfico / lista SHAP visible
- [ ] Registro aparece en Supabase (`predictions`, `shap_explanations`)

### Simulación (UC-040–043)

- [ ] Modificar variable clínica → nuevo score
- [ ] Comparación original vs simulado

### Historial (UC-050–052)

- [ ] Lista de predicciones carga
- [ ] Detalle histórico con inputs + SHAP

### Analytics (UC-060)

- [ ] KPIs y gráficos cargan
- [ ] Filtro de fechas responde

### Errores esperados (no son fallos)

- [ ] `GET https://medscope-ai-q8tg.onrender.com/` → `404` (API sin página raíz)
- [ ] Primera petición tras inactividad puede tardar 30–90 s (Render free)

---

## Registro de ejecución

| Fecha | Ejecutor | Resultado | Notas |
|---|---|---|---|
| 2026-07-02 | — | ✅ OK | T-906 verify-demo-stability prod: health, seeds, golden, predict 392ms, frontend |
| 2026-06-30 | — | ✅ OK | Deploy inicial verificado |

---

## Referencias

- [Deployment.md](../../Deployment/Deployment.md)
- [Testing.md](../Testing.md)
- [UC-124 Cloud Deployment](../../Use%20Cases/Use%20Cases.md#uc-124--cloud-deployment)
