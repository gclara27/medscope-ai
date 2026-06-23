import { describe, expect, it } from "vitest";

import { getPredictionErrorMessage } from "@/utils/predictionErrors";

describe("getPredictionErrorMessage", () => {
  it("returns API unavailable message when there is no response", () => {
    const error = {
      isAxiosError: true,
      response: undefined,
    };

    expect(getPredictionErrorMessage(error)).toMatch(/cannot reach the api/i);
  });

  it("returns ML unavailable detail for 503", () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 503,
        data: { detail: "ML prediction service is unavailable" },
      },
    };

    expect(getPredictionErrorMessage(error)).toBe("ML prediction service is unavailable");
  });

  it("formats pydantic validation errors for 422", () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 422,
        data: {
          detail: [{ loc: ["body", "age"], msg: "Input should be greater than or equal to 0" }],
        },
      },
    };

    expect(getPredictionErrorMessage(error)).toMatch(/age/i);
  });
});
