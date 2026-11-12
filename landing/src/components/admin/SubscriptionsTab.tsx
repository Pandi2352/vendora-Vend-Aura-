import { useState } from 'react';
import { CreditCard, ArrowsClockwise, Sparkle, CalendarPlus, Eye } from '@phosphor-icons/react';
import type { TenantItem } from './types';
import { SUBSCRIPTION_PLANS, SubscriptionPlanCode, TenantStatus } from '../../shared';
import { DataTable, type Column } from './ui/DataTable';
import { IconAction } from './ui/IconAction';
import { adminApi } from '../../lib/adminApi';

interface SubscriptionsTabProps {
  tenants: TenantItem[];
  onInspectTenant: (tenantId: string) => void;
  onRefresh: () => void;
}

export function SubscriptionsTab({ tenants, onInspectTenant, onRefresh }: SubscriptionsTabProps) {
  const [extendingId, setExtendingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleExtend = async (tenant: TenantItem) => {
    setExtendingId(tenant.id);
    setActionMessage(null);
    try {
      await adminApi.post(`/tenants/${encodeURIComponent(tenant.id)}/extend-subscription`, { days: 30 });
      setActionMessage(`Extended 30 days for ${tenant.businessName}.`);
      onRefresh();
    } catch (err: any) {
      setActionMessage(err?.response?.data?.message || 'Could not extend subscription.');
    } finally {
      setExtendingId(null);
    }
  };

  const paidCount = tenants.filter((t) => t.status === TenantStatus.ACTIVE && t.plan !== SubscriptionPlanCode.FREE_TRIAL).length;
  const trialCount = tenants.filter((t) => t.status === TenantStatus.TRIAL || t.plan === SubscriptionPlanCode.FREE_TRIAL).length;
  const totalMrr = tenants.reduce((sum, t) => {
    if (t.status === TenantStatus.ACTIVE) {
      return sum + (SUBSCRIPTION_PLANS[t.plan]?.monthlyPrice || 0);
    }
    return sum;
  }, 0);

  const columns: Column<TenantItem>[] = [
    {
      key: 'store',
      header: 'Store / Tenant',
      render: (t) => (
        <button type="button" onClick={() => onInspectTenant(t.id)} className="text-left cursor-pointer">
          <span className="block font-bold text-blue-700 hover:underline">{t.businessName}</span>
          <span className="block font-mono text-[11px] text-zinc-400">{t.shopId}</span>
        </button>
      ),
    },
    {
      key: 'plan',
      header: 'Plan & Price',
      render: (t) => {
        const plan = SUBSCRIPTION_PLANS[t.plan] || SUBSCRIPTION_PLANS[SubscriptionPlanCode.FREE_TRIAL];
        return (
          <div>
            <span className="font-bold text-zinc-900 block">{plan.name}</span>
            <span className="text-[11px] text-zinc-500 font-mono">
              {plan.monthlyPrice === 0 ? 'Free' : `₹${plan.monthlyPrice.toLocaleString('en-IN')}/mo`}
            </span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Billing Status',
      render: (t) => {
        const isPaid = t.status === TenantStatus.ACTIVE && t.plan !== SubscriptionPlanCode.FREE_TRIAL;
        return isPaid ? (
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold inline-flex items-center gap-1">
            Active · Paid
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold inline-flex items-center gap-1">
            Free Trial
          </span>
        );
      },
    },
    {
      key: 'expires',
      header: 'Valid Until',
      render: (t) => (
        <span className="font-mono text-zinc-700 text-xs">{t.trialExpiresAt || '30 days from sign-up'}</span>
      ),
    },
    {
      key: 'bills',
      header: 'Monthly Usage',
      align: 'right',
      render: (t) => (
        <span className="tabular-nums font-semibold text-zinc-900">
          {t.billsCount.toLocaleString('en-IN')} / {(t.maxBills || 10000).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (t) => (
        <div className="inline-flex items-center gap-1.5">
          <button
            onClick={() => handleExtend(t)}
            disabled={extendingId === t.id}
            title="Extend subscription by 30 days"
            className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-semibold cursor-pointer transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-zinc-600" />
            <span>{extendingId === t.id ? 'Extending…' : '+30 Days'}</span>
          </button>
          <IconAction label={`Inspect ${t.businessName}`} tone="brand" icon={<Eye />} onClick={() => onInspectTenant(t.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {actionMessage && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="font-bold hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-md bg-white border border-zinc-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Sparkle weight="bold" className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">Paid Subscribers</p>
            <p className="text-xl font-black text-zinc-950 mt-0.5">{paidCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-md bg-white border border-zinc-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <ArrowsClockwise weight="bold" className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">Trial Accounts</p>
            <p className="text-xl font-black text-zinc-950 mt-0.5">{trialCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-md bg-white border border-zinc-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <CreditCard weight="bold" className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">Monthly Recurring (MRR)</p>
            <p className="text-xl font-black text-zinc-950 mt-0.5">₹{totalMrr.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-md border border-zinc-200 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-zinc-950">Tenant Subscriptions & Billing Status</h3>
            <p className="text-xs text-zinc-500">Monitor active paid plans, free trials, and extend billing terms</p>
          </div>
          <button
            onClick={onRefresh}
            className="px-3 py-1.5 rounded-md border border-zinc-300 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <ArrowsClockwise className="w-3.5 h-3.5 text-zinc-500" />
            <span>Refresh</span>
          </button>
        </div>

        <DataTable columns={columns} rows={tenants} rowKey={(t) => t.id} emptyMessage="No subscriptions found." />
      </div>
    </div>
  );
}
