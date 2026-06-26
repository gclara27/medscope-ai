import type { DashboardKpis } from "@/types/dashboard";

export function formatDashboardRiskPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatEstimatedReadmissionsHint(kpis: DashboardKpis): string {
  if (kpis.total_evaluations === 0) {
    return "No evaluations yet";
  }
  if (kpis.high_risk_count === 0) {
    return "No high-risk patients";
  }
  return "Patients flagged for review";
}

export function formatStableConditionHint(kpis: DashboardKpis): string {
  if (kpis.total_evaluations === 0) {
    return "Awaiting data";
  }
  return `${kpis.low_risk_count} low-risk evaluations`;
}

export function formatRecentEvaluationsHint(kpis: DashboardKpis): string {
  if (kpis.evaluations_last_24h === 0) {
    return "No evaluations in the last 24h";
  }
  return "Recorded in the last 24 hours";
}
