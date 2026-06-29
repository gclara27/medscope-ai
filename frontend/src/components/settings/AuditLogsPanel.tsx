import { Filter, ScrollText } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  HistoryCustomDateApplyRow,
  HistoryCustomDateInputs,
  HistoryDateRangePresetSelect,
  HISTORY_FILTER_SELECT_CLASSNAME,
  useHistoryDateRangeEditor,
} from "@/components/clinical/HistoryDateRangeFields";
import { AuditLogsTable } from "@/components/settings/AuditLogsTable";
import { Alert } from "@/components/Alert";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  AUDIT_ACTION_TYPE_OPTIONS,
  formatAuditRangeLabel,
} from "@/lib/auditLogDisplay";
import {
  DEFAULT_AUDIT_LOG_FILTERS,
  getAuditLogFiltersSummary,
  hasActiveAuditLogFilters,
  resolveAuditLogFilters,
  type AuditLogFiltersValue,
} from "@/lib/auditLogFilters";
import { cn } from "@/lib/utils";
import { listAdminUsers } from "@/services/adminUsers";
import { listAuditLogs } from "@/services/auditLogs";
import type { AdminUser } from "@/types/adminUser";
import type { AuditLogListItem } from "@/types/auditLogs";
import { getAuditLogErrorMessage } from "@/utils/auditLogErrors";

const AUDIT_PAGE_SIZE = 20;

/** Admin audit trail listing with filters and pagination (T-X06-06, UC-085, RFW-025). */
export function AuditLogsPanel() {
  const [filters, setFilters] = useState<AuditLogFiltersValue>(DEFAULT_AUDIT_LOG_FILTERS);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [items, setItems] = useState<AuditLogListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryFilters = useMemo(() => resolveAuditLogFilters(filters, page, AUDIT_PAGE_SIZE), [filters, page]);
  const filtersActive = hasActiveAuditLogFilters(filters);
  const {
    isCustom,
    customDraft,
    customError,
    setCustomDraft,
    handlePresetChange,
    handleCustomApply,
  } = useHistoryDateRangeEditor({
    value: filters.dateRange,
    onChange: (dateRange) => {
      setPage(1);
      setFilters((current) => ({ ...current, dateRange }));
    },
  });

  const loadAuditLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listAuditLogs(queryFilters);
      setItems(response.items);
      setTotal(response.total);
      setPage(response.page);
    } catch (loadError) {
      setItems([]);
      setTotal(0);
      setError(getAuditLogErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [queryFilters]);

  useEffect(() => {
    void loadAuditLogs();
  }, [loadAuditLogs]);

  useEffect(() => {
    let cancelled = false;

    void listAdminUsers()
      .then((response) => {
        if (!cancelled) {
          setUsers(response.items);
        }
      })
      .catch(() => {
        // User filter is optional; the audit list still loads without it.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const hasPrevious = page > 1;
  const hasNext = page * AUDIT_PAGE_SIZE < total;

  function handleResetFilters() {
    setPage(1);
    setFilters(DEFAULT_AUDIT_LOG_FILTERS);
  }

  return (
    <Card className="border-outline-variant bg-surface-container-lowest shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-lg text-on-surface">
          <ScrollText className="h-5 w-5 text-primary" aria-hidden />
          Audit trail
        </CardTitle>
        <p className="text-sm text-on-surface-variant">
          Review critical platform actions for governance and compliance. Logs exclude clinical
          values and credentials.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <section
          aria-label="Audit log filters"
          className="rounded-xl border border-outline-variant bg-surface-container-low p-4"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-on-surface">
              <Filter className="h-4 w-4 text-primary" aria-hidden />
              Filters
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              disabled={isLoading || !filtersActive}
            >
              Reset
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3 lg:items-end">
              <HistoryDateRangePresetSelect
                value={filters.dateRange}
                onPresetChange={handlePresetChange}
                disabled={isLoading}
              />

              <div className="flex min-w-0 flex-col gap-2">
                <Label htmlFor="audit-action-filter">Action type</Label>
                <select
                  id="audit-action-filter"
                  className={HISTORY_FILTER_SELECT_CLASSNAME}
                  value={filters.action_type}
                  disabled={isLoading}
                  onChange={(event) => {
                    setPage(1);
                    setFilters((current) => ({
                      ...current,
                      action_type: event.target.value,
                    }));
                  }}
                >
                  {AUDIT_ACTION_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex min-w-0 flex-col gap-2">
                <Label htmlFor="audit-user-filter">User</Label>
                <select
                  id="audit-user-filter"
                  className={HISTORY_FILTER_SELECT_CLASSNAME}
                  value={filters.user_id}
                  disabled={isLoading}
                  onChange={(event) => {
                    setPage(1);
                    setFilters((current) => ({
                      ...current,
                      user_id: event.target.value,
                    }));
                  }}
                >
                  <option value="all">All users</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isCustom ? (
              <div className="space-y-3 rounded-lg border border-outline-variant/70 bg-surface-container-lowest p-4">
                <HistoryCustomDateInputs
                  customDraft={customDraft}
                  onDraftChange={setCustomDraft}
                  customError={customError}
                  disabled={isLoading}
                />
                <HistoryCustomDateApplyRow
                  customError={customError}
                  disabled={isLoading}
                  onApply={handleCustomApply}
                />
              </div>
            ) : null}
          </div>

          <p className="mt-4 text-xs text-on-surface-variant">
            Active filters: {getAuditLogFiltersSummary(filters, users)}
          </p>
        </section>

        {error ? <Alert variant="error">{error}</Alert> : null}

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-on-surface-variant">
              {formatAuditRangeLabel(page, AUDIT_PAGE_SIZE, total)}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={!hasPrevious || isLoading}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => current + 1)}
                disabled={!hasNext || isLoading}
              >
                Next
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className={cn("flex justify-center py-12")}>
              <Spinner label="Loading audit logs" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-outline-variant px-4 py-10 text-center text-sm text-on-surface-variant">
              No audit events match the current filters.
            </div>
          ) : (
            <AuditLogsTable items={items} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
