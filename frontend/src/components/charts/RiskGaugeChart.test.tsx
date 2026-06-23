import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RiskGaugeChart } from "@/components/charts/RiskGaugeChart";

describe("RiskGaugeChart", () => {
  it("renders risk percent and level in accessible label", () => {
    render(<RiskGaugeChart riskPercent={78.2} riskLevel="high" />);

    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/78\.2 percent/i),
    );
    expect(screen.getByText("HIGH RISK")).toBeInTheDocument();
    expect(screen.getByText(/78\.2/)).toBeInTheDocument();
  });

  it("clamps percent display to 0–100", () => {
    render(<RiskGaugeChart riskPercent={150} riskLevel="high" />);

    expect(screen.getByText(/100\.0/)).toBeInTheDocument();
  });

  it("applies RUX-011 risk color classes per level", () => {
    const { rerender } = render(<RiskGaugeChart riskPercent={78} riskLevel="high" />);
    expect(screen.getByText("HIGH RISK")).toHaveClass("text-risk-high");

    rerender(<RiskGaugeChart riskPercent={42} riskLevel="medium" />);
    expect(screen.getByText("MEDIUM RISK")).toHaveClass("text-risk-medium");

    rerender(<RiskGaugeChart riskPercent={18} riskLevel="low" />);
    expect(screen.getByText("LOW RISK")).toHaveClass("text-risk-low");
  });

  it("shows custom title", () => {
    render(
      <RiskGaugeChart
        riskPercent={25}
        riskLevel="low"
        title="Readmission probability"
      />,
    );

    expect(screen.getByText(/readmission probability/i)).toBeInTheDocument();
  });
});
