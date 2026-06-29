import { RISK_COLORS as RISK_COLOR_HEX, RISK_GAUGE_TRACK_COLOR } from "../../riskColors.js";

import type { RiskLevel } from "@/types/prediction";

/** Hex fills for SVG/Recharts (RUX-011). Source: `frontend/riskColors.js`. */
export const RISK_COLORS: Record<RiskLevel, string> = RISK_COLOR_HEX;

export { RISK_GAUGE_TRACK_COLOR };

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
};

export const RISK_BADGE_LABELS: Record<RiskLevel, string> = {
  low: "LOW RISK",
  medium: "MEDIUM RISK",
  high: "HIGH RISK",
};

/** Tailwind utility bundles for risk level UI (RUX-011). */
export const RISK_TEXT_CLASSES: Record<RiskLevel, string> = {
  low: "text-risk-low",
  medium: "text-risk-medium",
  high: "text-risk-high",
};

export const RISK_BADGE_CLASSES: Record<RiskLevel, string> = {
  low: "border border-risk-low/45 bg-risk-low/12 text-risk-low",
  medium: "border border-risk-medium/55 bg-risk-medium/18 text-risk-medium",
  high: "border border-risk-high/60 bg-risk-high/22 text-risk-high shadow-[inset_0_0_0_1px_rgb(var(--color-risk-high)/0.2)]",
};

export const RISK_STYLES: Record<RiskLevel, string> = {
  low: "border border-risk-low/45 bg-risk-low/12 text-risk-low",
  medium: "border border-risk-medium/55 bg-risk-medium/18 text-risk-medium",
  high: "border border-risk-high/60 bg-risk-high/22 text-risk-high shadow-[inset_0_0_0_1px_rgb(var(--color-risk-high)/0.2)]",
};

export const RISK_RECOMMENDATIONS: Record<RiskLevel, string> = {
  low: "Standard discharge planning and routine follow-up appear appropriate for this risk profile.",
  medium:
    "Consider enhanced care coordination and closer post-discharge monitoring for this patient.",
  high: "Prioritize multidisciplinary review and proactive intervention planning before discharge.",
};

export function clampRiskPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}
