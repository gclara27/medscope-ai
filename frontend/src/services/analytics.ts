import type { AnalyticsParams, AnalyticsResponse } from "@/types/analytics";
import { api } from "./api";

/** Fetch aggregated prediction metrics (UC-060–062, RBE-014). */
export async function getAnalytics(
  params: AnalyticsParams = {},
): Promise<AnalyticsResponse> {
  const { data } = await api.get<AnalyticsResponse>("/analytics", { params });
  return data;
}

function extractFilename(contentDisposition: string | undefined, fallback: string): string {
  if (!contentDisposition) {
    return fallback;
  }
  const match = /filename="([^"]+)"/i.exec(contentDisposition);
  return match?.[1] ?? fallback;
}

/** Download analytics dashboard report as PDF (T-X04, UC-063). */
export async function downloadAnalyticsPdf(params: AnalyticsParams = {}): Promise<void> {
  const response = await api.get<Blob>("/analytics/export.pdf", {
    params,
    responseType: "blob",
  });

  const filename = extractFilename(
    response.headers["content-disposition"],
    "medscope-analytics-report.pdf",
  );
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
