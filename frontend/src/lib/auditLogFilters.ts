import { getAnalyticsDateRangeLabel, resolveAnalyticsDateRange } from "@/lib/analyticsDateRange";
import { formatAuditActionLabel } from "@/lib/auditLogDisplay";
import type { AnalyticsDateRangeValue } from "@/types/analytics";
import type { AuditLogListParams } from "@/types/auditLogs";
import type { AdminUser } from "@/types/adminUser";

export interface AuditLogFiltersValue {
  dateRange: AnalyticsDateRangeValue;
  action_type: string;
  user_id: string;
}

export const DEFAULT_AUDIT_LOG_FILTERS: AuditLogFiltersValue = {
  dateRange: { preset: "all" },
  action_type: "all",
  user_id: "all",
};

export function resolveAuditLogFilters(
  filters: AuditLogFiltersValue,
  page: number,
  pageSize: number,
): AuditLogListParams {
  const params: AuditLogListParams = {
    ...resolveAnalyticsDateRange(filters.dateRange),
    page,
    page_size: pageSize,
  };

  if (filters.action_type !== "all") {
    params.action_type = filters.action_type;
  }

  if (filters.user_id !== "all") {
    params.user_id = filters.user_id;
  }

  return params;
}

export function hasActiveAuditLogFilters(filters: AuditLogFiltersValue): boolean {
  return (
    filters.action_type !== DEFAULT_AUDIT_LOG_FILTERS.action_type ||
    filters.user_id !== DEFAULT_AUDIT_LOG_FILTERS.user_id ||
    filters.dateRange.preset !== DEFAULT_AUDIT_LOG_FILTERS.dateRange.preset ||
    Boolean(filters.dateRange.date_from) ||
    Boolean(filters.dateRange.date_to)
  );
}

export function getAuditLogFiltersSummary(
  filters: AuditLogFiltersValue,
  users: AdminUser[],
): string {
  const parts: string[] = [getAnalyticsDateRangeLabel(filters.dateRange)];

  if (filters.action_type !== "all") {
    parts.push(formatAuditActionLabel(filters.action_type));
  }

  if (filters.user_id !== "all") {
    const user = users.find((entry) => entry.id === filters.user_id);
    parts.push(user?.email ?? "Selected user");
  }

  return parts.join(" · ");
}
