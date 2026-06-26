import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardRiskDistributionChart } from "@/components/dashboard/DashboardRiskDistributionChart";
import type { RiskDistributionItem } from "@/types/analytics";

const demoDistribution: RiskDistributionItem[] = [
  { risk_level: "low", count: 8, percentage: 53.3 },
  { risk_level: "medium", count: 5, percentage: 33.3 },
  { risk_level: "high", count: 2, percentage: 13.4 },
];

describe("DashboardRiskDistributionChart", () => {
  it("renders risk distribution chart from dashboard payload", () => {
    const { container } = render(
      <DashboardRiskDistributionChart distribution={demoDistribution} />,
    );

    expect(screen.getByRole("heading", { name: /risk distribution/i })).toBeInTheDocument();
    expect(screen.getByText(/uc-011/i)).toBeInTheDocument();
    expect(screen.getByText(/15 evaluations in scope/i)).toBeInTheDocument();
    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument();
  });

  it("shows empty state when there are no evaluations", () => {
    render(
      <DashboardRiskDistributionChart
        distribution={[
          { risk_level: "low", count: 0, percentage: 0 },
          { risk_level: "medium", count: 0, percentage: 0 },
          { risk_level: "high", count: 0, percentage: 0 },
        ]}
      />,
    );

    expect(screen.getByText(/no evaluations yet/i)).toBeInTheDocument();
  });
});
