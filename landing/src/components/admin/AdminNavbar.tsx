import {
  SquaresFour,
  Buildings,
  AddressBook,
  ChartLineUp,
  ArrowSquareOut,
  ArrowUpRight,
  ArrowsClockwise,
  SignOut,
  HouseLine,
  CreditCard,
  type Icon as PhosphorIcon,
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { API_DOCS_URL, POS_URL } from '../../lib/config';
import { VendoraMark } from '../VendoraMark';

export type AdminTab = 'overview' | 'tenants' | 'subscriptions' | 'contacts' | 'reports';

interface AdminNavbarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  tenantsCount: number;
  contactsCount: number;
  loading: boolean;
  onRefresh: () => void;
  onSignOut: () => void;
}

export function AdminNavbar({
  activeTab,
  onTabChange,
  tenantsCount,
  contactsCount,
  loading,
  onRefresh,
  onSignOut,
}: AdminNavbarProps) {
  const navTabs: { id: AdminTab; label: string; icon: PhosphorIcon; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: SquaresFour },
    { id: 'tenants', label: 'Store Tenants', icon: Buildings, badge: tenantsCount },
    { id: 'subscriptions', label: 'Subscriptions & Billing', icon: CreditCard },
    { id: 'contacts', label: 'Contacts & Leads', icon: AddressBook, badge: contactsCount },
    { id: 'reports', label: 'Reports & Revenue', icon: ChartLineUp },
  ];

  return (
    <header className="bg-zinc-950 text-white border-b border-zinc-800 sticky top-0 z-40 w-full select-none">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Bar */}
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <VendoraMark size={28} tone="dark" />
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white leading-none">
                    Vendora
                  </span>
                  <span className="text-[10px] bg-red-950 text-red-400 border border-red-800/80 px-1.5 py-0.2 rounded-md font-bold uppercase tracking-wider">
                    HQ
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-medium block leading-none mt-1">
                  Platform Operations
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>API: 5000</span>
            </div>
          </div>

          {/* Center: Modern Segmented Command Tabs (No Sidebar!) */}
          <div className="flex items-center bg-zinc-900/90 border border-zinc-800/90 p-1 rounded-md overflow-x-auto max-w-full">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-red-600 text-white font-extrabold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/70'
                  }`}
                >
                  <Icon weight={isActive ? 'bold' : 'regular'} className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                        isActive ? 'bg-red-900/80 text-white' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: Quick Tools & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Platform Data"
            >
              <ArrowsClockwise className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-500' : ''}`} />
              <span className="hidden xl:inline">{loading ? 'Syncing...' : 'Sync'}</span>
            </button>

            {/* Launch POS Terminal */}
            <a
              href={POS_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition-colors"
              title="Open Merchant POS Terminal"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>POS Terminal</span>
              <ArrowSquareOut className="w-3.5 h-3.5 text-zinc-400" />
            </a>

            {/* Swagger REST Docs */}
            <a
              href={API_DOCS_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden 2xl:flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <span>REST APIs</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
            </a>

            {/* Return to Public Home */}
            <Link
              to="/"
              className="p-2 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Return to Marketing Landing"
            >
              <HouseLine className="w-4 h-4" />
            </Link>

            {/* Sign Out Button */}
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-950/60 hover:bg-red-600 border border-red-900/60 hover:border-red-600 text-red-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              title="Sign Out Platform Admin"
            >
              <SignOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

