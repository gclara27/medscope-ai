import { resolveApiErrorMessage } from "@/utils/apiErrors";

export function getAdminUserErrorMessage(error: unknown): string {
  return resolveApiErrorMessage(error, {
    fallback: "Unable to update users. Please try again.",
    forbidden: "You do not have permission to manage users.",
    serverError: "User administration is unavailable. Please try again.",
  });
}
