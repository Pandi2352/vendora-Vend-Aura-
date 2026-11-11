import {
  CurrencyInr,
  Receipt,
  TrendUp,
  Percent,
} from '@phosphor-icons/react';
import type { ReportsData } from './types';
import { BUSINESS_TYPE_LABELS } from '../../shared';

interface ReportsTabProps {
  reports: ReportsData | null;
}

export function ReportsTab({ reports }: ReportsTabProps) {
  const planStats = reports?.planStats || [];
  const sectorStats = reports?.sectorStats || {};
  const totalTenants = reports?.totalTenants || 0;
  const activeSubs = reports?.activeSubscriptions || 0;
  const trialSubs = reports?.trialSubscriptions || 0;

  const totalEstimatedMRR = planStats.reduce((sum, p) => sum + (p.estimatedRevenue || 0), 0);
  const projectedARR = totalEstimatedMRR * 12;

  // Calculate total bills across all sectors
  const totalBills = Object.values(sectorStats).reduce((sum, s) => sum + (s.bills || 0), 0);

  return (
    <div className="space-y-6">
      {/* 4 Financial & Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-md border border-zinc-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Estimated Monthly MRR</p>
            <p className="text-2xl font-black text-zinc-950 mt-1">
              ₹{totalEstimatedMRR.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-zinc-600 font-medium mt-0.5">Recurring SaaS revenue</p>
          </div>
          <div className="w-10 h-10 rounded-md bg-zinc-100 text-zinc-800 flex items-center justify-center border border-zinc-200">
            <CurrencyInr weight="bold" className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-md border border-zinc-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Projected Annual ARR</p>
            <p className="text-2xl font-black text-zinc-950 mt-1">
              ₹{projectedARR.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Annual run rate</p>
          </div>
          <div className="w-10 h-10 rounded-md bg-zinc-100 text-zinc-800 flex items-center justify-center border border-zinc-200">
            <TrendUp weight="bold" className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-md border border-zinc-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Network Bills Processed</p>
            <p className="text-2xl font-black text-zinc-950 mt-1 font-mono">
              {totalBills.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-zinc-600 font-medium mt-0.5">Total retail invoices</p>
          </div>
          <div className="w-10 h-10 rounded-md bg-zinc-100 text-zinc-800 flex items-center justify-center border border-zinc-200">
            <Receipt weight="bold" className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-md border border-zinc-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Paid Conversion Rate</p>
            <p className="text-2xl font-black text-zinc-950 mt-1">
              {totalTenants > 0 ? Math.round((activeSubs / totalTenants) * 100) : 0}%
            </p>
            <p className="text-[11px] text-zinc-600 font-medium mt-0.5">
              {activeSubs} paid / {trialSubs} in trial
            </p>
          </div>
          <div className="w-10 h-10 rounded-md bg-zinc-100 text-zinc-800 flex items-center justify-center border border-zinc-200">
            <Percent weight="bold" className="w-5 h-5 text-zinc-700" />
          </div>
        </div>
      </div>

      {/* Subscription Tier Revenue Table */}
      <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-zinc-950">Subscription Tier Revenue Breakdown</h3>
            <p className="text-xs text-zinc-500">Breakdown of tenants and estimated revenue by plan tier</p>
          </div>
          <span className="text-xs font-mono font-bold text-red-600">
            Total MRR: ₹{totalEstimatedMRR.toLocaleString('en-IN')}/mo
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Plan Code</th>
                <th className="py-3 px-4">Plan Name</th>
                <th className="py-3 px-4">Monthly Price</th>
                <th className="py-3 px-4">Active Tenants</th>
                <th className="py-3 px-4">Revenue Share</th>
                <th className="py-3 px-4 text-right">Estimated MRR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {planStats.map((plan) => {
                const sharePct = totalEstimatedMRR > 0 ? Math.round((plan.estimatedRevenue / totalEstimatedMRR) * 100) : 0;
                return (
                  <tr key={plan.code} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-950">{plan.code}</td>
                    <td className="py-3 px-4 font-semibold text-zinc-900">{plan.name}</td>
                    <td className="py-3 px-4 font-mono text-zinc-700">
                      {plan.price === 0 ? 'Free (30 Days)' : `₹${plan.price.toLocaleString('en-IN')}/mo`}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900">{plan.tenantsCount} stores</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-md bg-zinc-100 overflow-hidden">
                          <div className="h-full bg-red-600 rounded-md" style={{ width: `${sharePct}%` }} />
                        </div>
                        <span className="font-mono text-[11px] text-zinc-600">{sharePct}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-950">
                      ₹{plan.estimatedRevenue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sector Adoption & Throughput */}
      <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-zinc-950">Retail Sector Billing Volume</h3>
            <p className="text-xs text-zinc-500">Stores count and invoice volume processed across retail verticals</p>
          </div>
          <span className="text-xs text-zinc-500 font-mono">15 Retail Sectors</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Retail Sector Vertical</th>
                <th className="py-3 px-4">Store Count</th>
                <th className="py-3 px-4">Bills Processed</th>
                <th className="py-3 px-4 text-right">Avg Bills / Store</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {Object.entries(sectorStats).length > 0 ? (
                Object.entries(sectorStats).map(([sectorCode, data]) => {
                  const label = BUSINESS_TYPE_LABELS[sectorCode as keyof typeof BUSINESS_TYPE_LABELS] || sectorCode;
                  const avg = data.count > 0 ? Math.round(data.bills / data.count) : 0;
                  return (
                    <tr key={sectorCode} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-zinc-950">{label}</td>
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900">{data.count}</td>
                      <td className="py-3 px-4 font-mono text-zinc-800">{data.bills.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-mono text-zinc-700">{avg.toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-500">
                    No sector billing volume data recorded yet.
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
