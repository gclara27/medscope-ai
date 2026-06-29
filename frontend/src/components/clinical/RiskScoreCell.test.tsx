import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RiskScoreCell } from "@/components/clinical/RiskScoreCell";

describe("RiskScoreCell", () => {
  it("renders stacked layout for history tables", () => {
    const { container } = render(<RiskScoreCell riskPercent={62.4} riskLevel="high" />);

    expect(screen.getByText("62.4%")).toBeInTheDocument();
    expect(screen.getByText("HIGH RISK")).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it("renders inline progress bar for dashboard tables", () => {
    const { container } = render(
      <RiskScoreCell riskPercent={49} riskLevel="medium" variant="inline" />,
    );

    expect(screen.getByText("49.0%")).toBeInTheDocument();
    expect(screen.getByText("MEDIUM RISK")).toHaveClass("text-risk-medium-readable");
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
});
