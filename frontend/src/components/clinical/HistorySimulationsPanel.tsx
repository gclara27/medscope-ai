import { FlaskConical } from "lucide-react";

import { formatHistoryDateTime } from "@/lib/historyDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HistorySimulationItem } from "@/types/history";

interface HistorySimulationsPanelProps {
  simulations: HistorySimulationItem[];
}

function formatDelta(delta: number): string {
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}%`;
}

/** Linked what-if simulations for a historical prediction (UC-052). */
export function HistorySimulationsPanel({ simulations }: HistorySimulationsPanelProps) {
  return (
    <Card>
      <CardHeader className="border-b border-outline-variant">
        <CardTitle className="flex items-center gap-2 text-base">
          <FlaskConical className="h-5 w-5 text-primary" aria-hidden />
          Linked simulations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {simulations.length === 0 ? (
          <p className="px-6 py-8 text-sm text-on-surface-variant">
            No simulations recorded for this evaluation yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  <th className="px-4 py-3 font-medium">Date / time</th>
                  <th className="px-4 py-3 font-medium">Original risk</th>
                  <th className="px-4 py-3 font-medium">Simulated risk</th>
                  <th className="px-4 py-3 font-medium">Delta</th>
                  <th className="px-4 py-3 font-medium">Summary</th>
                </tr>
              </thead>
              <tbody className="text-sm text-on-surface">
                {simulations.map((simulation) => (
                  <tr
                    key={simulation.id}
                    className="border-b border-outline-variant/70 last:border-b-0"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">
                      {formatHistoryDateTime(simulation.created_at)}
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums">
                      {simulation.original_risk_percent.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums">
                      {simulation.simulated_risk_percent.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums">
                      {formatDelta(simulation.delta_risk_percent)}
                    </td>
                    <td className="max-w-sm px-4 py-3 text-on-surface-variant">
                      {simulation.simulation_summary ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
