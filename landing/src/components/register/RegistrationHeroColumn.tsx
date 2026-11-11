import { Cloud } from '@phosphor-icons/react';

export function RegistrationHeroColumn() {
  return (
    <div className="lg:col-span-5 flex flex-col justify-start pt-2 font-sans select-none">
      {/* App Cloud Badge Icon */}
      <div className="w-14 h-14 rounded-md bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center mb-6 border border-white/20">
        <Cloud weight="fill" className="w-8 h-8 text-white" />
      </div>

      {/* Headline */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
        Create your <span className="text-red-500">Vendora</span>
        <span className="block text-white">RetailPOS account</span>
      </h1>

      {/* 3 Numbered Steps */}
      <div className="mt-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
            1
          </div>
          <p className="text-sm sm:text-base font-semibold text-zinc-200">
            Register free using the form
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
            2
          </div>
          <p className="text-sm sm:text-base font-semibold text-zinc-200">
            Get your username and password by email
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
            3
          </div>
          <p className="text-sm sm:text-base font-semibold text-zinc-200">
            Sign in and start billing on your free trial
          </p>
        </div>
      </div>

      {/* Laptop Mockup Display */}
      <div className="mt-12 w-full max-w-[500px]">
        <div className="rounded-t-md bg-[#18181b] p-2.5 border border-zinc-700/80">
          <div className="bg-[#09090b] px-3 py-1.5 rounded-t-md flex items-center justify-between border-b border-zinc-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[10px] font-mono text-zinc-400">yourshop.vendora.com</span>
            <span className="text-[9px] text-zinc-500 font-mono">Vendora Cloud</span>
          </div>
          <div className="rounded-b-md overflow-hidden bg-zinc-950 aspect-[16/10]">
            <img
              src="/assets/vendora_hero_pos.jpg"
              alt="Vendora RetailPOS Billing Display"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="h-4 bg-gradient-to-b from-[#27272a] via-[#3f3f46] to-[#18181b] rounded-b-md border-x border-b border-zinc-700 relative">
          <div className="w-24 h-1 bg-zinc-600 rounded-b mx-auto" />
        </div>
      </div>
    </div>
  );
}

