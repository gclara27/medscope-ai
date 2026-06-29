import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SettingsPage } from "@/pages/SettingsPage";

const listAdminUsersMock = vi.fn();
const createAdminUserMock = vi.fn();
const listRolePoliciesMock = vi.fn();
const getSystemSettingsMock = vi.fn();
const listAuditLogsMock = vi.fn();
const getModelComparisonMock = vi.fn();

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

vi.mock("@/services/auditLogs", () => ({
  listAuditLogs: (...args: unknown[]) => listAuditLogsMock(...args),
}));

vi.mock("@/services/mlComparison", () => ({
  getModelComparison: (...args: unknown[]) => getModelComparisonMock(...args),
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

const demoAuditLogs = {
  items: [
    {
      id: "log-1",
      user_id: "admin-1",
      action_type: "auth.login",
      entity_type: "user",
      entity_id: "admin-1",
      action_details: { email: "admin@medscope.ai" },
      created_at: "2026-06-11T10:00:00Z",
      user: {
        id: "admin-1",
        email: "admin@medscope.ai",
        first_name: "Admin",
        last_name: "User",
        role: "admin",
      },
    },
  ],
  total: 1,
  page: 1,
  page_size: 20,
};

const demoModelComparison = {
  is_available: true,
  primary_metric: "recall",
  recall_winner: "logistic_regression",
  baseline_winner: "logistic_regression",
  production_model_id: "logistic_regression",
  production_model_version: "1.0.0",
  summary: "Logistic Regression leads on recall.",
  rationale: [],
  offline_note: "Metrics come from offline training evaluation.",
  missing_artifacts: [],
  models: [
    {
      model_id: "logistic_regression",
      display_name: "Logistic Regression",
      version: "1.0.0",
      is_production: true,
      available: true,
      metrics: {
        accuracy: 0.61,
        recall: 0.54,
        precision: 0.12,
        f1: 0.2,
        roc_auc: 0.61,
      },
    },
  ],
};

describe("SettingsPage", () => {
  it("renders user management by default", async () => {
    listAdminUsersMock.mockResolvedValue(demoUsers);
    listRolePoliciesMock.mockResolvedValue(demoPolicies);
    getSystemSettingsMock.mockResolvedValue(demoSettings);
    listAuditLogsMock.mockResolvedValue(demoAuditLogs);
    getModelComparisonMock.mockResolvedValue(demoModelComparison);

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
    listAuditLogsMock.mockResolvedValue(demoAuditLogs);

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

  it("switches to the audit section", async () => {
    listAdminUsersMock.mockResolvedValue(demoUsers);
    listRolePoliciesMock.mockResolvedValue(demoPolicies);
    getSystemSettingsMock.mockResolvedValue(demoSettings);
    listAuditLogsMock.mockResolvedValue(demoAuditLogs);

    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: /^audit$/i }));

    await waitFor(() => {
      expect(screen.getByText(/audit trail/i)).toBeInTheDocument();
    });
    expect(screen.getAllByText("Login").length).toBeGreaterThan(0);
    expect(listAuditLogsMock).toHaveBeenCalled();
  });

  it("switches to the models section", async () => {
    listAdminUsersMock.mockResolvedValue(demoUsers);
    listRolePoliciesMock.mockResolvedValue(demoPolicies);
    getSystemSettingsMock.mockResolvedValue(demoSettings);
    listAuditLogsMock.mockResolvedValue(demoAuditLogs);
    getModelComparisonMock.mockResolvedValue(demoModelComparison);

    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: /^models$/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /ml model comparison/i })).toBeInTheDocument();
    });
    expect(screen.getByText("Production model")).toBeInTheDocument();
    expect(getModelComparisonMock).toHaveBeenCalled();
  });
});
