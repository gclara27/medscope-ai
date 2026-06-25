import type { AnalyticsParams, AnalyticsResponse } from "@/types/analytics";
import { api } from "./api";

/** Fetch aggregated prediction metrics (UC-060–062, RBE-014). */
export async function getAnalytics(
  params: AnalyticsParams = {},
): Promise<AnalyticsResponse> {
  const { data } = await api.get<AnalyticsResponse>("/analytics", { params });
  return data;
}
