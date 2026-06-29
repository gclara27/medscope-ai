import { resolveApiErrorMessage } from "@/utils/apiErrors";

export function getMlComparisonErrorMessage(error: unknown): string {
  return resolveApiErrorMessage(error, {
    fallback: "Unable to load model comparison. Please try again.",
    forbidden: "You do not have permission to view ML model comparison.",
    serverError: "Model comparison is unavailable. Please try again.",
  });
}
