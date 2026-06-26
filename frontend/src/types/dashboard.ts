/** Dashboard API types (aligned with backend/schemas/dashboard.py). */

import type { RiskDistributionItem } from "@/types/analytics";
import type { HistoryListItem } from "@/types/history";

/** Clinical dashboard KPI cards (RF-011). */
export interface DashboardKpis {
  total_evaluations: number;
  average_risk_percent: number;
  high_risk_count: number;
  low_risk_count: number;
  medium_risk_count: number;
  evaluations_last_24h: number;
}

/** Clinical dashboard overview (UC-010). */
export interface DashboardResponse {
  kpis: DashboardKpis;
  risk_distribution: RiskDistributionItem[];
  recent_evaluations: HistoryListItem[];
  high_risk_alerts: HistoryListItem[];
}
