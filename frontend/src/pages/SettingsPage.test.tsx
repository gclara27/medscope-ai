import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SettingsPage } from "@/pages/SettingsPage";

const listAdminUsersMock = vi.fn();
const createAdminUserMock = vi.fn();
const listRolePoliciesMock = vi.fn();
const getSystemSettingsMock = vi.fn();

vi.mock("@/services/adminUsers", () => ({
  listAdminUsers: (...args: unknown[]) => listAdminUsersMock(...args),
  createAdminUser: (...args: unknown[]) => createAdminUserMock(...args),
  updateAdminUser: vi.fn(),
}));

vi.mock("@/services/adminSettings", () => ({
  listRolePolicies: (...args: unknown[]) => listRolePoliciesMock(...args),
  updateRolePolicy: vi.fn(),
  getSystemSettings: (...args: unknown[]) => getSystemSettingsMock(...args),
  updateSystemSettings: vi.fn(),
}));

vi.mock("@/context/useAuth", () => ({
  useAuth: () => ({
    user: {
      id: "admin-1",
      email: "admin@medscope.ai",
      first_name: "Admin",
      last_name: "User",
      role: "admin",
      permissions: {
        dashboard: true,
        evaluation: true,
        simulation: true,
        history: true,
        analytics: true,
        settings: true,
      },
    },
    refreshSession: vi.fn(),
    isBootstrapping: false,
  }),
}));

const demoUsers = {
  items: [
    {
      id: "admin-1",
      email: "admin@medscope.ai",
      first_name: "Admin",
      last_name: "User",
      role: "admin" as const,
      is_active: true,
      created_at: "2026-06-01T10:00:00Z",
    },
  ],
  total: 1,
};

const demoPolicies = {
  items: [
    {
      id: "role-nurse",
      name: "nurse",
      description: "Nursing staff",
      permissions: {
        dashboard: true,
        evaluation: false,
        simulation: false,
        history: true,
        analytics: false,
        settings: false,
      },
      is_locked: false,
    },
  ],
  modules: [
    "dashboard",
    "evaluation",
    "simulation",
    "history",
    "analytics",
    "settings",
  ],
};

const demoSettings = {
  platform_name: "MedScope AI",
  risk_threshold_high: 0.5,
  risk_threshold_medium: 0.35,
  support_contact_email: "support@medscope.ai",
  model: {
    model_id: "readmission-rf",
    model_version: "1.0.0",
    production_threshold: 0.5,
    ml_ready: true,
  },
};

describe("SettingsPage", () => {
  it("renders user management by default", async () => {
    listAdminUsersMock.mockResolvedValue(demoUsers);
    listRolePoliciesMock.mockResolvedValue(demoPolicies);
    getSystemSettingsMock.mockResolvedValue(demoSettings);

    render(<SettingsPage />);

    expect(screen.getByRole("heading", { name: /system settings/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("admin@medscope.ai")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /add user/i })).toBeInTheDocument();
  });

  it("switches to role policies and system configuration sections", async () => {
    listAdminUsersMock.mockResolvedValue(demoUsers);
    listRolePoliciesMock.mockResolvedValue(demoPolicies);
    getSystemSettingsMock.mockResolvedValue(demoSettings);

    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: /role policies/i }));
    await waitFor(() => {
      expect(screen.getByText(/control which clinical modules/i)).toBeInTheDocument();
    });
    expect(screen.getByText("Nurse")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /system configuration/i }));
    await waitFor(() => {
      expect(screen.getByLabelText(/platform name/i)).toHaveValue("MedScope AI");
    });
    expect(screen.getByText(/model metadata/i)).toBeInTheDocument();
  });
});
