import { beforeEach, describe, expect, it, vi } from "vitest";

const { postMock } = vi.hoisted(() => ({
  postMock: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    create: () => ({
      post: postMock,
    }),
  },
}));

import { createDemoPrediction, createDemoSimulation } from "./demo";

describe("demo service", () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it("posts to demo predict endpoint", async () => {
    const payload = {
      age: 72,
      gender: "Female" as const,
      hospital_stay_days: 6,
      medications_count: 12,
      previous_admissions: 5,
      glucose: 198,
    };
    const response = { id: "demo-1", risk_percent: 82.5 };
    postMock.mockResolvedValue({ data: response });

    const result = await createDemoPrediction(payload);

    expect(postMock).toHaveBeenCalledWith("/demo/predict", payload);
    expect(result).toEqual(response);
  });

  it("posts to demo simulate endpoint", async () => {
    const payload = {
      baseline: {
        age: 72,
        gender: "Female" as const,
        hospital_stay_days: 6,
        medications_count: 12,
        previous_admissions: 5,
        glucose: 198,
      },
      modifications: { glucose: 140 },
    };
    const response = { id: "sim-1", delta_risk_percent: -10 };
    postMock.mockResolvedValue({ data: response });

    const result = await createDemoSimulation(payload);

    expect(postMock).toHaveBeenCalledWith("/demo/simulate", payload);
    expect(result).toEqual(response);
  });
});
