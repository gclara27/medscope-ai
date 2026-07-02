# Sequence diagrams — critical flows

UML-style **sequence diagrams** (Mermaid) for thesis defense and RAC-001 traceability.

**Task:** T-811 · **Related:** [Use Cases](../Use%20Cases/Use%20Cases.md) · [ML inference §8.2](../ML/ML-Pipeline.md#82-diagrama-de-inferencia-integración-backend)

---

## Index

| # | Flow | Use cases | Persistence |
|---|---|---|---|
| 1 | [Login](#1-login-uc-001) | UC-001 | JWT client-side |
| 2 | [Prediction + SHAP](#2-clinical-prediction--shap-uc-020--uc-030) | UC-020, UC-030, UC-023 | PostgreSQL |
| 3 | [Clinical simulation](#3-clinical-simulation-uc-040--uc-043) | UC-040, UC-043, UC-044 | PostgreSQL |
| 4 | [Prediction history](#4-prediction-history-uc-052) | UC-052 | Read-only |
| 5 | [Support ticket](#5-support-ticket-uc-065) | UC-065 | Mailto (no DB) |
| 6 | [Public explore demo](#6-public-explore-demo-uc-066) | UC-066 | None (ephemeral) |

Other diagrams: [ML inference](ML-Pipeline-Diagram.md) · [Deployment / CI/CD](Deployment-Diagram.md) · [ER](ER-Diagram.md) · [Frontend navigation](Frontend-Navigation.md)

---

## 1. Login (UC-001)

```mermaid
sequenceDiagram
    actor User
    participant UI as LoginPage
    participant API as POST /auth/login
    participant Auth as AuthService
    participant DB as PostgreSQL

    User->>UI: email + password
    UI->>API: credentials
    API->>Auth: validate
    Auth->>DB: UserRepository.get_by_email
    DB-->>Auth: user + role
    Auth->>Auth: bcrypt verify
    Auth-->>API: JWT + user profile
    API-->>UI: 200 + token
    UI->>UI: persist session (localStorage)
    UI-->>User: redirect /dashboard
```

---

## 2. Clinical prediction + SHAP (UC-020 · UC-030)

```mermaid
sequenceDiagram
    actor Clinician
    participant UI as EvaluationPage
    participant API as POST /predict
    participant SVC as PredictionService
    participant ML as ML registry
    participant DB as PostgreSQL

    Clinician->>UI: submit clinical form
    UI->>API: PredictRequest + JWT
    API->>SVC: create prediction
    SVC->>ML: infer + SHAP
    ML-->>SVC: risk_score, explanations
    SVC->>DB: INSERT prediction, patient_input, shap_explanations
    DB-->>SVC: prediction id
    SVC-->>API: PredictResponse
    API-->>UI: risk %, band, SHAP, summary
    UI-->>Clinician: result + explainability view
```

---

## 3. Clinical simulation (UC-040 · UC-043)

```mermaid
sequenceDiagram
    actor Clinician
    participant UI as SimulationPage
    participant API as POST /simulate
    participant SVC as SimulationService
    participant ML as ML registry
    participant DB as PostgreSQL

    Clinician->>UI: modify variables + recalculate
    UI->>API: baseline + modifications + JWT
    API->>SVC: run simulation
    SVC->>ML: infer modified profile
    ML-->>SVC: simulated risk + delta
    SVC->>DB: INSERT simulation, simulation_inputs
    DB-->>SVC: simulation id
    SVC-->>API: SimulateResponse
    API-->>UI: original vs simulated gauges
    UI-->>Clinician: comparison + impact chart
```

---

## 4. Prediction history (UC-052)

```mermaid
sequenceDiagram
    actor User
    participant UI as HistoryPage
    participant API as GET /history
    participant SVC as HistoryService
    participant DB as PostgreSQL

    User->>UI: open /history
    UI->>API: filters + JWT
    API->>SVC: list evaluations
    SVC->>DB: SELECT predictions (role-scoped)
    DB-->>SVC: rows + summaries
    SVC-->>API: paginated list
    API-->>UI: HistoryResponse
    UI-->>User: table + risk badges

    User->>UI: open detail row
    UI->>API: GET /history/{id}
    API->>SVC: get by id
    SVC->>DB: prediction + SHAP + inputs
    DB-->>SVC: full record
    SVC-->>API: detail DTO
    API-->>UI: HistoryDetailPage
```

---

## 5. Support ticket (UC-065)

```mermaid
sequenceDiagram
    actor User
    participant UI as SupportPage
    participant Mail as mailto: handler

    User->>UI: fill category, priority, description
    User->>UI: Submit to IT Support
    UI->>UI: validate description
    UI->>Mail: open mailto(support_email, subject, body)
    Mail-->>User: default email client
    Note over UI,Mail: No ticket row in DB (MVP mailto flow)
```

---

## 6. Public explore demo (UC-066)

```mermaid
sequenceDiagram
    actor Visitor
    participant Splash as SplashPage
    participant Demo as DemoPlaygroundPage
    participant API as POST /demo/*
    participant SVC as DemoService
    participant ML as ML registry

    Visitor->>Splash: Explore demo
    Splash->>Demo: navigate /demo
    Demo->>Demo: load synthetic case (client state)
    Visitor->>Demo: Start guided tour
    Demo->>Demo: /demo/case → /demo/predict
    Visitor->>Demo: Generate AI prediction
    Demo->>API: POST /demo/predict (no JWT)
    API->>SVC: ephemeral infer
    SVC->>ML: same model as production
    ML-->>SVC: risk + SHAP
    SVC-->>API: PredictResponse
    API-->>Demo: display explain step
    Visitor->>Demo: enter simulation step
    Demo->>API: POST /demo/simulate
    API->>SVC: ephemeral simulate
    SVC->>ML: infer modified profile
    ML-->>SVC: delta risk
    SVC-->>API: SimulateResponse
    API-->>Demo: comparison panel
    Note over Demo,ML: No PostgreSQL writes
```

---

*Last updated: T-811 — Fase 8 documentation (jul 2026).*
