import { RISK_LABELS } from "@/lib/riskDisplay";
import type { RiskLevel } from "@/types/prediction";

/** Signed delta label for simulation comparison (RF-042). */
export function formatRiskDelta(delta: number): string {
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)} pts`;
}

/** Delta badge copy: e.g. "-7.0 pts (Medium risk)". */
export function formatRiskDeltaWithLevel(delta: number, riskLevel: RiskLevel): string {
  return `${formatRiskDelta(delta)} (${RISK_LABELS[riskLevel]})`;
}

export function riskDeltaDirection(delta: number): "up" | "down" | "unchanged" {
  if (delta > 0) {
    return "up";
  }
  if (delta < 0) {
    return "down";
  }
  return "unchanged";
}
