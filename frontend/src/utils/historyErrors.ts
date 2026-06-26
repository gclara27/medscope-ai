import { resolveApiErrorMessage } from "@/utils/apiErrors";

export function getHistoryErrorMessage(error: unknown): string {
  return resolveApiErrorMessage(error, {
    fallback: "Unable to load prediction history. Please try again.",
    forbidden: "You do not have permission to view prediction history.",
    notFound: "The requested evaluation was not found.",
    serverError: "Unable to load history due to a server error. Please try again.",
  });
}
