import { Store, ArrowRight, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onOpenOnboarding?: (planCode?: string) => void;
}

export function Navbar({ onOpenOnboarding }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">Vendora</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 uppercase tracking-wider">
                Cloud POS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Powered by Unipro Tech</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-brand-600 transition-colors">How it works</a>
          <a href="#comparison" className="hover:text-brand-600 transition-colors">Why Vendora</a>
          <a href="#plans" className="hover:text-brand-600 transition-colors">Pricing Plans</a>
          <a href="#faq" className="hover:text-brand-600 transition-colors">FAQ</a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Link to Super Admin Dashboard */}
          <Link
            to="/admin"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all border border-slate-200"
            title="SaaS Platform Admin Dashboard"
          >
            <UserCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>Platform Admin</span>
          </Link>

          {/* Link to Merchant Store login (runs on client port 4001) */}
          <a
            href="http://localhost:4001"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
          >
            Shop Sign In
          </a>

          {/* Trigger Onboarding Modal */}
          <button
            onClick={() => onOpenOnboarding ? onOpenOnboarding('FREE_TRIAL') : null}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-brand-600/20 transition-all cursor-pointer"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
