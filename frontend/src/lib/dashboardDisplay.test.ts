import { describe, expect, it } from "vitest";

import {
  formatDashboardRiskPercent,
  formatEstimatedReadmissionsHint,
  formatRecentEvaluationsHint,
  formatStableConditionHint,
} from "@/lib/dashboardDisplay";

describe("dashboardDisplay", () => {
  const kpis = {
    total_evaluations: 10,
    average_risk_percent: 33.3,
    high_risk_count: 2,
    low_risk_count: 6,
    medium_risk_count: 2,
    evaluations_last_24h: 3,
  };

  it("formats risk percent and hints", () => {
    expect(formatDashboardRiskPercent(33.333)).toBe("33.3%");
    expect(formatEstimatedReadmissionsHint(kpis)).toMatch(/patients flagged/i);
    expect(formatStableConditionHint(kpis)).toBe("6 low-risk evaluations");
    expect(formatRecentEvaluationsHint(kpis)).toMatch(/last 24 hours/i);
  });
});
