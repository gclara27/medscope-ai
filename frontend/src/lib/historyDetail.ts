import type { HistoryDetailResponse } from "@/types/history";
import type { PredictRequest, PredictResponse } from "@/types/prediction";

/** Map stored history detail to prediction result shape for simulation reuse. */
export function historyDetailToPredictResponse(detail: HistoryDetailResponse): PredictResponse {
  return {
    id: detail.id,
    risk_score: detail.risk_score,
    risk_percent: detail.risk_percent,
    risk_level: detail.risk_level,
    confidence_score: detail.confidence_score,
    summary: detail.summary ?? "",
    model_version: detail.model_version,
    prediction_time_ms: detail.prediction_time_ms ?? 0,
    shap_explanations: detail.shap_explanations,
    created_at: detail.created_at,
  };
}

export function historyDetailBaselineRequest(detail: HistoryDetailResponse): PredictRequest {
  return detail.baseline_request;
}
