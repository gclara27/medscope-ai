import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/context/AuthContext";
import {
  CLINICAL_DEMO_SCENARIOS,
  buildScenarioPredictRequest,
  getClinicalDemoScenario,
} from "@/lib/clinicalDemoScenarios";
import { buildPredictRequest, DEFAULT_CLINICAL_FORM_VALUES } from "@/lib/clinicalFormDefaults";
import { EvaluationPage } from "@/pages/EvaluationPage";
import { PredictionResultPage } from "@/pages/PredictionResultPage";
import { createPrediction } from "@/services/predictions";
import type { PredictResponse } from "@/types/prediction";
import { demoBaselineRequest } from "@/test/fixtures/prediction";

vi.mock("@/services/predictions", () => ({
  createPrediction: vi.fn(),
}));

function renderEvaluationPage(ui: ReactNode = <EvaluationPage />, initialEntries?: string[]) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </AuthProvider>,
  );
}

function renderEvaluationWithResultRoute(initialEntries = ["/evaluation"]) {
  return renderEvaluationPage(
    <Routes>
      <Route path="/evaluation" element={<EvaluationPage />} />
      <Route path="/evaluation/result" element={<PredictionResultPage />} />
    </Routes>,
    initialEntries,
  );
}

function scenarioButtonName(title: string) {
  return new RegExp(`load demo scenario: ${title}`, "i");
}

async function expandDemoScenarios(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /show demo clinical scenarios/i }));
}

const demoResponse: PredictResponse = {
  id: "11111111-1111-1111-1111-111111111111",
  risk_score: 0.42,
  risk_percent: 42,
  risk_level: "medium",
  confidence_score: 0.58,
  summary: "Moderate readmission risk based on clinical profile.",
  model_version: "lr-v1",
  prediction_time_ms: 85,
  shap_explanations: [
    {
      feature_name: "num_medications",
      feature_value: 8,
      shap_value: 0.12,
      importance_rank: 1,
      direction: "increases_risk",
      impact_direction: "positive",
    },
  ],
  created_at: "2026-06-11T10:00:00Z",
};

