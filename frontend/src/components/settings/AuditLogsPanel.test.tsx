import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AuditLogsPanel } from "@/components/settings/AuditLogsPanel";

const listAuditLogsMock = vi.fn();
const listAdminUsersMock = vi.fn();

vi.mock("@/services/auditLogs", () => ({
  listAuditLogs: (...args: unknown[]) => listAuditLogsMock(...args),
}));

vi.mock("@/services/adminUsers", () => ({
  listAdminUsers: (...args: unknown[]) => listAdminUsersMock(...args),
}));

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
    {
      id: "log-2",
      user_id: "clinician-1",
      action_type: "prediction.create",
      entity_type: "prediction",
      entity_id: "prediction-1",
      action_details: { prediction_id: "prediction-1", risk_level: "medium" },
      created_at: "2026-06-11T09:30:00Z",
      user: {
        id: "clinician-1",
        email: "clinician@medscope.ai",
        first_name: "Clara",
        last_name: "Clinician",
        role: "clinician",
      },
    },
  ],
  total: 2,
  page: 1,
  page_size: 20,
};

describe("AuditLogsPanel", () => {
  it("renders audit logs and supports action filter", async () => {
    listAuditLogsMock.mockResolvedValue(demoAuditLogs);
    listAdminUsersMock.mockResolvedValue({
      items: [
        {
          id: "admin-1",
          email: "admin@medscope.ai",
          first_name: "Admin",
          last_name: "User",
          role: "admin",
          is_active: true,
          created_at: "2026-06-01T10:00:00Z",
        },
      ],
      total: 1,
    });

    const user = userEvent.setup();
    render(<AuditLogsPanel />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /audit trail/i })).toBeInTheDocument();
    });
    expect(screen.getAllByText("Login").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Prediction created").length).toBeGreaterThan(0);
    expect(screen.getAllByText("admin@medscope.ai").length).toBeGreaterThan(0);

    await user.selectOptions(screen.getByLabelText(/action type/i), "prediction.create");

    await waitFor(() => {
      expect(listAuditLogsMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ action_type: "prediction.create", page: 1 }),
      );
    });
  });
});
