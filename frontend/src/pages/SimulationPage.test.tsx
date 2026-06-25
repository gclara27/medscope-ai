import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SimulationPage } from "@/pages/SimulationPage";
import { createSimulation } from "@/services/simulations";
import { demoBaselineRequest } from "@/test/fixtures/prediction";
import type { PredictResponse } from "@/types/prediction";
import type { SimulationLocationState } from "@/types/simulation";
import { clearSimulationSession, consumeSimulationForceReset, markSimulationForceReset, saveSimulationSession } from "@/utils/simulationSession";
import { predictRequestToSimulationValues } from "@/lib/simulationForm";

vi.mock("@/services/simulations", () => ({
  createSimulation: vi.fn(),
}));

const demoResult: PredictResponse = {
  id: "11111111-1111-1111-1111-111111111111",
  risk_score: 0.42,
  risk_percent: 42,
  risk_level: "medium",
  confidence_score: 0.58,
  summary: "Moderate readmission risk.",
  model_version: "lr-v1",
  prediction_time_ms: 85,
  shap_explanations: [],
  created_at: "2026-06-11T10:00:00Z",
};

const simulationState: SimulationLocationState = {
  predictionId: demoResult.id,
  baseline: demoBaselineRequest,
  result: demoResult,
  originalRisk: {
    risk_score: demoResult.risk_score,
    risk_percent: demoResult.risk_percent,
    risk_level: demoResult.risk_level,
  },
};

const simulateResponse = {
  id: "22222222-2222-2222-2222-222222222222",
  prediction_id: demoResult.id,
  original_risk_score: 0.42,
  original_risk_percent: 42,
  original_risk_level: "medium" as const,
  simulated_risk_score: 0.35,
  simulated_risk_percent: 35,
  simulated_risk_level: "medium" as const,
  delta_risk_percent: -7,
  simulation_summary: "Risk decreased after lowering glucose.",
  changes: [],
  simulation_time_ms: 60,
  model_version: "lr-v1",
  created_at: "2026-06-11T11:00:00Z",
};

