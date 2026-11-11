import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_TICK, CHART_COLORS, GRID_STROKE, formatCount } from './chartTheme';
import { ChartTooltip } from './ChartTooltip';
import { EmptyChart } from '../ui/ChartCard';

export interface RankedBarDatum {
  label: string;
  value: number;
}

interface RankedBarChartProps {
  data: RankedBarDatum[];
  /** Name used in the tooltip, e.g. "Stores" or "Bills". */
  seriesLabel: string;
  valueFormatter?: (value: number) => string;
  color?: string;
  maxBars?: number;
  emptyMessage?: string;
}

const BAR_HEIGHT = 30;

/**
 * Horizontal bars sorted largest first (magnitude across categories). One
 * measure, so one hue; values are direct-labelled at the bar end.
 */
export function RankedBarChart({
  data,
  seriesLabel,
  valueFormatter = formatCount,
  color = CHART_COLORS.slot1,
  maxBars = 8,
  emptyMessage = 'No data yet.',
}: RankedBarChartProps) {
  const rows = [...data]
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, maxBars);

  if (rows.length === 0) return <EmptyChart message={emptyMessage} />;

  return (
    <div style={{ height: rows.length * BAR_HEIGHT + 24 }} role="img" aria-label={`${seriesLabel} by category`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 56, left: 0, bottom: 0 }} barCategoryGap={6}>
          <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis type="category" dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} width={130} />
          <Tooltip cursor={{ fill: '#f4f4f5' }} content={<ChartTooltip seriesLabel={seriesLabel} valueFormatter={valueFormatter} />} />
          <Bar dataKey="value" name={seriesLabel} fill={color} radius={[0, 4, 4, 0]} maxBarSize={18}>
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v) => valueFormatter(Number(v))}
              style={{ fill: '#3f3f46', fontSize: 11, fontWeight: 700 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
