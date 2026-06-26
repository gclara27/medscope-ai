import { formatValidationDetail, resolveApiErrorMessage } from "@/utils/apiErrors";

export { formatValidationDetail };

export function getPredictionErrorMessage(error: unknown): string {
  return resolveApiErrorMessage(error, {
    fallback: "Unable to generate prediction. Please try again.",
    forbidden: "You do not have permission to run predictions.",
    serverError: "Prediction failed due to a server error. Please try again.",
    unavailable: "The prediction service is temporarily unavailable.",
  });
}
