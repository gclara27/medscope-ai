import type { PredictRequest, PredictResponse } from "@/types/prediction";
import { api } from "./api";

/** Run readmission risk prediction (UC-022, RBE-010). */
export async function createPrediction(
  payload: PredictRequest,
): Promise<PredictResponse> {
  const { data } = await api.post<PredictResponse>("/predict", payload);
  return data;
}
