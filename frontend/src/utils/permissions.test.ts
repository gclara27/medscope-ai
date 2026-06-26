import { describe, expect, it } from "vitest";

import { canAccessModule, resolveUserPermissions } from "@/utils/permissions";

describe("permissions utils", () => {
  it("falls back to role defaults when permissions are missing", () => {
    expect(resolveUserPermissions({ role: "nurse" }).history).toBe(true);
    expect(resolveUserPermissions({ role: "nurse" }).evaluation).toBe(false);
  });

  it("uses explicit permissions from login payload", () => {
    expect(
      canAccessModule(
        {
          role: "nurse",
          permissions: {
            dashboard: true,
            evaluation: true,
            simulation: false,
            history: false,
            analytics: false,
            settings: false,
          },
        },
        "evaluation",
      ),
    ).toBe(true);
  });
});
