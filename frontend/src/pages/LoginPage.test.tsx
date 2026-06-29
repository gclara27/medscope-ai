import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/context/AuthContext";
import { LoginPage } from "@/pages/LoginPage";
import { login } from "@/services/auth";

vi.mock("@/services/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/auth")>();
  return {
    ...actual,
    loadStoredSession: () => null,
    login: vi.fn(),
  };
});

const clinicianUser = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "clinician@medscope.ai",
  first_name: "Clara",
  last_name: "Clinician",
  role: "clinician" as const,
};

function renderLoginPage(initialPath = "/login") {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<div>Dashboard home</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

async function submitInvalidLogin(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/email/i), "wrong@example.com");
  await user.type(screen.getByLabelText(/password/i), "bad-password");
  await user.click(screen.getByRole("button", { name: /authenticate/i }));
  await screen.findByText(/invalid email or password/i);
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(login).mockRejectedValue(
      new axios.AxiosError("Unauthorized", undefined, undefined, undefined, {
        status: 401,
        data: { detail: "Invalid credentials" },
        statusText: "Unauthorized",
        headers: {},
        config: {} as never,
      }),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders email and password fields", () => {
    renderLoginPage();

    expect(screen.getByLabelText(/email/i)).toHaveValue("");
    expect(screen.getByLabelText(/password/i)).toHaveValue("");
    expect(screen.getByLabelText(/email/i)).toBeRequired();
    expect(screen.getByLabelText(/password/i)).toBeRequired();
    expect(screen.getByPlaceholderText(/your\.email@hospital\.org/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /authenticate/i }),
    ).toBeInTheDocument();
  });

  it("navigates to dashboard after successful authentication", async () => {
    vi.mocked(login).mockResolvedValue({
      accessToken: "jwt-token",
      user: clinicianUser,
    });

    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/email/i), "clinician@medscope.ai");
    await user.type(screen.getByLabelText(/password/i), "MedScope123!");
    await user.click(screen.getByRole("button", { name: /authenticate/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: "clinician@medscope.ai",
        password: "MedScope123!",
      });
    });
    expect(await screen.findByText("Dashboard home")).toBeInTheDocument();
  });

  it("dismisses login error when user focuses a field", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await submitInvalidLogin(user);
    await user.click(screen.getByLabelText(/password/i));

    expect(screen.queryByText(/invalid email or password/i)).not.toBeInTheDocument();
  });

  it("auto-dismisses login error after a few seconds", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "bad-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /authenticate/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.queryByText(/invalid email or password/i)).not.toBeInTheDocument();
    });
  });
});
