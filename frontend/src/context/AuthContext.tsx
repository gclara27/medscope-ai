import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { AuthContext, type AuthContextValue } from "@/context/auth-context";
import {
  loadStoredSession,
  login as loginRequest,
  logout as logoutRequest,
  type LoginCredentials,
} from "@/services/auth";
import { setAuthToken, setOnSessionExpired } from "@/services/api";
import type { AuthSession } from "@/types/auth";

function readInitialSession(): AuthSession | null {
  const session = loadStoredSession();
  if (session) {
    setAuthToken(session.accessToken);
  }
  return session;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(readInitialSession);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setOnSessionExpired(() => {
      setSession(null);
    });
    return () => setOnSessionExpired(null);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const nextSession = await loginRequest(credentials);
      setSession(nextSession);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logoutRequest();
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.accessToken),
      isLoading,
      login,
      logout,
    }),
    [session, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
