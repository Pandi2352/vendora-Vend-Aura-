import { Sparkles, ArrowRight, Laptop, CheckCircle2, Zap } from 'lucide-react';

interface HeroSectionProps {
  onOpenOnboarding: (planCode?: string) => void;
}

export function HeroSection({ onOpenOnboarding }: HeroSectionProps) {
  const highlights = [
    'Easy Billing',
    'Stock Management',
    'Reports & Analytics',
    'Cloud Based POS',
    'Quick Setup',
  ];

  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-tr from-brand-200/40 via-indigo-100/30 to-purple-100/30 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Banner Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
          <span>RetailPOS Nova • Cloud POS for Modern Retail</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15]">
          Cloud POS system for your retail store:{' '}
          <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            billing, stock and reports, ready in minutes.
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Vendora is cloud-based point of sale system software that runs in your browser. Sign up, pick your business type, and start billing the same day, with items, prices, and stock already set up for you.
        </p>

        {/* Feature Pills */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5 max-w-2xl mx-auto">
          {highlights.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {item}
            </span>
          ))}
        </div>

        {/* CTA Buttons & Price Anchor */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onOpenOnboarding('FREE_TRIAL')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm sm:text-base shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#plans"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm sm:text-base border border-slate-300 shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Laptop className="w-4 h-4 text-slate-600" />
            <span>Book a Demo</span>
          </a>
        </div>

        {/* Trust Guarantees & Pricing Callout */}
        <div className="mt-10 p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-around gap-4 text-center sm:text-left">
          <div>
            <span className="text-xs text-slate-500 block font-medium">Starting at</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight">₹999</span>
            <span className="text-xs text-slate-500 ml-1">/month</span>
          </div>

          <div className="hidden sm:block h-10 w-[1px] bg-slate-200" />

          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mb-0.5">
              30 Days
            </span>
            <span className="text-sm font-bold text-slate-900 block">Free Trial Included</span>
          </div>

          <div className="hidden sm:block h-10 w-[1px] bg-slate-200" />

          <div className="text-xs text-slate-500 font-medium">
            <span className="flex items-center justify-center sm:justify-start gap-1 text-slate-700 font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> No installation
            </span>
            <span>No credit card required.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
