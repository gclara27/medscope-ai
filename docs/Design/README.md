# MedScope AI — Design Documentation

Visual design source of truth for the frontend. Read this folder before implementing UI.

## Priority

| Theme | File | Status |
|---|---|---|
| **Light (default)** | `design-system.light.md` | **MVP** — aligns with Requirements RUX-010 (blanco, gris, azul médico) |
| Dark (optional) | `design-system.dark.md` | Post-MVP — Requirements §18 |

When implementing UI, use **light theme tokens** unless the user explicitly requests dark mode.

## Document index

| File / folder | Purpose |
|---|---|
| `design-system.light.md` | Colors, typography, spacing, components (default) |
| `design-system.dark.md` | Dark variant tokens and rules (optional) |
| `screens/splash/` | Splash screen mockups and HTML reference |
| `screens/README.md` | Screen mockup catalog and mapping to RFW-* |

## Screen mockups

| Screen | Requirement | Assets |
|---|---|---|
| Splash | RFW-010 | `screens/splash/light.png`, `screens/splash/dark.png` |
| Splash (reference HTML) | RFW-010 | `screens/splash/dark-reference.html` |
| Splash background | RFW-010 | `screens/splash/background-corridor.png` |

Other screens (login, dashboard, prediction, etc.) will be added under `screens/` as they are designed.

## Risk indicator colors (all themes)

Per Requirements RUX-011 — use only for clinical risk, never decoratively:

| Level | Color |
|---|---|
| Low | Green |
| Medium | Amber |
| High | Red |

## Implementation mapping

| Design | Code location |
|---|---|
| Color/spacing tokens | `frontend/` Tailwind config |
| Components | `frontend/src/components/` (shadcn/ui + custom) |
| Pages | `frontend/src/pages/` |

## Related documentation

- `docs/Requirements/Requirements.md` — §8.3, §13 (RFW-*, RUX-*)
- `docs/Use Cases/Use Cases.md` — UC-100–103 (UX states)
- `skills/ui-ux/SKILL.md` — UX rules for AI agent
- `skills/frontend/SKILL.md` — React implementation rules

## Rules for AI agents

1. Read `design-system.light.md` before any UI work.
2. Map YAML tokens in the design file frontmatter to Tailwind — do not invent new colors.
3. Consult `screens/` mockups when building a screen that has a reference asset.
4. Dark theme is out of MVP scope unless explicitly requested.
