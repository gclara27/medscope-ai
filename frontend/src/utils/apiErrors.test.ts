import { describe, expect, it } from "vitest";

import {
  API_UNREACHABLE_MESSAGE,
  formatValidationDetail,
  resolveApiErrorMessage,
  SESSION_EXPIRED_MESSAGE,
} from "@/utils/apiErrors";

describe("formatValidationDetail", () => {
  it("humanizes field names in validation errors", () => {
    const message = formatValidationDetail([
      { loc: ["body", "age"], msg: "Input should be greater than or equal to 0" },
    ]);

    expect(message).toBe("Age: Input should be greater than or equal to 0");
  });
});

describe("resolveApiErrorMessage", () => {
  const messages = {
    fallback: "Fallback message",
    forbidden: "Forbidden for this module",
    notFound: "Resource missing",
    serverError: "Server failed",
    unavailable: "Service unavailable",
  };

  it("returns API unreachable when there is no response", () => {
    expect(
      resolveApiErrorMessage({ isAxiosError: true, response: undefined }, messages),
    ).toBe(API_UNREACHABLE_MESSAGE);
  });

  it("maps 401 to session expired by default", () => {
    expect(
      resolveApiErrorMessage(
        { isAxiosError: true, response: { status: 401, data: { detail: "Not authenticated" } } },
        messages,
      ),
    ).toBe(SESSION_EXPIRED_MESSAGE);
  });

  it("maps insufficient permissions to module-specific forbidden copy", () => {
    expect(
      resolveApiErrorMessage(
        {
          isAxiosError: true,
          response: { status: 403, data: { detail: "Insufficient permissions" } },
        },
        messages,
      ),
    ).toBe("Forbidden for this module");
  });

  it("passes through backend detail strings", () => {
    expect(
      resolveApiErrorMessage(
        {
          isAxiosError: true,
          response: { status: 404, data: { detail: "Prediction not found" } },
        },
        messages,
      ),
    ).toBe("Prediction not found");
  });
});
