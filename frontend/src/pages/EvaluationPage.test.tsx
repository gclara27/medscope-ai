import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/context/AuthContext";
import { EvaluationPage } from "@/pages/EvaluationPage";
import { PredictionResultPage } from "@/pages/PredictionResultPage";
import { createPrediction } from "@/services/predictions";
import type { PredictResponse } from "@/types/prediction";
import { demoBaselineRequest } from "@/test/fixtures/prediction";

vi.mock("@/services/predictions", () => ({
  createPrediction: vi.fn(),
}));

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
    render(
      <AuthProvider>
        <MemoryRouter>
          <EvaluationPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByRole("heading", { name: /clinical evaluation/i })).toBeInTheDocument();
    expect(screen.getByText(/patient demographics/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /generate ai prediction/i }),
    ).toBeInTheDocument();
  });

  it("submits prediction and navigates to result page", async () => {
    const user = userEvent.setup();
    vi.mocked(createPrediction).mockResolvedValue(demoResponse);

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/evaluation"]}>
          <Routes>
            <Route path="/evaluation" element={<EvaluationPage />} />
            <Route path="/evaluation/result" element={<PredictionResultPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: /generate ai prediction/i }));

    expect(createPrediction).toHaveBeenCalledTimes(1);
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

    render(
      <AuthProvider>
        <MemoryRouter>
          <EvaluationPage />
        </MemoryRouter>
      </AuthProvider>,
    );

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
