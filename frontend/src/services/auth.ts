import type { AuthSession, LoginResponse } from "@/types/auth";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/utils/storage";
import { clearStoredSession } from "@/utils/session";
import { api, setAuthToken } from "./api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export function loadStoredSession(): AuthSession | null {
  const accessToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const userRaw = localStorage.getItem(AUTH_USER_KEY);
  if (!accessToken || !userRaw) {
    return null;
  }
  try {
    return { accessToken, user: JSON.parse(userRaw) };
  } catch {
    clearSession();
    return null;
  }
}

export function persistSession(session: AuthSession): void {
  localStorage.setItem(AUTH_TOKEN_KEY, session.accessToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
  setAuthToken(session.accessToken);
}

export function clearSession(): void {
  clearStoredSession();
  setAuthToken(null);
}

export async function login(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  const { data } = await api.post<LoginResponse>("/auth/login", credentials);
  const session: AuthSession = {
    accessToken: data.access_token,
    user: data.user,
  };
  persistSession(session);
  return session;
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch {
    // Client-side logout still clears local session (UC-002).
  } finally {
    clearSession();
  }
}
