import axios from "axios";

import { API_UNREACHABLE_MESSAGE, resolveApiErrorMessage } from "@/utils/apiErrors";

export function getAuthErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      return "Invalid email or password. Please try again.";
    }
    if (!error.response) {
      return API_UNREACHABLE_MESSAGE;
    }
  }

  return resolveApiErrorMessage(error, {
    fallback: "Unable to sign in. Please try again.",
    serverError: "Authentication service is unavailable. Check that PostgreSQL is running.",
  });
}
