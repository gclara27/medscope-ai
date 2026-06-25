import { describe, expect, it } from "vitest";

import { getAnalyticsErrorMessage } from "@/utils/analyticsErrors";

describe("getAnalyticsErrorMessage", () => {
  it("maps permission and validation errors", () => {
    expect(
      getAnalyticsErrorMessage({
        isAxiosError: true,
        response: { status: 403, data: { detail: "Forbidden" } },
      }),
    ).toMatch(/permission/i);

    expect(
      getAnalyticsErrorMessage({
        isAxiosError: true,
        response: {
          status: 422,
          data: { detail: [{ msg: "date_from must be on or before date_to" }] },
        },
      }),
    ).toMatch(/date_from/i);
  });
});
