import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_TICK, CHART_COLORS, GRID_STROKE, formatCount } from './chartTheme';
import { ChartTooltip } from './ChartTooltip';

const MONTHS = 12;

/** Store registrations per month for the last 12 months, from tenant createdAt dates. */
function monthlySignups(createdDates: string[]) {
  const now = new Date();
  const buckets = Array.from({ length: MONTHS }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (MONTHS - 1 - i), 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      stores: 0,
    };
  });
  const index = new Map(buckets.map((b, i) => [b.key, i]));
  for (const date of createdDates) {
    const i = index.get(date?.slice(0, 7));
    if (i !== undefined) buckets[i].stores += 1;
  }
  return buckets;
}

export function SignupTrendChart({ createdDates }: { createdDates: string[] }) {
  const data = useMemo(() => monthlySignups(createdDates), [createdDates]);
  const color = CHART_COLORS.slot1;

  return (
    <div className="h-64" role="img" aria-label="Store registrations per month, last 12 months">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="signupFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis allowDecimals={false} tick={AXIS_TICK} tickLine={false} axisLine={false} width={40} />
          <Tooltip
            cursor={{ stroke: '#a1a1aa', strokeDasharray: '4 4' }}
            content={<ChartTooltip seriesLabel="New stores" valueFormatter={formatCount} />}
          />
          <Area
            type="monotone"
            dataKey="stores"
            name="New stores"
            stroke={color}
            strokeWidth={2}
            fill="url(#signupFill)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, stroke: '#ffffff', fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
