import { 
  Gift, 
  ArrowRight, 
  Laptop, 
  Receipt, 
  Package, 
  ChartBar, 
  Cloud, 
  Lightning 
} from '@phosphor-icons/react';
import { IndustryTicker } from './IndustryTicker';

interface HeroSectionProps {
  onScrollToPlans?: () => void;
}

export function HeroSection({ onScrollToPlans }: HeroSectionProps) {
  const pills = [
    { label: 'Easy Billing', icon: Receipt, iconBg: 'bg-emerald-500 text-white' },
    { label: 'Stock Management', icon: Package, iconBg: 'bg-blue-500 text-white' },
    { label: 'Reports & Analytics', icon: ChartBar, iconBg: 'bg-purple-500 text-white' },
    { label: 'Cloud Based POS', icon: Cloud, iconBg: 'bg-amber-500 text-white' },
    { label: 'Quick Setup', icon: Lightning, iconBg: 'bg-red-500 text-white' },
  ];

  const handleBookDemoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onScrollToPlans) {
      onScrollToPlans();
    } else {
      const el = document.getElementById('how-it-works');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#070c1e] via-[#09122e] to-[#040817] text-white pt-12 lg:pt-16 font-sans w-full">
      {/* Decorative dot matrix accent spanning full screen */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16 relative z-10 pb-14 lg:pb-18">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Left Column: Headlines & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left">
            {/* Top Pill Badge matching screenshot */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 border border-white/20 text-white text-xs font-semibold mb-6 w-fit">
              <Gift weight="fill" className="w-3.5 h-3.5 text-red-400" />
              <span>FREE TRIAL • REGISTER FREE</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white leading-[1.12] max-w-2xl xl:max-w-3xl">
              Cloud POS system for your retail store:{' '}
              <span className="text-red-500 block sm:inline">
                billing, stock and reports, ready in minutes.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-sm sm:text-base lg:text-lg text-zinc-300 leading-relaxed max-w-xl xl:max-w-2xl font-normal">
              Vendora is cloud based point of sale system software that runs in your browser.
              Sign up, pick your business type, and start billing the same day, with items, prices
              and stock already set up for you.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <a
                href="/register"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Create Free Account</span>
                <ArrowRight weight="bold" className="w-4 h-4" />
              </a>

              <button
                onClick={handleBookDemoClick}
                className="w-full sm:w-auto px-7 py-3.5 rounded-md bg-white/5 hover:bg-white/10 text-white font-semibold text-sm sm:text-base border border-white/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Laptop weight="bold" className="w-4 h-4 text-zinc-300" />
                <span>Book a Demo</span>
              </button>
            </div>

            {/* Feature Pills Strip below buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-2.5 max-w-2xl">
              {pills.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 border border-white/15 text-xs sm:text-sm font-semibold text-white backdrop-blur-xs"
                  >
                    <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${item.iconBg}`}>
                      <Icon weight="bold" className="w-2.5 h-2.5" />
                    </span>
                    <span>{item.label}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Right Column: Realistic Open Laptop Mockup with Overlapping Pricing Card */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative mt-6 lg:mt-0 w-full">
            {/* Laptop Mockup Wrapper - Scaled Up to eliminate empty space */}
            <div className="w-full max-w-[760px] xl:max-w-[820px] relative">
              {/* Laptop Screen Body */}
              <div className="rounded-t-md bg-[#18181b] p-2.5 sm:p-3 border border-zinc-700/80">
                {/* Screen Top Bar / Browser Notch */}
                <div className="bg-[#09090b] px-3.5 py-2 rounded-t-md flex items-center justify-between border-b border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="bg-[#18181b] px-5 py-0.5 rounded-md text-xs font-mono text-zinc-400 border border-zinc-700 flex items-center gap-1.5">
                    <span className="text-red-500">🔒</span>
                    <span>yourshop.vendora.com/pos</span>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">Vendora v1.0</span>
                </div>

                {/* Screen Display containing the POS billing screenshot */}
                <div className="relative rounded-b-md overflow-hidden bg-zinc-950 aspect-[16/10]">
                  <img
                    src="/assets/vendora_hero_pos.jpg"
                    alt="Vendora Cloud POS Billing Counter Software on Laptop"
                    className="w-full h-full object-cover block"
                  />
                </div>
              </div>

              {/* Laptop Keyboard Base */}
              <div className="h-5 sm:h-6 bg-gradient-to-b from-[#27272a] via-[#3f3f46] to-[#18181b] rounded-b-md border-x border-b border-zinc-700 relative">
                <div className="w-32 sm:w-40 h-1.5 bg-zinc-600 rounded-b mx-auto" />
              </div>

              {/* Floating Pricing Card Overlapping Laptop */}
              <div className="mt-4 sm:mt-0 sm:absolute sm:-bottom-5 sm:-left-6 bg-white text-zinc-950 p-4 rounded-md border border-zinc-300 flex items-center gap-5 max-w-md">
                <div>
                  <span className="text-[11px] text-zinc-500 block font-semibold leading-tight">Starting at</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-zinc-950">₹999</span>
                    <span className="text-xs text-zinc-500">/month</span>
                  </div>
                </div>

                <div className="h-10 w-[1px] bg-zinc-200" />

                <div>
                  <div className="flex items-center gap-1.5">
                    <Gift weight="fill" className="w-4 h-4 text-red-600" />
                    <span className="text-sm sm:text-base font-bold text-zinc-950">30 Days Free Trial</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5 font-medium">
                    No installation. No credit card required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Moving Ticker Ribbon Component below hero */}
      <IndustryTicker />
    </section>
  );
}
