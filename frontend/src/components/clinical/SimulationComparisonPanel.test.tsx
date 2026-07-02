import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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

  it("starts simulated gauge from animateFromPercent when provided (T-908-02)", () => {
    mockReducedMotion(false);

    render(
      <SimulationComparisonPanel
        originalRisk={originalRisk}
        simulatedRisk={simulatedRisk}
        delta={-7}
        hasSimulationResult
        simulatedAnimateFromPercent={42}
        simulationAnimationKey="sim-123"
      />,
    );

    const gauges = screen.getAllByRole("img");
    expect(gauges).toHaveLength(2);
    expect(gauges[1]).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/35\.0 percent/i),
    );
    expect(gauges[1]).toHaveTextContent("42.0");
  });
});

function mockReducedMotion(reduced: boolean) {
  return vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
    matches: reduced && query === "(prefers-reduced-motion: reduce)",
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}
