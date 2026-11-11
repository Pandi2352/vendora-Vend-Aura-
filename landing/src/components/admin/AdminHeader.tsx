import { ShieldCheck } from '@phosphor-icons/react';
import type { AdminTab } from './AdminNavbar';

interface AdminHeaderProps {
  activeTab: AdminTab;
  tenantsCount: number;
}

const TAB_TITLES: Record<AdminTab, { title: string; subtitle: string; tag: string }> = {
  overview: {
    title: 'Platform Overview',
    subtitle: 'High-level business KPIs, tenant subscriptions, sector adoption, and system growth throughput.',
    tag: 'Executive Metrics',
  },
  tenants: {
    title: 'Store Tenants Directory',
    subtitle: 'Inspect, manage subscriptions, activate or suspend multi-tenant cloud retail stores.',
    tag: 'Multi-Tenant Workspaces',
  },
  contacts: {
    title: 'Customer Contacts & Leads',
    subtitle: 'Unified directory of registered store owners, contact details, and onboarding inquiry sessions.',
    tag: 'Leads & Accounts',
  },
  reports: {
    title: 'Reports & Revenue Analytics',
    subtitle: 'SaaS MRR/ARR projections, billing invoice volume, and sector market share breakdowns.',
    tag: 'Financial Insights',
  },
};

export function AdminHeader({ activeTab, tenantsCount }: AdminHeaderProps) {
  const current = TAB_TITLES[activeTab];

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-rose-50 via-white to-sky-50 border-b border-zinc-200 px-4 sm:px-8 py-6">
      <div className="w-full max-w-[1720px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-red-700 border border-red-200 uppercase tracking-wider">
              {current.tag}
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-[11px] font-mono text-zinc-400">
              {tenantsCount} Registered Stores
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight mt-1">
            {current.title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">{current.subtitle}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            <ShieldCheck weight="bold" className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Super Admin Authenticated</span>
          </div>
        </div>
      </div>
    </div>
  );
}
