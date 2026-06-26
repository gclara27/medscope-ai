import type { HistoryDetailResponse, HistoryListParams, HistoryListResponse } from "@/types/history";
import { api } from "./api";

/** List prediction history with optional filters (UC-050–051, RBE-012). */
export async function listHistory(
  params: HistoryListParams = {},
): Promise<HistoryListResponse> {
  const { data } = await api.get<HistoryListResponse>("/history", { params });
  return data;
}

/** Fetch a single historical prediction with inputs, SHAP, and simulations (RF-052). */
export async function getHistoryDetail(predictionId: string): Promise<HistoryDetailResponse> {
  const { data } = await api.get<HistoryDetailResponse>(`/history/${predictionId}`);
  return data;
}
