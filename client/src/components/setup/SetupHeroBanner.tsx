import { RocketLaunch, CheckCircle, Info } from '@phosphor-icons/react';
import { CircularProgressRing } from './CircularProgressRing';

interface SetupHeroBannerProps {
  ownerName: string;
  completedCount: number;
  totalSteps: number;
  isReadyToBill: boolean;
}

export function SetupHeroBanner({
  ownerName,
  completedCount,
  totalSteps,
  isReadyToBill,
}: SetupHeroBannerProps) {
  return (
    <div className="relative rounded-lg bg-slate-900 border border-slate-800 p-6 text-white overflow-hidden shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Column: Heading and info */}
        <div className="space-y-3 flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 text-white/90 text-xs font-bold tracking-wide uppercase border border-white/10">
            <RocketLaunch className="w-3.5 h-3.5 text-primary-400" />
            <span>Getting Started</span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Let&apos;s get you billing, {ownerName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Work down the steps in order. Each one ticks itself off as you finish it — nothing here is marked by hand.
            </p>
          </div>

          {/* Dynamic Status Alert Pill */}
          {isReadyToBill ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <CheckCircle weight="fill" className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Everything a bill needs is in place — ring one to finish.</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Complete the essential steps below to start billing customers.</span>
            </div>
          )}
        </div>

        {/* Right Column: Circular Progress Ring */}
        <div className="flex items-center gap-4 self-center md:self-auto shrink-0 pr-2">
          <CircularProgressRing completed={completedCount} total={totalSteps} />
        </div>
      </div>
    </div>
  );
}

