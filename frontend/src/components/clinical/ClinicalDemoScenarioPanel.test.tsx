import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ClinicalDemoScenarioPanel } from "@/components/clinical/ClinicalDemoScenarioPanel";
import { getClinicalDemoScenario } from "@/lib/clinicalDemoScenarios";

async function expandDemoScenarios(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /show demo clinical scenarios/i }));
}

describe("ClinicalDemoScenarioPanel", () => {
  it("starts collapsed and hides scenario cards by default", () => {
    render(<ClinicalDemoScenarioPanel onSelectScenario={vi.fn()} />);

    expect(screen.getByText("Demo clinical scenarios")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /show demo clinical scenarios/i }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("list", { name: /demo clinical scenarios/i })).not.toBeInTheDocument();
  });

  it("expands and collapses scenario cards from the header toggle", async () => {
    const user = userEvent.setup();
    render(<ClinicalDemoScenarioPanel onSelectScenario={vi.fn()} />);

    await expandDemoScenarios(user);
    expect(screen.getByRole("list", { name: /demo clinical scenarios/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /hide demo clinical scenarios/i }),
    ).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("button", { name: /hide demo clinical scenarios/i }));
    expect(screen.queryByRole("list", { name: /demo clinical scenarios/i })).not.toBeInTheDocument();
  });

  it("shows the active scenario in the header when collapsed", () => {
    render(
      <ClinicalDemoScenarioPanel
        selectedScenarioId="moderate-risk"
        onSelectScenario={vi.fn()}
      />,
    );

    expect(screen.getByText(/active scenario:/i)).toBeInTheDocument();
    expect(screen.getByText("Moderate risk profile")).toBeInTheDocument();
  });

  it("renders section copy and four scenario cards", () => {
    render(<ClinicalDemoScenarioPanel defaultExpanded onSelectScenario={vi.fn()} />);

    expect(screen.getByText("Demo clinical scenarios")).toBeInTheDocument();
    expect(
      screen.getByText(/de-identified synthetic cases for training and demonstration/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("list", { name: /demo clinical scenarios/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /load demo scenario/i })).toHaveLength(4);
  });

  it("shows scenario titles, vignettes, and expected risk badges", () => {
    render(<ClinicalDemoScenarioPanel defaultExpanded onSelectScenario={vi.fn()} />);

    expect(screen.getByText("High readmission risk")).toBeInTheDocument();
    expect(screen.getByText(/72F with five prior admissions/i)).toBeInTheDocument();
    expect(screen.getByText("LOW RISK")).toBeInTheDocument();
    expect(screen.getByText("MEDIUM RISK")).toBeInTheDocument();
    expect(screen.getAllByText("HIGH RISK")).toHaveLength(2);
  });

  it("shows simulation demo tip on the showcase scenario", () => {
    render(<ClinicalDemoScenarioPanel defaultExpanded onSelectScenario={vi.fn()} />);

    expect(screen.getByText(/demo tip:/i)).toBeInTheDocument();
    expect(screen.getByText(/reduce previous admissions to 2/i)).toBeInTheDocument();
  });

  it("calls onSelectScenario with the clicked scenario", async () => {
    const user = userEvent.setup();
    const onSelectScenario = vi.fn();

    render(<ClinicalDemoScenarioPanel defaultExpanded onSelectScenario={onSelectScenario} />);

    await user.click(
      screen.getByRole("button", { name: /load demo scenario: moderate risk profile/i }),
    );

    expect(onSelectScenario).toHaveBeenCalledTimes(1);
    expect(onSelectScenario).toHaveBeenCalledWith(getClinicalDemoScenario("moderate-risk"));
  });

  it("marks the selected scenario with aria-pressed", () => {
    render(
      <ClinicalDemoScenarioPanel
        defaultExpanded
        selectedScenarioId="low-risk-stable"
        onSelectScenario={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /load demo scenario: low risk/i }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: /load demo scenario: high readmission risk/i }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("disables scenario buttons when disabled", () => {
    render(<ClinicalDemoScenarioPanel defaultExpanded onSelectScenario={vi.fn()} disabled />);

    for (const button of screen.getAllByRole("button", { name: /load demo scenario/i })) {
      expect(button).toBeDisabled();
    }
  });
});
