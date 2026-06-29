import { Link } from "react-router-dom";

import { RiskScoreCell } from "@/components/clinical/RiskScoreCell";
import {
  formatEvaluatorName,
  formatHistoryDateTime,
  formatPatientSnapshot,
} from "@/lib/historyDisplay";
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
            <th className="px-3 py-3 font-medium">
              <span className="sr-only">View detail</span>
            </th>
          </tr>
        </thead>
        <tbody className="text-sm text-on-surface">
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-outline-variant/70 transition-colors hover:bg-surface-container-low"
            >
              <td className="px-3 py-3 text-xs text-on-surface-variant">
                <Link
                  to={`/history/${item.id}`}
                  className="block rounded-sm text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {formatHistoryDateTime(item.created_at)}
                </Link>
              </td>
              <td className="px-3 py-3">
                <span className="block font-medium">{formatEvaluatorName(item.user)}</span>
                <span className="text-xs capitalize text-on-surface-variant">{item.user.role}</span>
              </td>
              <td className="px-3 py-3 text-on-surface-variant">
                {formatPatientSnapshot(item.patient_input)}
              </td>
              <td className="px-3 py-3">
                <RiskScoreCell riskPercent={item.risk_percent} riskLevel={item.risk_level} />
              </td>
              <td className="max-w-xs px-3 py-3 text-on-surface-variant">
                {item.summary ?? "—"}
              </td>
              <td className="px-3 py-3 text-xs text-on-surface-variant">
                {item.model_version}
              </td>
              <td className="px-3 py-3 text-right">
                <Link
                  to={`/history/${item.id}`}
                  className="text-sm font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
