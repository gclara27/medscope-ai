import {
  formatAuditActionLabel,
  formatAuditDateTime,
  formatAuditDetails,
  formatAuditEntity,
  formatAuditUser,
} from "@/lib/auditLogDisplay";
import type { AuditLogListItem } from "@/types/auditLogs";

interface AuditLogsTableProps {
  items: AuditLogListItem[];
}

/** System audit log rows for admin review (T-X06-06, UC-085). */
export function AuditLogsTable({ items }: AuditLogsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead>
          <tr className="border-b border-outline-variant text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            <th className="px-3 py-3 font-medium">Date / time</th>
            <th className="px-3 py-3 font-medium">Action</th>
            <th className="px-3 py-3 font-medium">User</th>
            <th className="px-3 py-3 font-medium">Entity</th>
            <th className="px-3 py-3 font-medium">Details</th>
          </tr>
        </thead>
        <tbody className="text-sm text-on-surface">
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-outline-variant/70 align-top transition-colors hover:bg-surface-container-low"
            >
              <td className="px-3 py-3 text-xs text-on-surface-variant">
                {formatAuditDateTime(item.created_at)}
              </td>
              <td className="px-3 py-3">
                <span className="block font-medium text-on-surface">
                  {formatAuditActionLabel(item.action_type)}
                </span>
                <span className="text-xs text-on-surface-variant">{item.action_type}</span>
              </td>
              <td className="px-3 py-3">
                <span className="block font-medium text-on-surface">
                  {formatAuditUser(item.user)}
                </span>
                {item.user ? (
                  <span className="text-xs text-on-surface-variant">{item.user.email}</span>
                ) : null}
              </td>
              <td className="px-3 py-3 text-xs text-on-surface-variant">
                {formatAuditEntity(item)}
              </td>
              <td className="max-w-sm px-3 py-3 text-xs text-on-surface-variant">
                <span className="line-clamp-3 break-words">{formatAuditDetails(item.action_details)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
