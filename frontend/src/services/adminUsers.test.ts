import { describe, expect, it, vi } from "vitest";

import { createAdminUser, listAdminUsers, updateAdminUser } from "@/services/adminUsers";

vi.mock("./api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

import { api } from "./api";

describe("adminUsers service", () => {
  it("lists admin users", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { items: [], total: 0 },
    });

    const result = await listAdminUsers();

    expect(api.get).toHaveBeenCalledWith("/admin/users");
    expect(result.total).toBe(0);
  });

  it("creates and updates admin users", async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        id: "1",
        email: "user@medscope.ai",
        first_name: "Test",
        last_name: "User",
        role: "nurse",
        is_active: true,
        created_at: "2026-06-01T10:00:00Z",
      },
    });
    vi.mocked(api.patch).mockResolvedValue({
      data: {
        id: "1",
        email: "user@medscope.ai",
        first_name: "Test",
        last_name: "User",
        role: "analyst",
        is_active: false,
        created_at: "2026-06-01T10:00:00Z",
      },
    });

    await createAdminUser({
      email: "user@medscope.ai",
      password: "MedScope123!",
      first_name: "Test",
      last_name: "User",
      role: "nurse",
    });
    const updated = await updateAdminUser("1", { role: "analyst", is_active: false });

    expect(api.post).toHaveBeenCalledWith("/admin/users", expect.objectContaining({
      email: "user@medscope.ai",
    }));
    expect(api.patch).toHaveBeenCalledWith("/admin/users/1", {
      role: "analyst",
      is_active: false,
    });
    expect(updated.role).toBe("analyst");
  });
});
