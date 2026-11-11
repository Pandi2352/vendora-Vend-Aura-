import {
  Buildings,
  ShieldCheck,
  Users,
  Sparkle,
  ArrowSquareOut,
  Eye,
} from '@phosphor-icons/react';
import type { OverviewStats } from './types';
import { TenantStatusBadge } from './TenantStatusBadge';
import { BUSINESS_TYPE_LABELS, BusinessType, SUBSCRIPTION_PLANS, SubscriptionPlanCode } from '../../shared';
import { posLoginUrl } from '../../lib/config';

const SECTOR_COUNT = Object.values(BusinessType).length;

interface OverviewTabProps {
  stats: OverviewStats | null;
  onInspectTenant: (tenantId: string) => void;
  onNavigateToTenants: () => void;
}

export function OverviewTab({ stats, onInspectTenant, onNavigateToTenants }: OverviewTabProps) {
  const metrics = stats?.metrics || {
    totalTenants: 0,
    activeTenants: 0,
    trialTenants: 0,
    suspendedTenants: 0,
    totalMonthlyRevenue: 0,
    totalBillsGenerated: 0,
    totalLeads: 0,
  };

  const planDist = stats?.planDistribution || {};
  const sectorDist = stats?.sectorDistribution || {};
  const recentTenants = stats?.recentTenants || [];

  return (
    <div className="space-y-6">
      {/* 4 Top KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-md border border-zinc-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Tenants</p>
            <p className="text-2xl font-black text-zinc-950 mt-1">{metrics.totalTenants}</p>
            <p className="text-[11px] text-zinc-600 font-medium mt-0.5">Across {SECTOR_COUNT} retail sectors</p>
          </div>
          <div className="w-10 h-10 rounded-md bg-zinc-100 text-zinc-800 flex items-center justify-center border border-zinc-200">
            <Buildings weight="bold" className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-md border border-zinc-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Active Paid Stores</p>
            <p className="text-2xl font-black text-zinc-950 mt-1">{metrics.activeTenants}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Subscription active</p>
          </div>
          <div className="w-10 h-10 rounded-md bg-zinc-100 text-zinc-800 flex items-center justify-center border border-zinc-200">
            <ShieldCheck weight="bold" className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-md border border-zinc-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Free Trials Active</p>
            <p className="text-2xl font-black text-zinc-950 mt-1">{metrics.trialTenants}</p>
            <p className="text-[11px] text-zinc-600 font-medium mt-0.5">30-day evaluation period</p>
          </div>
          <div className="w-10 h-10 rounded-md bg-zinc-100 text-zinc-800 flex items-center justify-center border border-zinc-200">
            <Users weight="bold" className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-md border border-zinc-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Estimated MRR</p>
            <p className="text-2xl font-black text-zinc-950 mt-1">
              ₹{metrics.totalMonthlyRevenue.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-zinc-600 font-medium mt-0.5">Monthly recurring revenue</p>
          </div>
          <div className="w-10 h-10 rounded-md bg-zinc-100 text-zinc-800 flex items-center justify-center border border-zinc-200">
            <Sparkle weight="bold" className="w-5 h-5 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Two Distribution Cards: Plans & Sectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Plan Distribution */}
        <div className="bg-white p-5 rounded-md border border-zinc-200">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
            <h3 className="font-bold text-sm text-zinc-950">Subscription Plan Breakdown</h3>
            <span className="text-xs text-zinc-500 font-mono">4 Tiers</span>
          </div>

          <div className="space-y-3">
            {Object.values(SubscriptionPlanCode).map((planCode) => {
              const plan = SUBSCRIPTION_PLANS[planCode];
              const count = planDist[planCode] || 0;
              const total = metrics.totalTenants || 1;
              const pct = Math.round((count / total) * 100);

              return (
                <div key={planCode} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-800">
                      {plan.name}{' '}
                      <span className="text-zinc-500 font-normal">
                        ({plan.monthlyPrice === 0 ? 'Free' : `₹${plan.monthlyPrice}/mo`})
                      </span>
                    </span>
                    <span className="font-mono font-bold text-zinc-900">
                      {count} stores ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-md bg-zinc-100 overflow-hidden">
                    <div
                      className={`h-full rounded-md ${
                        planCode === SubscriptionPlanCode.BUSINESS
                          ? 'bg-red-600'
                          : planCode === SubscriptionPlanCode.GROWTH
                          ? 'bg-zinc-800'
                          : planCode === SubscriptionPlanCode.STARTER
                          ? 'bg-zinc-600'
                          : 'bg-zinc-400'
                      }`}
                      style={{ width: `${Math.max(pct, count > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Retail Sector Distribution */}
        <div className="bg-white p-5 rounded-md border border-zinc-200">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
            <h3 className="font-bold text-sm text-zinc-950">Retail Sector Adoption</h3>
            <span className="text-xs text-zinc-500 font-mono">Active Verticals</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(sectorDist).length > 0 ? (
              Object.entries(sectorDist).map(([sector, count]) => (
                <div
                  key={sector}
                  className="p-2.5 rounded-md bg-zinc-50 border border-zinc-200 flex items-center justify-between"
                >
                  <span className="font-medium text-zinc-800 truncate pr-2">
                    {BUSINESS_TYPE_LABELS[sector as BusinessType] || sector}
                  </span>
                  <span className="font-mono font-bold px-1.5 py-0.5 rounded-md bg-zinc-200 text-zinc-900 text-[11px] shrink-0">
                    {count}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 col-span-2 py-4 text-center">
                No retail sector data registered yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Tenant Registrations Table */}
      <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-zinc-950">Recent Store Registrations</h3>
            <p className="text-xs text-zinc-500">Latest cloud tenants provisioned via Vendora</p>
          </div>
          <button
            onClick={onNavigateToTenants}
            className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
          >
            View All Tenants →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Store Name & Shop ID</th>
                <th className="py-3 px-4">Owner Name</th>
                <th className="py-3 px-4">Retail Sector</th>
                <th className="py-3 px-4">Plan & Status</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {recentTenants.length > 0 ? (
                recentTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-950">{t.businessName}</div>
                      <div className="font-mono text-[11px] text-red-600 mt-0.5">
                        {t.shopId}.vendora.com
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-zinc-800">{t.ownerName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-[11px] font-medium border border-zinc-200">
                        {BUSINESS_TYPE_LABELS[t.businessType] || t.businessType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-900">{t.plan}</div>
                      <TenantStatusBadge status={t.status} className="mt-0.5" />
                    </td>
                    <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">
                      {t.createdAt || 'Recent'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => onInspectTenant(t.id)}
                        className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-900 hover:text-white border border-zinc-200 font-semibold text-[11px] text-zinc-800 transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                      <a
                        href={posLoginUrl(t.shopId)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                      >
                        <span>POS</span>
                        <ArrowSquareOut className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    No store tenants registered yet. Use the Onboarding Registration flow to create the first store.
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
