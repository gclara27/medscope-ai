import { resolveApiErrorMessage } from "@/utils/apiErrors";

export function getAnalyticsErrorMessage(error: unknown): string {
  return resolveApiErrorMessage(error, {
    fallback: "Unable to load analytics. Please try again.",
    forbidden: "You do not have permission to view analytics.",
    serverError: "Unable to load analytics due to a server error. Please try again.",
  });
}
