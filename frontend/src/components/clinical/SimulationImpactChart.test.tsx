import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SimulationImpactChart } from "@/components/clinical/SimulationImpactChart";
import type { SimulationImpactRow } from "@/lib/simulationImpact";

const rows: SimulationImpactRow[] = [
  {
    fieldKey: "previous_admissions",
    label: "Prior admissions",
    originalValue: "3",
    simulatedValue: "0",
    impactPoints: -4.5,
    barHeightPercent: 100,
  },
  {
    fieldKey: "glucose",
    label: "Blood glucose",
    originalValue: "180",
    simulatedValue: "120",
    impactPoints: -2.5,
    barHeightPercent: 55,
  },
];

describe("SimulationImpactChart", () => {
  it("renders driver impact waterfall for changed variables", () => {
    render(<SimulationImpactChart rows={rows} />);

    expect(screen.getByRole("heading", { name: /driver impact analysis/i })).toBeInTheDocument();
    expect(screen.getByText(/prior admissions/i)).toBeInTheDocument();
    expect(screen.getByText(/blood glucose/i)).toBeInTheDocument();
    expect(screen.getByText("-4.5")).toBeInTheDocument();
    expect(screen.getByText("-2.5")).toBeInTheDocument();
  });

  it("renders nothing when there are no impact rows", () => {
    const { container } = render(<SimulationImpactChart rows={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
