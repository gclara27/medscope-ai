import { api } from "@/services/api";
import type { AuditLogListParams, AuditLogListResponse } from "@/types/auditLogs";

/** List system audit logs for administrators (UC-085, RF-075). */
export async function listAuditLogs(
  params: AuditLogListParams = {},
): Promise<AuditLogListResponse> {
  const { data } = await api.get<AuditLogListResponse>("/admin/audit-logs", { params });
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    total: typeof data?.total === "number" ? data.total : 0,
    page: typeof data?.page === "number" ? data.page : 1,
    page_size: typeof data?.page_size === "number" ? data.page_size : 50,
  };
}
