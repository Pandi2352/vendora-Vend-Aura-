interface TooltipEntry {
  name?: string | number;
  value?: number | string | Array<number | string>;
  color?: string;
  payload?: { fill?: string; color?: string };
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: readonly TooltipEntry[];
  valueFormatter?: (value: number) => string;
  /** Overrides the series name shown next to the value. */
  seriesLabel?: string;
}

/** Shared HTML tooltip for every Recharts chart: bordered, rounded-md, no shadow. */
export function ChartTooltip({ active, label, payload, valueFormatter = String, seriesLabel }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs">
      {label !== undefined && label !== '' && <p className="font-bold text-zinc-900 mb-1">{label}</p>}
      {payload.map((entry, i) => {
        const swatch = entry.payload?.fill || entry.color || entry.payload?.color;
        return (
          <p key={i} className="flex items-center gap-2 text-zinc-600">
            {swatch && <span className="w-2.5 h-2.5 rounded-md shrink-0" style={{ backgroundColor: swatch }} />}
            <span>{seriesLabel ?? entry.name}</span>
            <span className="ml-auto pl-3 font-bold text-zinc-900 tabular-nums">{valueFormatter(Number(entry.value))}</span>
          </p>
        );
      })}
    </div>
  );
}
