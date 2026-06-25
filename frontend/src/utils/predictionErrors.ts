import axios from "axios";

export function formatValidationDetail(detail: unknown): string | null {
  if (!Array.isArray(detail)) {
    return null;
  }

  const messages = detail
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return null;
      }
      const msg = "msg" in item && typeof item.msg === "string" ? item.msg : null;
      const loc = "loc" in item && Array.isArray(item.loc) ? item.loc.join(".") : null;
      if (msg && loc) {
        return `${loc}: ${msg}`;
      }
      return msg;
    })
    .filter((value): value is string => Boolean(value));

  return messages.length > 0 ? messages.join(" ") : null;
}

export function getPredictionErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Cannot reach the API. Make sure the backend is running on port 8000.";
    }

    const { status, data } = error.response;
    const detail = data?.detail;

    if (status === 403) {
      return "You do not have permission to run predictions.";
    }
    if (status === 503) {
      return typeof detail === "string"
        ? detail
        : "The prediction service is temporarily unavailable.";
    }
    if (status === 422) {
      const validationMessage = formatValidationDetail(detail);
      if (validationMessage) {
        return validationMessage;
      }
    }
    if (typeof detail === "string") {
      return detail;
    }
    if (status >= 500) {
      return "Prediction failed due to a server error. Please try again.";
    }
  }

  return "Unable to generate prediction. Please try again.";
}
