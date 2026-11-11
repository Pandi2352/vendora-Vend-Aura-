import { useState, useEffect } from 'react';
import {
  SignOut,
  User,
  Clock,
  Storefront,
} from '@phosphor-icons/react';
import type { AuthUser } from '../types/pos.types';

interface PosHeaderProps {
  currentUser: AuthUser | null;
  onSignOut: () => void;
}

export function PosHeader({ currentUser, onSignOut }: PosHeaderProps) {
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
          <span className="font-bold text-xs sm:text-sm text-zinc-100 truncate max-w-[180px] sm:max-w-none">
            {currentUser?.businessName || 'Vendora Retail Store'}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">
            {currentUser?.shopId || 'shop'}.vendora.com
          </span>
        </div>
      </div>

      {/* Terminal & Cashier Info & Sign Out */}
      <div className="flex items-center gap-3 sm:gap-4 text-xs">
        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          <span>{currentTime}</span>
        </div>

        {/* Terminal Pill */}
        <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-semibold text-zinc-300">
          Terminal: OUT-01
        </span>

        {/* Cashier Badge */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md">
          <User className="w-3.5 h-3.5 text-red-500" />
          <span className="font-semibold text-zinc-200">
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