describe("SimulationPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearSimulationSession();
    consumeSimulationForceReset();
    vi.mocked(createSimulation).mockResolvedValue(simulateResponse);
  });

  afterEach(() => {
    vi.useRealTimers();
    clearSimulationSession();
  });

  it("shows empty state when navigation state and session are missing", () => {
    render(
      <MemoryRouter initialEntries={["/simulation"]}>
        <SimulationPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /clinical simulation/i })).toBeInTheDocument();
    expect(
      screen.getByText(/complete a clinical evaluation first/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go to evaluation/i })).toHaveAttribute(
      "href",
      "/evaluation",
    );
  });

  it("falls back to session when router state is incomplete", () => {
    saveSimulationSession(simulationState);

    render(
      <MemoryRouter initialEntries={[{ pathname: "/simulation", state: {} }]}>
        <SimulationPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /clinical simulation/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/age \(years\)/i)).toHaveValue(String(demoBaselineRequest.age));
    expect(screen.queryByText(/complete a clinical evaluation first/i)).not.toBeInTheDocument();
  });

  it("loads context from session when router state is missing", () => {
    saveSimulationSession(simulationState);

    render(
      <MemoryRouter initialEntries={["/simulation"]}>
        <SimulationPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /clinical simulation/i })).toBeInTheDocument();
  });

  it("restores draft values when browser keeps router state on refresh", () => {
    const draftValues = {
      ...predictRequestToSimulationValues(demoBaselineRequest),
      age: 34,
      medications_count: 29,
      blood_pressure: 182,
    };

    saveSimulationSession({
      ...simulationState,
      draftValues,
      lastSimResult: simulateResponse,
    });

    render(
      <MemoryRouter initialEntries={[{ pathname: "/simulation", state: simulationState }]}>
        <SimulationPage />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText(/age \(years\)/i)).toHaveValue("34");
    expect(screen.getByLabelText(/medications count/i)).toHaveValue("29");
    expect(screen.getByText(/risk decreased after lowering glucose/i)).toBeInTheDocument();
  });

  it("resets to baseline when opened via Run simulation", () => {
    const draftValues = {
      ...predictRequestToSimulationValues(demoBaselineRequest),
      age: 34,
    };

    saveSimulationSession({
      ...simulationState,
      draftValues,
      lastSimResult: simulateResponse,
    });

    markSimulationForceReset();

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/simulation", state: { ...simulationState, resetDraft: true } },
        ]}
      >
        <SimulationPage />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText(/age \(years\)/i)).toHaveValue(
      String(demoBaselineRequest.age),
    );
    expect(screen.queryByText(/risk decreased after lowering glucose/i)).not.toBeInTheDocument();
  });

  it("restores draft when router state still has resetDraft after refresh", () => {
    const draftValues = {
      ...predictRequestToSimulationValues(demoBaselineRequest),
      age: 34,
      medications_count: 29,
      blood_pressure: 182,
    };

    saveSimulationSession({
      ...simulationState,
      draftValues,
      lastSimResult: simulateResponse,
    });

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/simulation", state: { ...simulationState, resetDraft: true } },
        ]}
      >
        <SimulationPage />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText(/age \(years\)/i)).toHaveValue("34");
    expect(screen.getByText(/risk decreased after lowering glucose/i)).toBeInTheDocument();
  });

  it("restores draft values and last simulation result after refresh", () => {
    const draftValues = {
      ...predictRequestToSimulationValues(demoBaselineRequest),
      age: 34,
      medications_count: 29,
      blood_pressure: 182,
    };

    saveSimulationSession({
      ...simulationState,
      draftValues,
      lastSimResult: simulateResponse,
    });

    render(
      <MemoryRouter initialEntries={["/simulation"]}>
        <SimulationPage />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText(/age \(years\)/i)).toHaveValue("34");
    expect(screen.getByLabelText(/medications count/i)).toHaveValue("29");
    expect(screen.getByLabelText(/systolic blood pressure/i)).toHaveValue("182");
    expect(screen.getByText(/risk decreased after lowering glucose/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/risk comparison summary/i)).toBeInTheDocument();
  });

  it("auto-recalculates after debounced slider change", async () => {
    vi.useFakeTimers();

    render(
      <MemoryRouter initialEntries={[{ pathname: "/simulation", state: simulationState }]}>
        <SimulationPage />
      </MemoryRouter>,
    );

    const glucoseSlider = screen.getByLabelText(/blood glucose/i);

    await act(async () => {
      fireEvent.change(glucoseSlider, { target: { value: "200" } });
      await vi.advanceTimersByTimeAsync(500);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(createSimulation).toHaveBeenCalledWith({
      prediction_id: demoResult.id,
      modifications: { glucose: 200 },
    });
    expect(screen.getByText(/risk decreased after lowering glucose/i)).toBeInTheDocument();
  });

  it("hides recalculating spinner after simulation completes", async () => {
    vi.useFakeTimers();
    saveSimulationSession(simulationState);

    render(
      <MemoryRouter initialEntries={["/simulation"]}>
        <SimulationPage />
      </MemoryRouter>,
    );

    const glucoseSlider = screen.getByLabelText(/blood glucose/i);

    await act(async () => {
      fireEvent.change(glucoseSlider, { target: { value: "200" } });
      await vi.advanceTimersByTimeAsync(500);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(createSimulation).toHaveBeenCalledTimes(1);
    expect(screen.queryByLabelText(/recalculating risk/i)).not.toBeInTheDocument();
    expect(screen.getByText(/risk decreased after lowering glucose/i)).toBeInTheDocument();
  });

  it("recalculates immediately when recalculate is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={[{ pathname: "/simulation", state: simulationState }]}>
        <SimulationPage />
      </MemoryRouter>,
    );

    const glucoseSlider = screen.getByLabelText(/blood glucose/i);
    fireEvent.change(glucoseSlider, { target: { value: "200" } });

    await user.click(screen.getByRole("button", { name: /recalculate risk/i }));

    await waitFor(() => {
      expect(createSimulation).toHaveBeenCalledWith({
        prediction_id: demoResult.id,
        modifications: { glucose: 200 },
      });
    });

    expect(screen.getByText(/risk decreased after lowering glucose/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/risk comparison summary/i)).toBeInTheDocument();
    expect(screen.getByText(/-7\.0 pts \(medium risk\)/i)).toBeInTheDocument();
  });
});
