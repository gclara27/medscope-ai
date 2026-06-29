import { resolveApiErrorMessage } from "@/utils/apiErrors";

export function getSupportContactErrorMessage(error: unknown): string {
  return resolveApiErrorMessage(error, {
    fallback: "Unable to load support contact details. Please try again.",
    serverError: "Support contact is temporarily unavailable.",
  });
}
