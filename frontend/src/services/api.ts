import axios from "axios";

import { clearStoredSession } from "@/utils/session";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

let onSessionExpired: (() => void) | null = null;

export function setOnSessionExpired(handler: (() => void) | null): void {
  onSessionExpired = handler;
}

export function setAuthToken(token: string | null): void {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url ?? "");
    const isLoginRequest = requestUrl.includes("/auth/login");

    if (error.response?.status === 401 && !isLoginRequest) {
      clearStoredSession();
      setAuthToken(null);
      onSessionExpired?.();
    }

    return Promise.reject(error);
  },
);
