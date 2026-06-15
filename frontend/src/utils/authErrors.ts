import axios from "axios";

export function getAuthErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      return "Invalid email or password. Please try again.";
    }
    if (!error.response) {
      return "Cannot reach the API. Make sure the backend is running on port 8000.";
    }
    if (error.response.status >= 500) {
      return "Authentication service is unavailable. Check that PostgreSQL is running.";
    }
    const detail = error.response.data?.detail;
    if (typeof detail === "string") {
      return detail;
    }
  }
  return "Unable to sign in. Please try again.";
}
