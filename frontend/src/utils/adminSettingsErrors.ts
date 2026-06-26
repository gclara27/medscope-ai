import { resolveApiErrorMessage } from "@/utils/apiErrors";

export function getAdminSettingsErrorMessage(error: unknown): string {
  return resolveApiErrorMessage(error, {
    fallback: "Unable to update settings. Please try again.",
    forbidden: "You do not have permission to manage platform settings.",
    serverError: "Platform settings are unavailable. Please try again.",
  });
}
