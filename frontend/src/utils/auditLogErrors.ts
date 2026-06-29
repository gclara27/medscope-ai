import { resolveApiErrorMessage } from "@/utils/apiErrors";

export function getAuditLogErrorMessage(error: unknown): string {
  return resolveApiErrorMessage(error, {
    fallback: "Unable to load audit logs. Please try again.",
    forbidden: "You do not have permission to view audit logs.",
    serverError: "Audit logs are unavailable. Please try again.",
  });
}
