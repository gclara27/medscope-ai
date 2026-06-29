interface ChartTooltipRow {
  label: string;
  value: string;
  color?: string;
}

interface ChartTooltipCardProps {
  title?: string;
  rows: ChartTooltipRow[];
}

/** Theme-aware Recharts tooltip shell — uses design tokens (T-X03-06). */
export function ChartTooltipCard({ title, rows }: ChartTooltipCardProps) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-highest px-3 py-2 text-sm shadow-level-2">
      {title ? <p className="mb-1 font-semibold text-on-surface">{title}</p> : null}
      <ul className="space-y-0.5">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between gap-4 text-on-surface-variant"
          >
            <span className="flex items-center gap-1.5">
              {row.color ? (
                <span
                  className="inline-block size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: row.color }}
                  aria-hidden
                />
              ) : null}
              {row.label}
            </span>
            <span className="font-medium tabular-nums text-on-surface">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
