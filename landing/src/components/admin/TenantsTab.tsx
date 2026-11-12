import { useMemo, useState } from 'react';
import { Eye, Prohibit, CheckCircle, ArrowSquareOut } from '@phosphor-icons/react';
import type { TenantItem } from './types';
import { TenantStatusBadge } from './TenantStatusBadge';
import { DataTable, type Column } from './ui/DataTable';
import { IconAction } from './ui/IconAction';
import { FilterSelect } from './ui/FilterSelect';
import { BUSINESS_TYPE_LABELS, SUBSCRIPTION_PLANS, TenantStatus } from '../../shared';
import { posLoginUrl, storeHost } from '../../lib/config';

const planLabel = (code: keyof typeof SUBSCRIPTION_PLANS) => {
  const plan = SUBSCRIPTION_PLANS[code];
  return plan.monthlyPrice === 0 ? plan.name : `${plan.name} (₹${plan.monthlyPrice.toLocaleString('en-IN')})`;
};

const PLAN_OPTIONS = Object.values(SUBSCRIPTION_PLANS).map((p) => ({ value: p.code, label: planLabel(p.code) }));
const STATUS_OPTIONS = Object.values(TenantStatus).map((s) => ({ value: s, label: s.charAt(0) + s.slice(1).toLowerCase() }));
const SECTOR_OPTIONS = Object.entries(BUSINESS_TYPE_LABELS).map(([value, label]) => ({ value, label }));

interface TenantsTabProps {
  tenants: TenantItem[];
  onInspectTenant: (tenantId: string) => void;
  onUpdateStatus?: (id: string, newStatus: TenantStatus) => void;
  updatingTenantId?: string | null;
}

export function TenantsTab({ tenants, onInspectTenant, onUpdateStatus, updatingTenantId = null }: TenantsTabProps) {
  const [plan, setPlan] = useState('ALL');
  const [sector, setSector] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  const rows = useMemo(
    () =>
      tenants.filter(
        (t) =>
          (plan === 'ALL' || t.plan === plan) &&
          (sector === 'ALL' || t.businessType === sector) &&
          (status === 'ALL' || t.status === status),
      ),
    [tenants, plan, sector, status],
  );

  const columns: Column<TenantItem>[] = [
    {
      key: 'store',
      header: 'Store',
      render: (t) => (
        <button type="button" onClick={() => onInspectTenant(t.id)} className="text-left cursor-pointer">
          <span className="block font-bold text-blue-700 hover:underline">{t.businessName}</span>
          <span className="block font-mono text-[11px] text-zinc-400">{storeHost(t.shopId)}</span>
        </button>
      ),
    },
    {
      key: 'owner',
      header: 'Owner & Contact',
      render: (t) => (
        <>
          <span className="block font-semibold text-zinc-900">{t.ownerName}</span>
          <span className="block text-[11px] text-zinc-500">
            {t.phone} · {t.email}
          </span>
        </>
      ),
    },
    { key: 'sector', header: 'Sector', render: (t) => BUSINESS_TYPE_LABELS[t.businessType] ?? t.businessType },
    { key: 'plan', header: 'Plan', render: (t) => SUBSCRIPTION_PLANS[t.plan]?.name ?? t.plan },
    {
      key: 'bills',
      header: 'Bills (month)',
      align: 'right',
      render: (t) => <span className="tabular-nums font-semibold">{t.billsCount.toLocaleString('en-IN')}</span>,
    },
    { key: 'status', header: 'Status', align: 'center', render: (t) => <TenantStatusBadge status={t.status} /> },
    { key: 'joined', header: 'Joined', render: (t) => <span className="tabular-nums text-zinc-500">{t.createdAt || '—'}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (t) => {
        const isActive = t.status === TenantStatus.ACTIVE;
        return (
          <div className="inline-flex items-center gap-1.5">
            <IconAction label={`View ${t.businessName}`} tone="brand" icon={<Eye />} onClick={() => onInspectTenant(t.id)} />
            {onUpdateStatus && (
              <IconAction
                label={isActive ? `Suspend ${t.businessName}` : `Activate ${t.businessName}`}
                tone={isActive ? 'danger' : 'success'}
                icon={isActive ? <Prohibit /> : <CheckCircle />}
                disabled={updatingTenantId === t.id}
                onClick={() => onUpdateStatus(t.id, isActive ? TenantStatus.SUSPENDED : TenantStatus.ACTIVE)}
              />
            )}
            <IconAction label={`Open ${t.businessName} POS`} icon={<ArrowSquareOut />} href={posLoginUrl(t.shopId)} />
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(t) => t.id}
      searchText={(t) => `${t.businessName} ${t.shopId} ${t.ownerName} ${t.email} ${t.phone}`}
      searchPlaceholder="Search shop, owner, email or phone"
      emptyMessage="No tenants match the current filters."
      filters={
        <>
          <FilterSelect label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} allLabel="All statuses" />
          <FilterSelect label="Plan" value={plan} onChange={setPlan} options={PLAN_OPTIONS} allLabel="All plans" />
          <FilterSelect label="Sector" value={sector} onChange={setSector} options={SECTOR_OPTIONS} allLabel="All sectors" />
        </>
      }
    />
  );
}
