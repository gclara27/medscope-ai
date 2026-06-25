import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SimulationComparisonPanel } from "@/components/clinical/SimulationComparisonPanel";

describe("SimulationComparisonPanel", () => {
  const originalRisk = { risk_percent: 42, risk_level: "medium" as const };
  const simulatedRisk = { risk_percent: 35, risk_level: "medium" as const };

  it("renders baseline and simulated gauges before recalculation", () => {
    render(
      <SimulationComparisonPanel
        originalRisk={originalRisk}
        simulatedRisk={originalRisk}
        hasSimulationResult={false}
      />,
    );

    expect(screen.getByRole("region", { name: /risk comparison/i })).toBeInTheDocument();
    expect(screen.getByText(/baseline risk score/i)).toBeInTheDocument();
    expect(screen.getByText(/simulated risk score/i)).toBeInTheDocument();
    expect(
      screen.getByText(/adjust variables and recalculate to compare simulated risk/i),
    ).toBeInTheDocument();
  });

  it("shows original, simulated, and delta summary after simulation", () => {
    render(
      <SimulationComparisonPanel
        originalRisk={originalRisk}
        simulatedRisk={simulatedRisk}
        delta={-7}
        hasSimulationResult
      />,
    );

    const summary = screen.getByLabelText(/risk comparison summary/i);
    expect(summary).toBeInTheDocument();
    expect(summary).toHaveTextContent(/original/i);
    expect(summary).toHaveTextContent(/simulated/i);
    expect(summary).toHaveTextContent(/difference/i);
    expect(screen.getByText(/-7\.0 pts \(medium risk\)/i)).toBeInTheDocument();
  });
});
