# MedScope AI — Design Documentation

Visual source of truth for frontend implementation.

## Start here

1. `project-brief.md` — scope, screens, audience
2. `design-system.light.md` — **default** tokens and components (MVP)
3. `screens/README.md` — mockup catalog per page
4. `design-system.dark.md` — optional dark theme (post-MVP)

## Theme priority

| Theme | File | Status |
|---|---|---|
| Light | `design-system.light.md` | **MVP** (RUX-010) |
| Dark | `design-system.dark.md` | Optional (§18) |

## Folder structure

```
docs/Design/
├── README.md
├── project-brief.md
├── design-system.light.md
├── design-system.dark.md
└── screens/
    ├── splash/          # light + dark variants
    ├── login/
    ├── dashboard/
    ├── prediction-form/
    ├── prediction-result/
    ├── simulation/
    ├── history/
    ├── analytics/
    ├── settings/        # optional
    ├── support/         # optional
    └── system-status/   # optional
```

Each screen folder (except splash) contains:
- `mockup.png` — visual reference
- `reference.html` — Tailwind/HTML implementation reference

Splash folder uses: `light.mockup.png`, `dark.mockup.png`, `*.reference.html`, `background-corridor.png`.

## Rules for AI agents

1. Read `design-system.light.md` before any UI work.
2. Open the matching `screens/<name>/` mockup before building a page.
3. Use YAML tokens — do not invent colors.
4. Dark mode is out of MVP unless explicitly requested.

## Related documentation

- `docs/Requirements/Requirements.md` — RFW-*, RUX-*
- `docs/Use Cases/Use Cases.md` — UC-100–103
- `skills/ui-ux/SKILL.md` — UX rules
- `skills/frontend/SKILL.md` — React implementation
