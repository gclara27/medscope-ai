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
  refreshCurrentUser,
  type LoginCredentials,
} from "@/services/auth";
import { setAuthToken, setOnSessionExpired } from "@/services/api";
import type { AuthSession } from "@/types/auth";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/utils/storage";

function hasStoredSession(): boolean {
  return Boolean(localStorage.getItem(AUTH_TOKEN_KEY) && localStorage.getItem(AUTH_USER_KEY));
}

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
  const [isBootstrapping, setIsBootstrapping] = useState(hasStoredSession);

  useEffect(() => {
    setOnSessionExpired(() => {
      setSession(null);
    });
    return () => setOnSessionExpired(null);
  }, []);

  useEffect(() => {
    if (!hasStoredSession()) {
      setIsBootstrapping(false);
      return;
    }

    let cancelled = false;
    void refreshCurrentUser()
      .then((refreshed) => {
        if (!cancelled) {
          setSession(refreshed);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSession(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const refreshed = await refreshCurrentUser();
      setSession(refreshed);
    } catch {
      setSession(null);
    }
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
      isBootstrapping,
      login,
      logout,
      refreshSession,
    }),
    [session, isLoading, isBootstrapping, login, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
