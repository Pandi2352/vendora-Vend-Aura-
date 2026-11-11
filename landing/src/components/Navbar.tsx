import { ArrowRight, UserCheck } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { RetailPosLogo } from './RetailPosLogo';

interface NavbarProps {
  onScrollToPlans?: () => void;
}

export function Navbar({ onScrollToPlans }: NavbarProps) {
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (id === 'plans' && onScrollToPlans) {
      onScrollToPlans();
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-200 font-sans w-full">
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16 h-18 flex items-center justify-between">
        
        {/* Brand Logo: RetailPOS Powered by Vendora matching media_1794379809964_00e19b3c.png */}
        <Link to="/" className="flex items-center shrink-0">
          <RetailPosLogo size="md" />
        </Link>

        {/* Navigation Links with Smooth Scrolling */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-10 text-sm font-semibold text-zinc-700">
          <a href="#comparison" onClick={scrollTo('comparison')} className="hover:text-red-600 transition-colors">
            Why RetailPOS
          </a>
          <a href="#features" onClick={scrollTo('features')} className="hover:text-red-600 transition-colors">
            Features
          </a>
          <a href="#how-it-works" onClick={scrollTo('how-it-works')} className="hover:text-red-600 transition-colors">
            How it works
          </a>
          <a href="#plans" onClick={scrollTo('plans')} className="hover:text-red-600 transition-colors">
            Pricing Plans
          </a>
          <a href="#faq" onClick={scrollTo('faq')} className="hover:text-red-600 transition-colors">
            FAQ
          </a>
        </nav>

        {/* Actions - Shop Sign In removed as instructed; Create Free Account opens registration in new tab */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Link to Platform Super Admin */}
          <Link
            to="/admin"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition-all border border-zinc-300"
            title="SaaS Platform Super Admin"
          >
            <UserCheck weight="bold" className="w-3.5 h-3.5 text-red-600" />
            <span>Platform Admin</span>
          </Link>

          {/* Create Free Account Button: Opens /register in new tab as instructed */}
          <a
            href="/register"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            <span>Create Free Account</span>
            <ArrowRight weight="bold" className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