describe("EvaluationPage", () => {
  it("renders page header and clinical form", () => {
    renderEvaluationPage();

    expect(screen.getByRole("heading", { name: /clinical evaluation/i })).toBeInTheDocument();
    expect(screen.getByText(/patient demographics/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /generate ai prediction/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Demo clinical scenarios")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /show demo clinical scenarios/i }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  describe("demo playbook (T-907-04)", () => {
    it.each(CLINICAL_DEMO_SCENARIOS.map((scenario) => [scenario.title, scenario]))(
      "prefills form values for %s",
      async (title, scenario) => {
        const user = userEvent.setup();
        renderEvaluationPage();

        await expandDemoScenarios(user);
        await user.click(screen.getByRole("button", { name: scenarioButtonName(title) }));

        expect(screen.getByLabelText(/age/i)).toHaveValue(scenario.formValues.age);
        expect(screen.getByLabelText(/blood glucose/i)).toHaveValue(scenario.formValues.glucose);
        expect(screen.getByLabelText(/previous admissions/i)).toHaveValue(
          scenario.formValues.previous_admissions,
        );
        expect(screen.getByLabelText(/biological sex/i)).toHaveValue(scenario.formValues.gender);
        expect(
          screen.getByRole("button", { name: scenarioButtonName(title) }),
        ).toHaveAttribute("aria-pressed", "true");
      },
    );

    it("switches the active scenario when another card is selected", async () => {
      const user = userEvent.setup();
      renderEvaluationPage();

      await expandDemoScenarios(user);
      await user.click(
        screen.getByRole("button", { name: scenarioButtonName("High readmission risk") }),
      );
      await user.click(
        screen.getByRole("button", { name: scenarioButtonName("Moderate risk profile") }),
      );

      expect(screen.getByLabelText(/age/i)).toHaveValue(58);
      expect(
        screen.getByRole("button", { name: scenarioButtonName("Moderate risk profile") }),
      ).toHaveAttribute("aria-pressed", "true");
      expect(
        screen.getByRole("button", { name: scenarioButtonName("High readmission risk") }),
      ).toHaveAttribute("aria-pressed", "false");
    });

    it("submits the API payload built from the selected scenario", async () => {
      const user = userEvent.setup();
      const moderate = getClinicalDemoScenario("moderate-risk")!;
      vi.mocked(createPrediction).mockResolvedValue(demoResponse);

      renderEvaluationWithResultRoute();

      await expandDemoScenarios(user);
      await user.click(
        screen.getByRole("button", { name: scenarioButtonName("Moderate risk profile") }),
      );
      await user.click(screen.getByRole("button", { name: /generate ai prediction/i }));

      expect(createPrediction).toHaveBeenCalledWith(buildScenarioPredictRequest(moderate));
    });

    it("disables scenario cards while a prediction request is in flight", async () => {
      const user = userEvent.setup();
      let resolvePrediction: ((value: PredictResponse) => void) | undefined;
      vi.mocked(createPrediction).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePrediction = resolve;
          }),
      );

      renderEvaluationPage();

      await expandDemoScenarios(user);
      await user.click(
        screen.getByRole("button", { name: scenarioButtonName("High readmission risk") }),
      );
      await user.click(screen.getByRole("button", { name: /generate ai prediction/i }));

      for (const button of screen.getAllByRole("button", { name: /load demo scenario/i })) {
        expect(button).toBeDisabled();
      }
      expect(screen.getByRole("button", { name: /generating prediction/i })).toBeDisabled();

      resolvePrediction?.(demoResponse);
      await waitFor(() => {
        expect(screen.getAllByRole("button", { name: /load demo scenario/i })[0]).not.toBeDisabled();
      });
    });

    it("supports manual form entry without selecting a demo scenario", async () => {
      const user = userEvent.setup();
      vi.mocked(createPrediction).mockResolvedValue(demoResponse);

      renderEvaluationPage();

      expect(screen.queryByText(/active scenario:/i)).not.toBeInTheDocument();

      await user.clear(screen.getByLabelText(/age/i));
      await user.type(screen.getByLabelText(/age/i), "80");
      await user.click(screen.getByRole("button", { name: /generate ai prediction/i }));

      expect(createPrediction).toHaveBeenCalledWith(
        expect.objectContaining({
          age: 80,
          glucose: DEFAULT_CLINICAL_FORM_VALUES.glucose,
        }),
      );
    });

    it("shows simulation demo tip only on the showcase scenario card", async () => {
      const user = userEvent.setup();
      renderEvaluationPage();

      await expandDemoScenarios(user);

      expect(screen.getAllByText(/demo tip:/i)).toHaveLength(1);
      expect(screen.getByText(/reduce previous admissions to 2/i)).toBeInTheDocument();
    });

    it("clears API error when a new scenario is selected", async () => {
      const user = userEvent.setup();
      vi.mocked(createPrediction).mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 503,
          data: { detail: "ML prediction service is unavailable" },
        },
      });

      renderEvaluationPage();

      await user.click(screen.getByRole("button", { name: /generate ai prediction/i }));
      expect(screen.getByText(/ml prediction service is unavailable/i)).toBeInTheDocument();

      await expandDemoScenarios(user);
      await user.click(
        screen.getByRole("button", { name: scenarioButtonName("Low risk — stable outpatient") }),
      );

      expect(
        screen.queryByText(/ml prediction service is unavailable/i),
      ).not.toBeInTheDocument();
    });
  });

  it("prefills the form when a demo scenario is selected", async () => {
    const user = userEvent.setup();
    renderEvaluationPage();

    expect(screen.getByLabelText(/age/i)).toHaveValue(65);

    await expandDemoScenarios(user);
    await user.click(
      screen.getByRole("button", { name: /load demo scenario: high readmission risk/i }),
    );

    expect(screen.getByLabelText(/age/i)).toHaveValue(72);
    expect(screen.getByLabelText(/blood glucose/i)).toHaveValue(198);
    expect(screen.getByLabelText(/previous admissions/i)).toHaveValue(5);
    expect(
      screen.getByRole("button", { name: /load demo scenario: high readmission risk/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("clears scenario selection when the user edits the form manually", async () => {
    const user = userEvent.setup();
    renderEvaluationPage();

    await expandDemoScenarios(user);
    await user.click(
      screen.getByRole("button", { name: /load demo scenario: low risk/i }),
    );
    expect(screen.getByLabelText(/age/i)).toHaveValue(42);

    await user.clear(screen.getByLabelText(/age/i));
    await user.type(screen.getByLabelText(/age/i), "43");

    expect(
      screen.getByRole("button", { name: /load demo scenario: low risk/i }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("submits prediction and navigates to result page", async () => {
    const user = userEvent.setup();
    vi.mocked(createPrediction).mockResolvedValue(demoResponse);

    renderEvaluationWithResultRoute();

    await user.click(screen.getByRole("button", { name: /generate ai prediction/i }));

    expect(createPrediction).toHaveBeenCalledWith(buildPredictRequest(DEFAULT_CLINICAL_FORM_VALUES));
    expect(screen.getByRole("heading", { name: /prediction result/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /readmission risk 42\.0 percent/i })).toBeInTheDocument();
    expect(screen.getByText(/moderate readmission risk/i)).toBeInTheDocument();
  });

  it("shows API error when prediction fails", async () => {
    const user = userEvent.setup();
    vi.mocked(createPrediction).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 503,
        data: { detail: "ML prediction service is unavailable" },
      },
    });

    renderEvaluationPage();

    await user.click(screen.getByRole("button", { name: /generate ai prediction/i }));

    expect(screen.getByText(/ml prediction service is unavailable/i)).toBeInTheDocument();
  });
});

describe("PredictionResultPage", () => {
  it("redirects to evaluation when result state is missing", () => {
    render(
      <MemoryRouter initialEntries={["/evaluation/result"]}>
        <Routes>
          <Route path="/evaluation" element={<div>Evaluation form</div>} />
          <Route path="/evaluation/result" element={<PredictionResultPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/evaluation form/i)).toBeInTheDocument();
  });

  it("renders risk gauge and indicator from navigation state", () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/evaluation/result",
            state: { result: demoResponse, baselineRequest: demoBaselineRequest },
          },
        ]}
      >
        <PredictionResultPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("img", { name: /readmission risk 42\.0 percent/i })).toBeInTheDocument();
    expect(screen.getByText("MEDIUM RISK")).toBeInTheDocument();
    expect(screen.getByText(/moderate readmission risk based on clinical profile/i)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /ai clinical summary/i })).toBeInTheDocument();
    expect(screen.getByText(/explainable ai \(xai\) analysis/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /run simulation/i })).toBeInTheDocument();
  });

  it("scrolls to the SHAP section from View full SHAP analysis", async () => {
    const user = userEvent.setup();
    const scrollIntoViewMock = vi.fn();

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/evaluation/result",
            state: { result: demoResponse, baselineRequest: demoBaselineRequest },
          },
        ]}
      >
        <PredictionResultPage />
      </MemoryRouter>,
    );

    const shapSection = document.getElementById("xai-analysis");
    expect(shapSection).not.toBeNull();
    shapSection!.scrollIntoView = scrollIntoViewMock;

    await user.click(screen.getByRole("link", { name: /view full shap analysis/i }));

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });
});
