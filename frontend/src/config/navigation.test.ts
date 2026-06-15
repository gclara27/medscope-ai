import { describe, expect, it } from "vitest";

import {
  APP_NAV_ITEMS,
  canAccessRoute,
  getNavItemsForRole,
} from "@/config/navigation";

describe("navigation role access", () => {
  it("shows full navigation for admin", () => {
    expect(getNavItemsForRole("admin").map((item) => item.to)).toEqual(
      APP_NAV_ITEMS.map((item) => item.to),
    );
  });

  it("limits clinician navigation to clinical modules", () => {
    expect(getNavItemsForRole("clinician").map((item) => item.to)).toEqual([
      "/dashboard",
      "/evaluation",
      "/simulation",
      "/history",
    ]);
  });

  it("limits nurse navigation to dashboard and history", () => {
    expect(getNavItemsForRole("nurse").map((item) => item.to)).toEqual([
      "/dashboard",
      "/history",
    ]);
  });

  it("limits analyst navigation to dashboard and analytics", () => {
    expect(getNavItemsForRole("analyst").map((item) => item.to)).toEqual([
      "/dashboard",
      "/analytics",
    ]);
  });

  it("denies nurse access to evaluation route", () => {
    expect(canAccessRoute("nurse", "/evaluation")).toBe(false);
    expect(canAccessRoute("clinician", "/evaluation")).toBe(true);
  });
});
