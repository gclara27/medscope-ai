/**
 * Design token pairs for automated contrast checks (RUX-020, T-712).
 * Hex values mirror `index.css` and design-system.light/dark.md.
 */

export interface ContrastPair {
  name: string;
  foreground: string;
  background: string;
  /** WCAG AA threshold — 4.5 normal body text, 3 large/bold UI. */
  minRatio: number;
}

/** Light theme — MVP default. */
export const LIGHT_CONTRAST_PAIRS: ContrastPair[] = [
  { name: "body text on background", foreground: "#191c1d", background: "#f8f9fa", minRatio: 4.5 },
  { name: "body text on card", foreground: "#191c1d", background: "#ffffff", minRatio: 4.5 },
  {
    name: "secondary text on card",
    foreground: "#414755",
    background: "#ffffff",
    minRatio: 4.5,
  },
  { name: "primary on card", foreground: "#0058bc", background: "#ffffff", minRatio: 4.5 },
  { name: "error on card", foreground: "#ba1a1a", background: "#ffffff", minRatio: 4.5 },
  { name: "chart axis on card", foreground: "#414755", background: "#ffffff", minRatio: 4.5 },
  { name: "chart muted on card", foreground: "#5f6672", background: "#ffffff", minRatio: 4.5 },
  {
    name: "risk low readable on card",
    foreground: "#15803d",
    background: "#ffffff",
    minRatio: 4.5,
  },
  {
    name: "risk medium readable on card",
    foreground: "#b45309",
    background: "#ffffff",
    minRatio: 4.5,
  },
  {
    name: "risk high readable on card",
    foreground: "#b91c1c",
    background: "#ffffff",
    minRatio: 4.5,
  },
  {
    name: "on-secondary-container on secondary-container",
    foreground: "#556679",
    background: "#d2e4fb",
    minRatio: 4.5,
  },
];

/** Dark theme — T-X03. */
export const DARK_CONTRAST_PAIRS: ContrastPair[] = [
  { name: "body text on background", foreground: "#dae2fd", background: "#0b1326", minRatio: 4.5 },
  { name: "body text on card", foreground: "#dae2fd", background: "#171f33", minRatio: 4.5 },
  {
    name: "secondary text on card",
    foreground: "#c1c6d7",
    background: "#171f33",
    minRatio: 4.5,
  },
  { name: "primary on card", foreground: "#adc6ff", background: "#171f33", minRatio: 4.5 },
  { name: "chart axis on card", foreground: "#c1c6d7", background: "#171f33", minRatio: 4.5 },
  {
    name: "risk low readable on card",
    foreground: "#4edea3",
    background: "#171f33",
    minRatio: 4.5,
  },
  {
    name: "risk medium readable on card",
    foreground: "#fbbf24",
    background: "#171f33",
    minRatio: 4.5,
  },
  {
    name: "risk high readable on card",
    foreground: "#ff6b6b",
    background: "#171f33",
    minRatio: 4.5,
  },
];
