import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/utils/storage";

export function clearStoredSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}
