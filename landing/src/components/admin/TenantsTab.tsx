import { useState } from 'react';
import {
  MagnifyingGlass,
  Funnel,
  ArrowSquareOut,
  Eye,
  CheckCircle,
  Prohibit,
} from '@phosphor-icons/react';
import type { TenantItem } from './types';
import { TenantStatusBadge } from './TenantStatusBadge';
import { BUSINESS_TYPE_LABELS, SUBSCRIPTION_PLANS, TenantStatus } from '../../shared';
import { posLoginUrl } from '../../lib/config';

const STATUS_FILTERS = ['ALL', ...Object.values(TenantStatus)];

function formatPlanOption(code: keyof typeof SUBSCRIPTION_PLANS): string {
  const plan = SUBSCRIPTION_PLANS[code];
  return plan.monthlyPrice === 0
    ? plan.name
    : `${plan.name} (₹${plan.monthlyPrice.toLocaleString('en-IN')})`;
}

interface TenantsTabProps {
  tenants: TenantItem[];
  onInspectTenant: (tenantId: string) => void;
  onUpdateStatus?: (id: string, newStatus: TenantStatus) => void;
  updatingTenantId?: string | null;
}

export function TenantsTab({
  tenants,
  onInspectTenant,
  onUpdateStatus,
  updatingTenantId = null,
}: TenantsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = tenants.filter((t) => {
    const matchesSearch =
      t.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.shopId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery);

    const matchesPlan = filterPlan === 'ALL' || t.plan === filterPlan;
    const matchesType = filterType === 'ALL' || t.businessType === filterType;
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;

    return matchesSearch && matchesPlan && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-md border border-zinc-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full lg:w-96">
          <MagnifyingGlass className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by shop ID, name, owner, email, phone..."
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-zinc-300 text-xs sm:text-sm focus:border-red-600 outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status Pills */}
          <div className="flex items-center rounded-md border border-zinc-300 overflow-hidden bg-zinc-50 p-0.5">
            {STATUS_FILTERS.map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-sm text-[11px] font-bold cursor-pointer transition-colors ${
                  filterStatus === st
                    ? 'bg-zinc-950 text-white'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Plan Filter */}
          <div className="flex items-center gap-1.5 text-zinc-600">
            <Funnel className="w-3.5 h-3.5" />
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="px-2 py-1.5 rounded-md border border-zinc-300 bg-white text-xs font-medium text-zinc-800 outline-none"
            >
              <option value="ALL">All Plans</option>
              {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
                <option key={plan.code} value={plan.code}>
                  {formatPlanOption(plan.code)}
                </option>
              ))}
            </select>
          </div>

          {/* Sector Filter */}
          <div className="flex items-center gap-1.5 text-zinc-600">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2 py-1.5 rounded-md border border-zinc-300 bg-white text-xs font-medium text-zinc-800 outline-none max-w-[160px]"
            >
              <option value="ALL">All Sectors</option>
              {Object.entries(BUSINESS_TYPE_LABELS).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-zinc-950">
            Registered Store Tenants ({filtered.length} of {tenants.length})
          </h3>
          <span className="text-xs text-zinc-500 font-mono">Multi-Tenant Isolated DB</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Shop ID & Store Name</th>
                <th className="py-3 px-4">Owner & Contact</th>
                <th className="py-3 px-4">Business Sector</th>
                <th className="py-3 px-4">Plan & Status</th>
                <th className="py-3 px-4">Bills Done</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filtered.length > 0 ? (
                filtered.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-950">{tenant.businessName}</div>
                      <div className="font-mono text-[11px] text-red-600 mt-0.5">
                        {tenant.shopId}.vendora.com
                      </div>
                    </td>

                    <td className="py-3 px-4 text-zinc-700">
                      <div className="font-medium text-zinc-950">{tenant.ownerName}</div>
                      <div className="text-[11px] text-zinc-500">{tenant.phone}</div>
                      <div className="text-[11px] text-zinc-400">{tenant.email}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-[11px] font-medium border border-zinc-200">
                        {BUSINESS_TYPE_LABELS[tenant.businessType] || tenant.businessType}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-900">{tenant.plan}</div>
                      <TenantStatusBadge status={tenant.status} className="mt-0.5" />
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-zinc-800">
                      {tenant.billsCount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">
                      {tenant.createdAt || 'Recent'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onInspectTenant(tenant.id)}
                          className="px-2 py-1 rounded-md bg-zinc-100 hover:bg-zinc-900 hover:text-white border border-zinc-200 font-semibold text-[11px] text-zinc-800 transition-colors cursor-pointer inline-flex items-center gap-1"
                          title="Inspect Tenant Details"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>

                        {onUpdateStatus && (
                          <button
                            onClick={() =>
                              onUpdateStatus(
                                tenant.id,
                                tenant.status === TenantStatus.ACTIVE ? TenantStatus.SUSPENDED : TenantStatus.ACTIVE
                              )
                            }
                            disabled={updatingTenantId === tenant.id}
                            className={`px-2 py-1 rounded-md border font-semibold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-wait ${
                              tenant.status === TenantStatus.ACTIVE
                                ? 'border-amber-300 text-amber-700 hover:bg-amber-50'
                                : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={tenant.status === TenantStatus.ACTIVE ? 'Suspend Store' : 'Activate Store'}
                          >
                            {tenant.status === TenantStatus.ACTIVE ? (
                              <>
                                <Prohibit className="w-3 h-3" />
                                <span>Suspend</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                <span>Activate</span>
                              </>
                            )}
                          </button>
                        )}

                        <a
                          href={posLoginUrl(tenant.shopId)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                          title="Open Store Cashier POS"
                        >
                          <span>POS</span>
                          <ArrowSquareOut className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    No tenants match your current filter and search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
