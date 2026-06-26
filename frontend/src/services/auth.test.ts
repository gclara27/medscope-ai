import { beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/utils/storage";
import { api, setAuthToken } from "./api";
import { clearSession, logout, persistSession, refreshCurrentUser } from "./auth";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api")>();
  return {
    ...actual,
    api: {
      get: vi.fn(),
      post: vi.fn(),
    },
    setAuthToken: vi.fn(),
  };
});

const demoUser = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "clinician@medscope.ai",
  first_name: "Clara",
  last_name: "Clinician",
  role: "clinician",
};

describe("logout", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("calls POST /auth/logout and clears stored session", async () => {
    persistSession({ accessToken: "token-123", user: demoUser });
    vi.mocked(api.post).mockResolvedValue({
      data: { message: "Logged out successfully" },
    });

    await logout();

    expect(api.post).toHaveBeenCalledWith("/auth/logout");
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(AUTH_USER_KEY)).toBeNull();
    expect(setAuthToken).toHaveBeenLastCalledWith(null);
  });

  it("clears stored session even when the API request fails", async () => {
    persistSession({ accessToken: "token-123", user: demoUser });
    vi.mocked(api.post).mockRejectedValue(new Error("network error"));

    await logout();

    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(AUTH_USER_KEY)).toBeNull();
    expect(setAuthToken).toHaveBeenLastCalledWith(null);
  });
});

describe("clearSession", () => {
  it("removes token and user from storage", () => {
    persistSession({ accessToken: "token-123", user: demoUser });
    clearSession();
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(AUTH_USER_KEY)).toBeNull();
  });
});

describe("refreshCurrentUser", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("updates stored user from GET /auth/me", async () => {
    persistSession({ accessToken: "token-123", user: demoUser });
    vi.mocked(api.get).mockResolvedValue({
      data: {
        ...demoUser,
        permissions: {
          dashboard: true,
          evaluation: true,
          simulation: true,
          history: true,
          analytics: false,
          settings: false,
        },
      },
    });

    const refreshed = await refreshCurrentUser();

    expect(api.get).toHaveBeenCalledWith("/auth/me");
    expect(refreshed?.user.permissions?.evaluation).toBe(true);
    expect(JSON.parse(localStorage.getItem(AUTH_USER_KEY) ?? "{}").permissions.evaluation).toBe(
      true,
    );
  });
});
