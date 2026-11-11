import { Link } from 'react-router-dom';
import {
  SquaresFour,
  Buildings,
  AddressBook,
  ChartLineUp,
  ArrowSquareOut,
  ArrowUpRight,
  HouseLine,
  SignOut,
} from '@phosphor-icons/react';

export type AdminTab = 'overview' | 'tenants' | 'contacts' | 'reports';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  tenantsCount: number;
  contactsCount: number;
  onSignOut?: () => void;
}

export function AdminSidebar({
  activeTab,
  onTabChange,
  tenantsCount,
  contactsCount,
  onSignOut,
}: AdminSidebarProps) {
  const navItems: { id: AdminTab; label: string; icon: any; badge?: number }[] = [
    { id: 'overview', label: 'Platform Overview', icon: SquaresFour },
    { id: 'tenants', label: 'Store Tenants', icon: Buildings, badge: tenantsCount },
    { id: 'contacts', label: 'Contacts & Leads', icon: AddressBook, badge: contactsCount },
    { id: 'reports', label: 'Reports & Revenue', icon: ChartLineUp },
  ];

  return (
    <aside className="w-full lg:w-64 bg-zinc-950 text-white border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col shrink-0">
      {/* Brand & Admin Title */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="/assets/vendora_logo.png"
            alt="Vendora Logo"
            className="h-7 w-auto object-contain"
          />
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block leading-none">
              Vendora
            </span>
            <span className="text-[10px] text-zinc-400 font-medium">Platform HQ</span>
          </div>
        </Link>
        <span className="text-[10px] bg-red-950 text-red-400 border border-red-800/80 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
          Super Admin
        </span>
      </div>

      {/* Navigation Links */}
      <div className="p-3 flex-1 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
        <div className="hidden lg:block px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon weight={isActive ? 'bold' : 'regular'} className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                    isActive ? 'bg-red-800 text-white' : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Launch & External Links */}
      <div className="p-3 border-t border-zinc-800 space-y-2 text-xs">
        <a
          href="http://localhost:4001"
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-white font-medium transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Store POS Terminal</span>
          </div>
          <ArrowSquareOut className="w-3.5 h-3.5 text-zinc-400" />
        </a>

        <a
          href="http://localhost:5000/docs"
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-between px-3 py-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
        >
          <span>Swagger REST APIs</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
        </a>

        <Link
          to="/"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
        >
          <HouseLine className="w-3.5 h-3.5" />
          <span>Exit to Marketing Site</span>
        </Link>

        {onSignOut && (
          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md text-red-400 hover:text-white hover:bg-red-950/70 border border-red-900/40 transition-colors cursor-pointer text-xs font-semibold"
          >
            <div className="flex items-center gap-2">
              <SignOut className="w-3.5 h-3.5" />
              <span>Sign Out Admin</span>
            </div>
            <span className="text-[10px] text-red-400 font-mono">End Session</span>
          </button>
        )}
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950 flex items-center justify-between text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>API Server: 5000</span>
        </div>
        <span className="font-mono text-[10px] text-zinc-400">v1.0.0</span>
      </div>
    </aside>
  );
}

