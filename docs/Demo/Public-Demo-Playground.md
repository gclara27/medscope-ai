# Public Explore Demo (`/demo`)

Technical reference for the anonymous guided demo playground (T-802a, RAC-001).

## Purpose

Allow visitors to experience the core CDSS workflow **without login or database writes**:

1. Synthetic patient case  
2. Live ML readmission prediction  
3. SHAP explainability  
4. Clinical what-if simulation  

Route: `https://medscope-ai-delta.vercel.app/demo` (production).

## Architecture

```text
Browser (DemoPlaygroundPage)
    → demoApi (axios, no JWT)
    → POST /demo/predict | POST /demo/simulate
    → DemoService (ephemeral)
    → ML registry (same model as /predict)
    → no PostgreSQL persistence
```

| Concern | Authenticated app | Public demo |
|---|---|---|
| Auth | JWT required | None |
| API client | `services/api.ts` | `services/demo.ts` (`demoApi`) |
| Persistence | Predictions, simulations, SHAP rows | None |
| ML model | Production `model.pkl` | Same artifacts |
| Tour state | N/A | URL paths `/demo`, `/demo/case`, … |

## API endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/demo/predict` | Ephemeral prediction + SHAP (body: `PredictRequest`) |
| `POST` | `/demo/simulate` | Ephemeral simulation (body: `DemoSimulateRequest`) |

Implementation: `backend/routers/demo.py`, `backend/services/demo_service.py`, `backend/schemas/demo.py`.

Tests: `backend/tests/test_demo.py`, `frontend/src/pages/DemoPlaygroundPage.test.tsx`.

## Frontend tour

| Step | URL path | UI |
|---|---|---|
| Welcome | `/demo` | Splash CTA “Explore demo” |
| Case | `/demo/case` | Synthetic high-risk vignette |
| Predict | `/demo/predict` | Trigger live inference |
| Explain | `/demo/explain` | Risk gauge + SHAP |
| Simulate | `/demo/simulate` | Pre-filled interventions, auto-recalculate |
| Complete | `/demo/complete` | Sign-in CTA |

Library: `frontend/src/lib/demoTour.ts`. Browser back/forward syncs steps via React Router.

## Infrastructure

- **Vite dev:** proxy `/demo` → `localhost:8000` (`vite.config.ts`)
- **Vercel:** `VITE_API_BASE_URL` must point to Render API (no Vite proxy)
- **nginx Docker:** proxy `/demo/` to backend (`frontend/nginx.conf`)

## Related docs

- Product flow: [Use Cases §10b](../Use%20Cases/Use%20Cases.md#10b-public-explore-demo)
- Sequence diagram: [Sequence-Diagrams.md §6](../Architecture/Sequence-Diagrams.md#6-public-explore-demo-uc-066)
- Authenticated demo scenarios (Evaluation): [Demo-Playbook-Plan.md](Demo-Playbook-Plan.md) (T-907)
