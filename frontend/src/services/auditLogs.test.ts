import { describe, expect, it, vi } from "vitest";

import { listAuditLogs } from "@/services/auditLogs";

vi.mock("./api", () => ({
  api: {
    get: vi.fn(),
  },
}));

import { api } from "./api";

describe("auditLogs service", () => {
  it("lists audit logs with filters", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        items: [
          {
            id: "log-1",
            user_id: "user-1",
            action_type: "auth.login",
            entity_type: "user",
            entity_id: "user-1",
            action_details: { email: "admin@medscope.ai" },
            created_at: "2026-06-11T10:00:00Z",
            user: {
              id: "user-1",
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
      },
    });

    const result = await listAuditLogs({
      action_type: "auth.login",
      page: 1,
      page_size: 20,
    });

    expect(api.get).toHaveBeenCalledWith("/admin/audit-logs", {
      params: {
        action_type: "auth.login",
        page: 1,
        page_size: 20,
      },
    });
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
  });
});
