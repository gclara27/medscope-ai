/** Prediction history API types (aligned with backend/schemas/history.py). */

import type { RiskLevel } from "@/types/prediction";

export interface HistoryPatientSummary {
  age: number | null;
  gender: string | null;
  glucose: number | null;
  hospital_stay_days: number | null;
}

export interface HistoryUserSummary {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

/** Single prediction row in GET /history (UC-050). */
export interface HistoryListItem {
  id: string;
  risk_score: number;
  risk_percent: number;
  risk_level: RiskLevel;
  confidence_score: number | null;
  summary: string | null;
  model_version: string;
  prediction_time_ms: number | null;
  created_at: string;
  user: HistoryUserSummary;
  patient_input: HistoryPatientSummary | null;
}

/** Paginated history list (RF-051). */
export interface HistoryListResponse {
  items: HistoryListItem[];
  total: number;
  limit: number;
  offset: number;
}

/** Query params for GET /history (UC-051). */
export interface HistoryListParams {
  risk_level?: RiskLevel;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}
