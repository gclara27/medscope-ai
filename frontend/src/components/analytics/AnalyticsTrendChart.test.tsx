import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnalyticsTrendChart } from "@/components/analytics/AnalyticsTrendChart";
import { renderWithTheme } from "@/test/renderWithTheme";
import type { TrendPoint } from "@/types/analytics";

const demoTrend: TrendPoint[] = [
  { date: "2026-06-10", count: 4, average_risk_percent: 38.2 },
  { date: "2026-06-11", count: 8, average_risk_percent: 43.1 },
];

describe("AnalyticsTrendChart", () => {
  it("renders trend chart from analytics payload", () => {
    const { container } = renderWithTheme(<AnalyticsTrendChart trend={demoTrend} />);

    expect(
      screen.getByRole("heading", { name: /prediction volume and average risk/i }),
    ).toBeInTheDocument();
    expect(container.querySelector(".recharts-responsive-container")).toBeInTheDocument();
  });

  it("shows empty state when trend is empty", () => {
    renderWithTheme(<AnalyticsTrendChart trend={[]} />);

    expect(screen.getByText(/no trend data in the selected period/i)).toBeInTheDocument();
  });
});
