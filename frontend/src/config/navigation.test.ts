import { describe, expect, it } from "vitest";

import {
  APP_NAV_ITEMS,
  canAccessRoute,
  getNavItemsForRole,
  getNavItemsForUser,
  getRouteIcon,
  SUPPORT_NAV_ITEM,
} from "@/config/navigation";

const adminUser = {
  role: "admin",
  permissions: {
    dashboard: true,
    evaluation: true,
    simulation: true,
    history: true,
    analytics: true,
    settings: true,
  },
};

describe("navigation role access", () => {
  it("shows full navigation for admin", () => {
    expect(getNavItemsForRole("admin").map((item) => item.to)).toEqual(
      APP_NAV_ITEMS.map((item) => item.to),
    );
    expect(getNavItemsForUser(adminUser).map((item) => item.to)).toEqual(
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

  it("limits analyst navigation to dashboard, analytics, and settings", () => {
    expect(getNavItemsForRole("analyst").map((item) => item.to)).toEqual([
      "/dashboard",
      "/analytics",
      "/settings",
    ]);
  });

  it("denies nurse access to evaluation route", () => {
    expect(canAccessRoute({ role: "nurse" }, "/evaluation")).toBe(false);
    expect(canAccessRoute({ role: "clinician" }, "/evaluation")).toBe(true);
  });

  it("allows admin and analyst access to settings", () => {
    expect(canAccessRoute(adminUser, "/settings")).toBe(true);
    expect(canAccessRoute({ role: "analyst" }, "/settings")).toBe(true);
    expect(canAccessRoute({ role: "clinician" }, "/settings")).toBe(false);
    expect(canAccessRoute({ role: "nurse" }, "/settings")).toBe(false);
  });

  it("allows all authenticated roles to access support", () => {
    expect(canAccessRoute({ role: "nurse" }, "/support")).toBe(true);
    expect(canAccessRoute({ role: "clinician" }, "/support")).toBe(true);
    expect(canAccessRoute({ role: "analyst" }, "/support")).toBe(true);
    expect(canAccessRoute(adminUser, "/support")).toBe(true);
  });

  it("resolves support route icon", () => {
    expect(getRouteIcon("/support")).toBe(SUPPORT_NAV_ITEM.icon);
  });

  it("resolves nested route icons from parent navigation items", () => {
    expect(getRouteIcon("/analytics")).toBe(
      APP_NAV_ITEMS.find((item) => item.to === "/analytics")?.icon,
    );
    expect(getRouteIcon("/evaluation/result")).toBe(
      APP_NAV_ITEMS.find((item) => item.to === "/evaluation")?.icon,
    );
    expect(getRouteIcon("/history/prediction-id")).toBe(
      APP_NAV_ITEMS.find((item) => item.to === "/history")?.icon,
    );
  });
});
