import type { AuditLogListItem, AuditLogUserSummary } from "@/types/auditLogs";

export const AUDIT_ACTION_TYPE_OPTIONS = [
  { value: "all", label: "All actions" },
  { value: "auth.login", label: "Login" },
  { value: "auth.logout", label: "Logout" },
  { value: "prediction.create", label: "Prediction created" },
  { value: "simulation.create", label: "Simulation created" },
  { value: "admin.user.create", label: "User created" },
  { value: "admin.user.update", label: "User updated" },
  { value: "admin.role.update", label: "Role policy updated" },
  { value: "admin.settings.update", label: "Settings updated" },
] as const;

const ACTION_LABELS = Object.fromEntries(
  AUDIT_ACTION_TYPE_OPTIONS.filter((option) => option.value !== "all").map((option) => [
    option.value,
    option.label,
  ]),
) as Record<string, string>;

export function formatAuditActionLabel(actionType: string): string {
  return ACTION_LABELS[actionType] ?? actionType;
}

export function formatAuditUser(user: AuditLogUserSummary | null): string {
  if (!user) {
    return "System";
  }

  const fullName = `${user.first_name} ${user.last_name}`.trim();
  return fullName || user.email;
}

export function formatAuditDateTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatAuditEntity(item: AuditLogListItem): string {
  if (!item.entity_type && !item.entity_id) {
    return "—";
  }

  const typeLabel = item.entity_type ?? "entity";
  if (!item.entity_id) {
    return typeLabel;
  }

  return `${typeLabel} · ${item.entity_id.slice(0, 8)}…`;
}

export function formatAuditDetails(details: Record<string, unknown> | null): string {
  if (!details || Object.keys(details).length === 0) {
    return "—";
  }

  try {
    return JSON.stringify(details);
  } catch {
    return "—";
  }
}

export function formatAuditRangeLabel(page: number, pageSize: number, total: number): string {
  if (total === 0) {
    return "No audit events";
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `${start}–${end} of ${total.toLocaleString()} events`;
}
