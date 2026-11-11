import { useState, useEffect } from 'react';
import {
  SignOut,
  User,
  Clock,
  Storefront,
  ShoppingCart,
  Receipt,
  UsersThree,
  Truck,
  Vault,
  ArrowUDownLeft,
  PauseCircle,
  ChartLineUp,
} from '@phosphor-icons/react';
import type { AuthUser } from '../types/pos.types';
import type { ShiftSummary } from '../types/shift-return.types';

export type PosActiveTab = 'pos' | 'orders' | 'customers' | 'suppliers' | 'reports';

interface PosHeaderProps {
  currentUser: AuthUser | null;
  activeTab: PosActiveTab;
  onTabChange: (tab: PosActiveTab) => void;
  onSignOut: () => void;
  activeShift?: ShiftSummary | null;
  onOpenDrawer?: () => void;
  onOpenReturns?: () => void;
  heldCartsCount?: number;
  onOpenHeldCarts?: () => void;
}

export function PosHeader({
  currentUser,
  activeTab,
  onTabChange,
  onSignOut,
  activeShift,
  onOpenDrawer,
  onOpenReturns,
  heldCartsCount = 0,
  onOpenHeldCarts,
}: PosHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-IN'));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-zinc-950 text-white border-b border-zinc-800 px-4 sm:px-6 py-2.5 flex items-center justify-between shrink-0">
      {/* Brand & Store context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-base tracking-tight text-white">
            Retail<span className="text-red-600">POS</span>
          </span>
          <span className="text-[10px] text-zinc-500 font-medium hidden sm:inline">
            by Vendora
          </span>
        </div>

        <div className="h-5 w-px bg-zinc-800" />

        <div className="flex items-center gap-2">
          <Storefront weight="bold" className="w-4 h-4 text-red-500 shrink-0" />
          <span className="font-bold text-xs sm:text-sm text-zinc-100 truncate max-w-[150px] sm:max-w-none">
            {currentUser?.businessName || 'Vendora Retail Store'}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hidden md:inline">
            {currentUser?.shopId || 'shop'}.vendora.com
          </span>
        </div>
      </div>

      {/* Modern Center Navigation Command Switcher */}
      <nav className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md p-1 gap-1">
        <button
          onClick={() => onTabChange('pos')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'pos'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <ShoppingCart weight={activeTab === 'pos' ? 'bold' : 'regular'} className="w-3.5 h-3.5" />
          <span>POS Register</span>
        </button>

        <button
          onClick={() => onTabChange('orders')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Receipt weight={activeTab === 'orders' ? 'bold' : 'regular'} className="w-3.5 h-3.5" />
          <span>Bills History</span>
        </button>

        <button
          onClick={() => onTabChange('customers')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'customers'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <UsersThree weight={activeTab === 'customers' ? 'bold' : 'regular'} className="w-3.5 h-3.5" />
          <span>Customers & Khata</span>
        </button>

        <button
          onClick={() => onTabChange('suppliers')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'suppliers'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Truck weight={activeTab === 'suppliers' ? 'bold' : 'regular'} className="w-3.5 h-3.5" />
          <span>Suppliers</span>
        </button>

        <button
          onClick={() => onTabChange('reports')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <ChartLineUp weight={activeTab === 'reports' ? 'bold' : 'regular'} className="w-3.5 h-3.5" />
          <span>Reports & GST</span>
        </button>
      </nav>

      {/* Terminal & Quick Actions & Cashier Info & Sign Out */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs">
        {/* Quick Shift Button */}
        {onOpenDrawer && (
          <button
            onClick={onOpenDrawer}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold cursor-pointer transition-colors ${
              activeShift
                ? 'bg-zinc-900 border-emerald-900/60 text-emerald-400 hover:border-emerald-700'
                : 'bg-zinc-900 border-amber-900/60 text-amber-400 hover:border-amber-700'
            }`}
            title="Cash Drawer Shift Status"
          >
            <Vault className="w-3.5 h-3.5" />
            <span className="w-2 h-2 rounded-full inline-block bg-current" />
            <span className="hidden lg:inline">
              {activeShift ? `Shift Active (₹${activeShift.expectedCash || activeShift.openingFloat})` : 'Open Shift'}
            </span>
          </button>
        )}

        {/* Quick Returns Button */}
        {onOpenReturns && (
          <button
            onClick={onOpenReturns}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold cursor-pointer transition-colors"
            title="Return or Exchange Bill"
          >
            <ArrowUDownLeft className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden xl:inline">Return</span>
          </button>
        )}

        {/* Held Carts Badge Button */}
        {heldCartsCount > 0 && onOpenHeldCarts && (
          <button
            onClick={onOpenHeldCarts}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 font-bold cursor-pointer transition-colors"
            title="Recall Paused Bills"
          >
            <PauseCircle className="w-3.5 h-3.5" />
            <span>Held ({heldCartsCount})</span>
          </button>
        )}

        {/* Live Clock */}
        <div className="hidden 2xl:flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          <span>{currentTime}</span>
        </div>

        {/* Cashier Badge */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md">
          <User className="w-3.5 h-3.5 text-red-500" />
          <span className="font-semibold text-zinc-200 hidden sm:inline">
            {currentUser?.fullName || currentUser?.username || 'Cashier'}
          </span>
          <span className="text-[10px] px-1 rounded-sm bg-red-950 text-red-400 font-bold border border-red-900">
            {currentUser?.role || 'STAFF'}
          </span>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={onSignOut}
          className="p-1.5 sm:px-2.5 sm:py-1 rounded-md bg-zinc-900 hover:bg-red-600 hover:text-white border border-zinc-800 text-zinc-400 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
          title="Sign Out"
        >
          <SignOut weight="bold" className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
