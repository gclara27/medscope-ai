import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { DemoPlaygroundPage } from "@/pages/DemoPlaygroundPage";

vi.mock("@/services/demo", () => ({
  createDemoPrediction: vi.fn(),
  createDemoSimulation: vi.fn(),
}));

vi.mock("@/utils/scrollToSection", () => ({
  scrollToPageSection: vi.fn(() => true),
}));

import { createDemoPrediction, createDemoSimulation } from "@/services/demo";
import { scrollToPageSection } from "@/utils/scrollToSection";

const mockPrediction = {
  id: "pred-demo-1",
  risk_score: 0.825,
  risk_percent: 82.5,
  risk_level: "high" as const,
  confidence_score: 0.825,
  summary: "Elevated readmission risk driven by prior utilization and glucose control.",
  model_version: "1.0.0",
  prediction_time_ms: 42,
  shap_explanations: [
    {
      feature_name: "number_inpatient",
      feature_value: 5,
      shap_value: 0.12,
      importance_rank: 1,
      direction: "increases_risk",
      impact_direction: "positive" as const,
    },
  ],
  created_at: "2026-06-11T12:00:00Z",
};

const mockSimulation = {
  id: "sim-demo-1",
  prediction_id: "pred-demo-1",
  original_risk_score: 0.825,
  original_risk_percent: 82.5,
  original_risk_level: "high" as const,
  simulated_risk_score: 0.61,
  simulated_risk_percent: 61,
  simulated_risk_level: "high" as const,
  delta_risk_percent: -21.5,
  simulation_summary: "Risk decreased after reducing prior admissions and glucose.",
  changes: [],
  simulation_time_ms: 35,
  model_version: "1.0.0",
  created_at: "2026-06-11T12:01:00Z",
};

function renderDemo(initialEntry = "/demo") {
  const router = createMemoryRouter(
    [{ path: "/demo/:stepId?", element: <DemoPlaygroundPage /> }],
    { initialEntries: [initialEntry] },
  );

  render(<RouterProvider router={router} />);
  return router;
}

describe("DemoPlaygroundPage", () => {
  it("renders welcome and starts the guided tour", async () => {
    const user = userEvent.setup();
    const router = renderDemo();

    expect(screen.getByRole("heading", { name: /try predictive intelligence/i })).toBeInTheDocument();
    expect(screen.getByText(/no sign-in required/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /start guided demo/i }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/demo/case");
    });
    expect(screen.getByText(/meet a high-risk patient/i)).toBeInTheDocument();
    expect(screen.getByText(/intervention simulation/i)).toBeInTheDocument();
  });

  it("supports browser back and forward between tour steps", async () => {
    const user = userEvent.setup();
    const router = renderDemo();

    await user.click(screen.getByRole("button", { name: /start guided demo/i }));
    await user.click(screen.getByRole("button", { name: /continue to prediction/i }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/demo/predict");
    });

    await act(async () => {
      router.navigate(-1);
    });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/demo/case");
    });
    expect(screen.getByText(/meet a high-risk patient/i)).toBeInTheDocument();

    await act(async () => {
      router.navigate(1);
    });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/demo/predict");
    });
    expect(screen.getByText(/generate the risk score/i)).toBeInTheDocument();
  });

  it("runs predict and simulation through the guided flow", async () => {
    const user = userEvent.setup();
    vi.mocked(createDemoPrediction).mockResolvedValue(mockPrediction);
    vi.mocked(createDemoSimulation).mockResolvedValue(mockSimulation);

    renderDemo();

    await user.click(screen.getByRole("button", { name: /start guided demo/i }));
    await user.click(screen.getByRole("button", { name: /continue to prediction/i }));
    await user.click(screen.getByRole("button", { name: /generate ai prediction/i }));

    await waitFor(() => {
      expect(createDemoPrediction).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText(/understand why/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /try clinical simulation/i }));

    await waitFor(() => {
      expect(createDemoSimulation).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(scrollToPageSection).toHaveBeenCalledWith("demo-simulation");
    });

    expect(screen.getByText(/62\.0%|61\.\d%/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /finish demo/i }));
    expect(screen.getByText(/you have seen the core cdss workflow/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in to medscope ai/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("scrolls to the SHAP section from View full SHAP analysis", async () => {
    const user = userEvent.setup();
    vi.mocked(createDemoPrediction).mockResolvedValue(mockPrediction);
    vi.mocked(scrollToPageSection).mockClear();

    renderDemo();

    await user.click(screen.getByRole("button", { name: /start guided demo/i }));
    await user.click(screen.getByRole("button", { name: /continue to prediction/i }));
    await user.click(screen.getByRole("button", { name: /generate ai prediction/i }));

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /view full shap analysis/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("link", { name: /view full shap analysis/i }));

    expect(scrollToPageSection).toHaveBeenCalledWith("xai-analysis");
  });
});
