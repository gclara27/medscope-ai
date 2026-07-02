import axios from "axios";

import { resolveApiBaseUrl } from "@/utils/apiBaseUrl";

export function getApiUnreachableMessage(): string {
  if (import.meta.env.DEV) {
    return "Cannot reach the API. Make sure the backend is running on port 8000.";
  }

  if (!resolveApiBaseUrl()) {
    return "Cannot reach the API. Check VITE_API_BASE_URL in the production build.";
  }

  return "Cannot reach the API. The server may be starting up — wait a moment and try again.";
}

export const API_UNREACHABLE_MESSAGE = getApiUnreachableMessage();

export const SESSION_EXPIRED_MESSAGE =
  "Your session has expired. Please sign in again.";

export const GENERIC_SERVER_ERROR_MESSAGE =
  "An unexpected error occurred. Please try again later.";

export interface ApiErrorMessages {
  fallback: string;
  forbidden?: string;
  notFound?: string;
  serverError?: string;
  unauthorized?: string;
  unavailable?: string;
}

const FIELD_LABELS: Record<string, string> = {
  age: "Age",
  gender: "Gender",
  glucose: "Blood glucose",
  blood_pressure: "Blood pressure",
  bmi: "BMI",
  hospital_stay_days: "Hospital stay",
  medications_count: "Medications",
  previous_admissions: "Previous admissions",
  risk_level: "Risk level",
  user_id: "Evaluator",
  date_from: "Start date",
  date_to: "End date",
  prediction_id: "Prediction",
};

function humanizeField(loc: string[]): string {
  const field = loc.filter((part) => part !== "body" && part !== "query").pop();
  if (!field || typeof field !== "string") {
    return loc.join(".");
  }
  return FIELD_LABELS[field] ?? field.replace(/_/g, " ");
}

/** Map FastAPI/Pydantic validation arrays to readable copy (UC-090). */
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
      const loc = "loc" in item && Array.isArray(item.loc) ? item.loc.map(String) : null;
      if (msg && loc?.length) {
        return `${humanizeField(loc)}: ${msg}`;
      }
      return msg;
    })
    .filter((value): value is string => Boolean(value));

  return messages.length > 0 ? messages.join(" ") : null;
}

function readDetailString(detail: unknown): string | null {
  return typeof detail === "string" && detail.trim().length > 0 ? detail : null;
}

/** Resolve a safe user-facing message from an Axios API error (UC-091). */
export function resolveApiErrorMessage(error: unknown, messages: ApiErrorMessages): string {
  if (!axios.isAxiosError(error)) {
    return messages.fallback;
  }

  if (!error.response) {
    return getApiUnreachableMessage();
  }

  const { status, data } = error.response;
  const detail = data?.detail;
  const detailText = readDetailString(detail);

  if (status === 401) {
    return messages.unauthorized ?? SESSION_EXPIRED_MESSAGE;
  }

  if (status === 403) {
    if (detailText === "Insufficient permissions" && messages.forbidden) {
      return messages.forbidden;
    }
    return messages.forbidden ?? detailText ?? "You do not have permission to perform this action.";
  }

  if (status === 404) {
    return detailText ?? messages.notFound ?? messages.fallback;
  }

  if (status === 422) {
    const validationMessage = formatValidationDetail(detail);
    if (validationMessage) {
      return validationMessage;
    }
  }

  if (status === 503) {
    return detailText ?? messages.unavailable ?? messages.fallback;
  }

  if (detailText) {
    return detailText;
  }

  if (status >= 500) {
    return messages.serverError ?? GENERIC_SERVER_ERROR_MESSAGE;
  }

  return messages.fallback;
}
