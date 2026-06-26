/** Prediction history API types (aligned with backend/schemas/history.py). */

import type { PredictRequest, RiskLevel, ShapExplanationItem } from "@/types/prediction";

export interface HistoryPatientSummary {
  age: number | null;
  gender: string | null;
  glucose: number | null;
  hospital_stay_days: number | null;
}

export interface HistoryPatientDetail {
  age: number | null;
  gender: string | null;
  glucose: number | null;
  blood_pressure: number | null;
  medications_count: number | null;
  previous_admissions: number | null;
  hospital_stay_days: number | null;
  bmi: number | null;
}

export interface HistorySimulationItem {
  id: string;
  created_at: string;
  original_risk_percent: number;
  simulated_risk_percent: number;
  delta_risk_percent: number;
  simulation_summary: string | null;
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

/** Historical prediction detail (RF-052, UC-052). */
export interface HistoryDetailResponse {
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
  patient_input: HistoryPatientDetail | null;
  baseline_request: PredictRequest;
  shap_explanations: ShapExplanationItem[];
  simulations: HistorySimulationItem[];
}
