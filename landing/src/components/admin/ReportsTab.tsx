import { useMemo } from 'react';
import { CurrencyInr, TrendUp, Receipt, Percent } from '@phosphor-icons/react';
import type { ReportsData } from './types';
import { KpiCard } from './ui/KpiCard';
import { ChartCard } from './ui/ChartCard';
import { DataTable, type Column } from './ui/DataTable';
import { PlanRevenueChart } from './charts/PlanRevenueChart';
import { RankedBarChart } from './charts/RankedBarChart';
import { CHART_COLORS, PLAN_COLORS, formatCount, formatInr } from './charts/chartTheme';
import { BUSINESS_TYPE_LABELS, BusinessType, type SubscriptionPlanCode } from '../../shared';

type PlanRow = ReportsData['planStats'][number];

export function ReportsTab({ reports }: { reports: ReportsData | null }) {
  const planStats = reports?.planStats ?? [];
  const totalTenants = reports?.totalTenants ?? 0;
  const activeSubs = reports?.activeSubscriptions ?? 0;
  const trialSubs = reports?.trialSubscriptions ?? 0;

  const mrr = planStats.reduce((sum, p) => sum + (p.estimatedRevenue || 0), 0);
  const conversion = totalTenants > 0 ? Math.round((activeSubs / totalTenants) * 100) : 0;

  const sectorBills = useMemo(
    () =>
      Object.entries(reports?.sectorStats ?? {}).map(([code, s]) => ({
        label: BUSINESS_TYPE_LABELS[code as BusinessType] ?? code,
        value: s.bills,
      })),
    [reports],
  );
  const totalBills = sectorBills.reduce((sum, s) => sum + s.value, 0);

  const planColumns: Column<PlanRow>[] = [
    {
      key: 'plan',
      header: 'Plan',
      render: (p) => (
        <span className="inline-flex items-center gap-2 font-bold text-zinc-900">
          <span className="w-2.5 h-2.5 rounded-md" style={{ backgroundColor: PLAN_COLORS[p.code as SubscriptionPlanCode] }} aria-hidden />
          {p.name}
        </span>
      ),
    },
    { key: 'price', header: 'Price / month', align: 'right', render: (p) => <span className="tabular-nums">{formatInr(p.price)}</span> },
    { key: 'stores', header: 'Stores', align: 'right', render: (p) => <span className="tabular-nums">{formatCount(p.tenantsCount)}</span> },
    {
      key: 'mrr',
      header: 'Est. MRR',
      align: 'right',
      render: (p) => <span className="tabular-nums font-bold text-zinc-900">{formatInr(p.estimatedRevenue)}</span>,
    },
    {
      key: 'share',
      header: 'Revenue share',
      align: 'right',
      render: (p) => <span className="tabular-nums text-zinc-500">{mrr > 0 ? Math.round((p.estimatedRevenue / mrr) * 100) : 0}%</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard tone="amber" label="Estimated MRR" value={formatInr(mrr)} hint="Recurring SaaS revenue" icon={<CurrencyInr />} />
        <KpiCard tone="emerald" label="Projected ARR" value={formatInr(mrr * 12)} hint="Annual run rate" icon={<TrendUp />} />
        <KpiCard tone="blue" label="Bills processed" value={formatCount(totalBills)} hint="This month, all stores" icon={<Receipt />} />
        <KpiCard tone="violet" label="Paid conversion" value={`${conversion}%`} hint={`${activeSubs} paid · ${trialSubs} in trial`} icon={<Percent />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Revenue by plan" subtitle="Estimated monthly revenue per subscription tier">
          <PlanRevenueChart plans={planStats} />
        </ChartCard>
        <ChartCard title="Billing volume by sector" subtitle="Bills generated this month">
          <RankedBarChart
            data={sectorBills}
            seriesLabel="Bills"
            color={CHART_COLORS.slot3}
            emptyMessage="No bills generated yet."
          />
        </ChartCard>
      </div>

      <ChartCard title="Subscription tier breakdown" subtitle="Table view of the revenue chart">
        <DataTable compact rows={planStats} columns={planColumns} rowKey={(p) => p.code} emptyMessage="No plans found." />
      </ChartCard>
    </div>
  );
}
