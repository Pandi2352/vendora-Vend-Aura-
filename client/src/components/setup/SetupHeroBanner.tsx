import { RocketLaunch, CheckCircle, Info } from '@phosphor-icons/react';
import { CircularProgressRing } from './CircularProgressRing';

interface SetupHeroBannerProps {
  ownerName: string;
  completedCount: number;
  totalSteps: number;
  isReadyToBill: boolean;
}

/**
 * SetupHeroBanner renders the high-contrast getting started card matching
 * the reference screenshot: deep navy background, white title, muted slate subtitle,
 * dark emerald status pill, and neon progress ring.
 */
export function SetupHeroBanner({
  ownerName,
  completedCount,
  totalSteps,
  isReadyToBill,
}: SetupHeroBannerProps) {
  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-[#0c162c] via-[#101c36] to-[#0a1224] border border-[#1e2f52] p-6 sm:p-7 text-white overflow-hidden shadow-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Column: Heading, subtitle, and dynamic status pill */}
        <div className="space-y-3 flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[0.65625rem] font-bold tracking-wider uppercase border border-white/10">
            <RocketLaunch className="w-3.5 h-3.5 text-blue-400" />
            <span>Getting Started</span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Let&apos;s get you billing, {ownerName}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Work down the steps in order. Each one ticks itself off as you finish it — nothing here is marked by hand.
            </p>
          </div>

          {/* Dynamic Status Alert Pill */}
          {isReadyToBill ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#064e3b]/40 border border-[#10b981]/40 text-[#6ee7b7] text-xs font-medium">
              <CheckCircle weight="fill" className="w-4 h-4 text-[#10b981] shrink-0" />
              <span>Everything a bill needs is in place — ring one to finish.</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-200 text-xs font-medium">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Complete the essential steps below to start billing customers.</span>
            </div>
          )}
        </div>

        {/* Right Column: Circular Progress Gauge */}
        <div className="flex items-center gap-4 self-center md:self-auto shrink-0 pr-1">
          <CircularProgressRing completed={completedCount} total={totalSteps} />
        </div>
      </div>
    </div>
  );
}
