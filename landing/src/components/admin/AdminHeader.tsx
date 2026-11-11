import { ArrowsClockwise, SignOut } from '@phosphor-icons/react';
import type { AdminTab } from './AdminSidebar';

interface AdminHeaderProps {
  activeTab: AdminTab;
  loading: boolean;
  onRefresh: () => void;
  onSignOut?: () => void;
}

const TAB_TITLES: Record<AdminTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Platform Overview',
    subtitle: 'High-level business KPIs, tenant subscriptions, sector metrics, and growth throughput.',
  },
  tenants: {
    title: 'Store Tenants Management',
    subtitle: 'View, filter, inspect, and manage cloud retail store tenants across 15 retail sectors.',
  },
  contacts: {
    title: 'Customer Contacts & Leads',
    subtitle: 'Directory of registered retail store owners, onboarding inquiries, and verified emails.',
  },
  reports: {
    title: 'Reports & Revenue Analytics',
    subtitle: 'Billing counter volume, plan ARR/MRR forecasts, and retail sector market share breakdown.',
  },
};

export function AdminHeader({ activeTab, loading, onRefresh, onSignOut }: AdminHeaderProps) {
  const current = TAB_TITLES[activeTab];

  return (
    <header className="bg-white border-b border-zinc-200 px-4 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
          {current.title}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
        >
          <ArrowsClockwise className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-600' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-50 border border-zinc-200 text-xs text-zinc-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-medium">Live Synced</span>
        </div>

        {onSignOut && (
          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-300 hover:border-red-300 bg-white hover:bg-red-50 text-zinc-700 hover:text-red-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Sign Out Platform Admin"
          >
            <SignOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
}
