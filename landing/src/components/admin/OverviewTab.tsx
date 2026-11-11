import { useMemo } from 'react';
import { Buildings, ShieldCheck, HourglassMedium, CurrencyInr, Eye, ArrowRight } from '@phosphor-icons/react';
import type { OverviewStats, TenantItem } from './types';
import { TenantStatusBadge } from './TenantStatusBadge';
import { KpiCard } from './ui/KpiCard';
import { ChartCard } from './ui/ChartCard';
import { DataTable, type Column } from './ui/DataTable';
import { IconAction } from './ui/IconAction';
import { SignupTrendChart } from './charts/SignupTrendChart';
import { PlanMixDonut } from './charts/PlanMixDonut';
import { RankedBarChart } from './charts/RankedBarChart';
import { formatInr } from './charts/chartTheme';
import { BUSINESS_TYPE_LABELS, BusinessType, SUBSCRIPTION_PLANS } from '../../shared';

const SECTOR_COUNT = Object.values(BusinessType).length;

interface OverviewTabProps {
  stats: OverviewStats | null;
  tenants: TenantItem[];
  onInspectTenant: (tenantId: string) => void;
  onNavigateToTenants: () => void;
}

type RecentTenant = OverviewStats['recentTenants'][number];

export function OverviewTab({ stats, tenants, onInspectTenant, onNavigateToTenants }: OverviewTabProps) {
  const metrics = stats?.metrics;
  const sectorData = useMemo(
    () =>
      Object.entries(stats?.sectorDistribution ?? {}).map(([code, value]) => ({
        label: BUSINESS_TYPE_LABELS[code as BusinessType] ?? code,
        value,
      })),
    [stats],
  );
  const createdDates = useMemo(() => tenants.map((t) => t.createdAt), [tenants]);

  const recentColumns: Column<RecentTenant>[] = [
    {
      key: 'store',
      header: 'Store',
      render: (t) => (
        <button type="button" onClick={() => onInspectTenant(t.id)} className="text-left cursor-pointer">
          <span className="block font-bold text-blue-700 hover:underline">{t.businessName}</span>
          <span className="block font-mono text-[11px] text-zinc-400">{t.shopId}</span>
        </button>
      ),
    },
    { key: 'owner', header: 'Owner', render: (t) => t.ownerName },
    { key: 'sector', header: 'Sector', render: (t) => BUSINESS_TYPE_LABELS[t.businessType] ?? t.businessType },
    { key: 'plan', header: 'Plan', render: (t) => SUBSCRIPTION_PLANS[t.plan]?.name ?? t.plan },
    { key: 'status', header: 'Status', align: 'center', render: (t) => <TenantStatusBadge status={t.status} /> },
    { key: 'date', header: 'Registered', render: (t) => <span className="tabular-nums text-zinc-500">{t.createdAt}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (t) => <IconAction label={`View ${t.businessName}`} tone="brand" icon={<Eye />} onClick={() => onInspectTenant(t.id)} />,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard tone="blue" label="Total tenants" value={metrics?.totalTenants ?? 0} hint={`Across ${SECTOR_COUNT} retail sectors`} icon={<Buildings />} />
        <KpiCard tone="emerald" label="Active paid stores" value={metrics?.activeTenants ?? 0} hint="Subscription active" icon={<ShieldCheck />} />
        <KpiCard tone="violet" label="Free trials" value={metrics?.trialTenants ?? 0} hint="30-day evaluation" icon={<HourglassMedium />} />
        <KpiCard tone="amber" label="Estimated MRR" value={formatInr(metrics?.totalMonthlyRevenue ?? 0)} hint="Monthly recurring revenue" icon={<CurrencyInr />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <ChartCard title="Store registrations" subtitle="New stores per month, last 12 months" className="xl:col-span-2">
          <SignupTrendChart createdDates={createdDates} />
        </ChartCard>
        <ChartCard title="Plan mix" subtitle="Stores on each subscription plan">
          <PlanMixDonut distribution={stats?.planDistribution ?? {}} />
        </ChartCard>
      </div>

      <ChartCard title="Retail sector adoption" subtitle="Top sectors by number of stores">
        <RankedBarChart data={sectorData} seriesLabel="Stores" emptyMessage="No retail sector data registered yet." />
      </ChartCard>

      <ChartCard
        title="Recent store registrations"
        subtitle="Latest cloud tenants provisioned via Vendora"
        action={
          <button
            type="button"
            onClick={onNavigateToTenants}
            className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
          >
            View all tenants <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      >
        <DataTable
          compact
          rows={stats?.recentTenants ?? []}
          columns={recentColumns}
          rowKey={(t) => t.id}
          emptyMessage="No stores registered yet."
        />
      </ChartCard>
    </div>
  );
}
