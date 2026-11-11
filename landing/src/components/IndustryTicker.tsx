import { useState } from 'react';
import { Play, Pause } from '@phosphor-icons/react';
import { BUSINESS_TYPE_LABELS } from '../shared';

const industries = Object.values(BUSINESS_TYPE_LABELS);

export function IndustryTicker() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="border-y border-white/10 bg-[#030612] py-3.5 text-white overflow-hidden relative w-full">
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16 flex items-center justify-between gap-6">
        {/* Continuous Smooth Marquee */}
        <div className="overflow-hidden flex-1 relative">
          <div className={`animate-marquee-smooth ${isPaused ? 'is-paused' : ''}`}>
            {[...industries, ...industries, ...industries].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 shrink-0 px-4 text-xs sm:text-sm font-semibold text-zinc-300">
                <span className="hover:text-white transition-colors cursor-default">{item}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Pause Motion Button */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer select-none"
          title={isPaused ? 'Resume scrolling motion' : 'Pause scrolling motion'}
        >
          {isPaused ? <Play weight="bold" className="w-3.5 h-3.5 text-red-400" /> : <Pause weight="bold" className="w-3.5 h-3.5 text-red-400" />}
          <span className="hidden sm:inline">{isPaused ? 'Resume motion' : 'Pause motion'}</span>
        </button>
      </div>
    </div>
  );
}
