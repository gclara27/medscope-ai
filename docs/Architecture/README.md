# Architecture documentation

Technical architecture artifacts for the TFM (RAC-001) and thesis defense.

| Document | Purpose |
|---|---|
| [System-Architecture.md](System-Architecture.md) | Component diagram: frontend → backend → ML → PostgreSQL (T-803) |
| [ML-Pipeline-Diagram.md](ML-Pipeline-Diagram.md) | ML pipeline train → serialize → infer: offline, artifacts, runtime (T-804) |
| [ER-Diagram.md](ER-Diagram.md) | Entity-relationship diagram: MVP tables, cardinality, persistence flows (T-805) |
| [Deployment-Diagram.md](Deployment-Diagram.md) | Docker compose dev + Supabase/Render/Vercel prod + CI/CD (T-806) |
| [Frontend-Navigation.md](Frontend-Navigation.md) | React Router map, sidebar, RBAC, clinical and demo flows (T-807) |
| [Sequence-Diagrams.md](Sequence-Diagrams.md) | UML-style Mermaid sequence diagrams for critical user and system flows (T-811) |
| [../ML/ML-Pipeline.md](../ML/ML-Pipeline.md) | ML narrative: methodology, dataset, models, results (RAC-010) |
| [../Deployment/Deployment.md](../Deployment/Deployment.md) | Step-by-step production deploy guide (UC-124) |
| [../Database/Database.md](../Database/Database.md) | Schema narrative, migrations, security |

## Diagram backlog (Fase 8)

| Task | Type | Status |
|---|---|---|
| T-803 | Component architecture | Done — System-Architecture.md |
| T-804 | ML pipeline (train → deploy) | Done — ML-Pipeline-Diagram.md |
| T-805 | ER diagram | Done — ER-Diagram.md |
| T-806 | Docker / cloud deployment | Done — Deployment-Diagram.md |
| T-807 | Frontend navigation map | Done — Frontend-Navigation.md |
| T-811 | UC sequence diagrams | Done — Sequence-Diagrams.md |
