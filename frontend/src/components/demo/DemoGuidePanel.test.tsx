import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DemoGuidePanel } from "@/components/demo/DemoGuidePanel";
import { DemoStepProgress } from "@/components/demo/DemoStepProgress";

describe("DemoGuidePanel", () => {
  it("renders guide copy and primary action with continue icon", () => {
    render(
      <DemoGuidePanel
        title="Generate the risk score"
        body="Click to run the model."
        actionLabel="Generate AI prediction"
        onAction={() => undefined}
      />,
    );

    expect(screen.getByRole("heading", { name: /generate the risk score/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generate ai prediction/i })).toBeInTheDocument();
  });
});

describe("DemoStepProgress", () => {
  it("renders the demo stepper", () => {
    render(
      <DemoStepProgress
        currentStepId="explain"
        caseLoaded
        predictionReady
        simulationReady={false}
      />,
    );

    expect(screen.getByRole("navigation", { name: /demo progress/i })).toBeInTheDocument();
    expect(screen.getByText("Explainability")).toBeInTheDocument();
  });

  it("navigates when a reachable step label is clicked", async () => {
    const user = userEvent.setup();
    const onStepSelect = vi.fn();

    render(
      <DemoStepProgress
        currentStepId="simulate"
        caseLoaded
        predictionReady
        simulationReady
        onStepSelect={onStepSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: /go to explainability/i }));

    expect(onStepSelect).toHaveBeenCalledWith("explain");
  });

  it("locks future steps until prerequisites are met", () => {
    render(
      <DemoStepProgress
        currentStepId="case"
        caseLoaded
        predictionReady={false}
        simulationReady={false}
        onStepSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /go to ai prediction/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /go to explainability/i })).not.toBeInTheDocument();
    expect(screen.getByText("Explainability")).toBeInTheDocument();
  });
});
