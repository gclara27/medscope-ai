import axios from "axios";

import { formatValidationDetail } from "@/utils/predictionErrors";

export function getHistoryErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Cannot reach the API. Make sure the backend is running on port 8000.";
    }

    const { status, data } = error.response;
    const detail = data?.detail;

    if (status === 403) {
      return "You do not have permission to view prediction history.";
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
      return "Unable to load history due to a server error. Please try again.";
    }
  }

  return "Unable to load prediction history. Please try again.";
}
