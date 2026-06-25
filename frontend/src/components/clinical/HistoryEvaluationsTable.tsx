import { RISK_BADGE_CLASSES, RISK_BADGE_LABELS } from "@/lib/riskDisplay";
import {
  formatEvaluatorName,
  formatHistoryDateTime,
  formatPatientSnapshot,
} from "@/lib/historyDisplay";
import { cn } from "@/lib/utils";
import type { HistoryListItem } from "@/types/history";

interface HistoryEvaluationsTableProps {
  items: HistoryListItem[];
}

/** Paginated prediction history rows (T-601, RFW-018, UC-050). */
export function HistoryEvaluationsTable({ items }: HistoryEvaluationsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-outline-variant text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            <th className="px-3 py-3 font-medium">Date / time</th>
            <th className="px-3 py-3 font-medium">Evaluator</th>
            <th className="px-3 py-3 font-medium">Patient snapshot</th>
            <th className="px-3 py-3 font-medium">Risk score</th>
            <th className="px-3 py-3 font-medium">Summary</th>
            <th className="px-3 py-3 font-medium">Model</th>
          </tr>
        </thead>
        <tbody className="text-sm text-on-surface">
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-outline-variant/70 transition-colors hover:bg-surface-container-low"
            >
              <td className="px-3 py-3 font-mono text-xs text-on-surface-variant">
                {formatHistoryDateTime(item.created_at)}
              </td>
              <td className="px-3 py-3">
                <span className="block font-medium">{formatEvaluatorName(item.user)}</span>
                <span className="text-xs capitalize text-on-surface-variant">{item.user.role}</span>
              </td>
              <td className="px-3 py-3 text-on-surface-variant">
                {formatPatientSnapshot(item.patient_input)}
              </td>
              <td className="px-3 py-3">
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono font-semibold tabular-nums">
                    {item.risk_percent.toFixed(1)}%
                  </span>
                  <span
                    className={cn(
                      "inline-flex w-fit rounded-md px-2 py-0.5 text-xs font-semibold",
                      RISK_BADGE_CLASSES[item.risk_level],
                    )}
                  >
                    {RISK_BADGE_LABELS[item.risk_level]}
                  </span>
                </div>
              </td>
              <td className="max-w-xs px-3 py-3 text-on-surface-variant">
                {item.summary ?? "—"}
              </td>
              <td className="px-3 py-3 font-mono text-xs text-on-surface-variant">
                {item.model_version}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
