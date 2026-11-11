import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { SUBSCRIPTION_PLANS, SubscriptionPlanCode } from '../../../shared';
import { CHART_SURFACE, PLAN_COLORS, formatCount } from './chartTheme';
import { ChartTooltip } from './ChartTooltip';
import { EmptyChart } from '../ui/ChartCard';

interface PlanMixDonutProps {
  /** Plan code -> number of stores */
  distribution: Record<string, number>;
}

/**
 * Plan mix as a donut with a value legend beside it. The legend doubles as the
 * table view (two slots are below 3:1 contrast, so values are always visible).
 */
export function PlanMixDonut({ distribution }: PlanMixDonutProps) {
  const data = Object.values(SubscriptionPlanCode).map((code) => ({
    code,
    name: SUBSCRIPTION_PLANS[code].name,
    value: distribution[code] ?? 0,
    fill: PLAN_COLORS[code],
  }));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) return <EmptyChart message="No subscriptions yet." />;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-52 h-52 shrink-0" role="img" aria-label="Stores by subscription plan">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip valueFormatter={(v) => `${formatCount(v)} stores`} />} />
            <Pie
              data={data.filter((d) => d.value > 0)}
              dataKey="value"
              nameKey="name"
              innerRadius="64%"
              outerRadius="100%"
              paddingAngle={1}
              stroke={CHART_SURFACE}
              strokeWidth={2}
              isAnimationActive
            >
              {data
                .filter((d) => d.value > 0)
                .map((d) => (
                  <Cell key={d.code} fill={d.fill} />
                ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-zinc-950 tabular-nums">{formatCount(total)}</span>
          <span className="text-[11px] font-semibold text-zinc-500">stores</span>
        </div>
      </div>

      <ul className="w-full space-y-2.5">
        {data.map((d) => {
          const percent = Math.round((d.value / total) * 100);
          return (
            <li key={d.code} className="flex items-center gap-3 text-sm">
              <span className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: d.fill }} aria-hidden />
              <span className="font-semibold text-zinc-800">{d.name}</span>
              <span className="ml-auto tabular-nums text-zinc-900 font-bold">{formatCount(d.value)}</span>
              <span className="w-10 text-right tabular-nums text-xs text-zinc-500">{percent}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
