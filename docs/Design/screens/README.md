# Screen Mockups Catalog

Each folder maps to a frontend page in `frontend/src/pages/`.

## MVP screens

| Folder | RFW | UC | Assets |
|---|---|---|---|
| `splash/` | RFW-010 | UC-012 | `light.mockup.png`, `dark.mockup.png`, `*.reference.html` |
| `login/` | RFW-011 | UC-001 | `mockup.png`, `reference.html` |
| `dashboard/` | RFW-012 | UC-010 | `mockup.png`, `reference.html` |
| `prediction-form/` | RFW-013 | UC-020 | `mockup.png`, `reference.html` |
| `prediction-result/` | RFW-014, RFW-015 | UC-023, UC-030–032 | `mockup.png`, `reference.html` |
| `simulation/` | RFW-016 | UC-040–044 | `mockup.png`, `reference.html` |
| `history/` | RFW-018 | UC-050–052 | `mockup.png`, `reference.html` |
| `analytics/` | RFW-017 | UC-060–062 | `mockup.png`, `reference.html` |

## Optional screens

| Folder | Notes |
|---|---|
| `settings/` | Admin config — post-MVP (RF-070) |
| `support/` | Help center — [UC-064–065](Use%20Cases/Use%20Cases.md#uc-064--access-support-center), RF-072–073 (T-X05) |
| `system-status/` | Ops dashboard — not in Requirements |

## Implementation notes

- `reference.html` files are **design references**, not production code.
- Port layouts to React components; map colors to `design-system.light.md` tokens.
- Gauge charts (RFW-021) appear in `prediction-result/`.
- SHAP bars (RFW-023) appear in `prediction-result/`.
- **Production screenshots (T-808):** [`docs/figures/screenshots/`](../../figures/screenshots/README.md) — captured from running app via Playwright.
