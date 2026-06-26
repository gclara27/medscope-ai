import { describe, expect, it, vi } from "vitest";

import { getSystemSettings, listRolePolicies } from "@/services/adminSettings";

vi.mock("./api", () => ({
  api: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

import { api } from "./api";

describe("adminSettings service", () => {
  it("lists role policies", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        items: [],
        modules: ["dashboard"],
      },
    });

    const result = await listRolePolicies();

    expect(api.get).toHaveBeenCalledWith("/admin/roles");
    expect(result.modules).toEqual(["dashboard"]);
  });

  it("loads system settings", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        platform_name: "MedScope AI",
        risk_threshold_high: 0.5,
        risk_threshold_medium: 0.35,
        support_contact_email: "support@medscope.ai",
        model: { ml_ready: false },
      },
    });

    const result = await getSystemSettings();

    expect(api.get).toHaveBeenCalledWith("/admin/settings");
    expect(result.platform_name).toBe("MedScope AI");
  });
});
