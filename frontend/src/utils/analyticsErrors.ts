import { resolveApiErrorMessage } from "@/utils/apiErrors";

export function getAnalyticsErrorMessage(error: unknown): string {
  return resolveApiErrorMessage(error, {
    fallback: "Unable to load analytics. Please try again.",
    forbidden: "You do not have permission to view analytics.",
    serverError: "Unable to load analytics due to a server error. Please try again.",
  });
}

export function getAnalyticsExportErrorMessage(error: unknown): string {
  return resolveApiErrorMessage(error, {
    fallback: "Unable to export the analytics report. Please try again.",
    forbidden: "You do not have permission to export analytics.",
    serverError: "Unable to generate the analytics report. Please try again.",
  });
}
