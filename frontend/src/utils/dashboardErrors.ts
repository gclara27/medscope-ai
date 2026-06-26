import { resolveApiErrorMessage } from "@/utils/apiErrors";

export function getDashboardErrorMessage(error: unknown): string {
  return resolveApiErrorMessage(error, {
    fallback: "Unable to load the dashboard. Please try again.",
    forbidden: "You do not have permission to view the clinical dashboard.",
    serverError: "Unable to load the dashboard due to a server error. Please try again.",
  });
}
