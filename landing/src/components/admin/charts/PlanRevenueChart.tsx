import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { SubscriptionPlanCode } from '../../../shared';
import { AXIS_TICK, GRID_STROKE, PLAN_COLORS, formatInr } from './chartTheme';
import { ChartTooltip } from './ChartTooltip';
import { EmptyChart } from '../ui/ChartCard';

interface PlanRevenueChartProps {
  plans: { code: string; name: string; estimatedRevenue: number }[];
}

/** Estimated monthly revenue per plan; each bar keeps its plan's colour from the donut. */
export function PlanRevenueChart({ plans }: PlanRevenueChartProps) {
  const data = plans.map((p) => ({
    name: p.name,
    value: p.estimatedRevenue,
    fill: PLAN_COLORS[p.code as SubscriptionPlanCode] ?? '#a1a1aa',
  }));

  if (data.every((d) => d.value === 0)) return <EmptyChart message="No paid subscriptions yet." />;

  return (
    <div className="h-64" role="img" aria-label="Estimated monthly revenue by plan">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 8, left: 8, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(v) => formatInr(Number(v))} width={72} />
          <Tooltip cursor={{ fill: '#f4f4f5' }} content={<ChartTooltip seriesLabel="Est. MRR" valueFormatter={formatInr} />} />
          <Bar dataKey="value" name="Est. MRR" radius={[4, 4, 0, 0]} maxBarSize={56}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.fill} />
            ))}
            <LabelList
              dataKey="value"
              position="top"
              formatter={(v) => formatInr(Number(v))}
              style={{ fill: '#3f3f46', fontSize: 11, fontWeight: 700 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
