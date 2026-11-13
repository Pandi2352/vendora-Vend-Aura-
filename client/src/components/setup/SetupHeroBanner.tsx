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
    <div className="relative rounded-md bg-white border border-zinc-200 border-l-4 border-l-primary-600 p-5 sm:p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Column: Heading, subtitle, and dynamic status pill */}
        <div className="space-y-3 flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-primary-50 text-primary-700 text-[0.65625rem] font-bold tracking-wider uppercase border border-primary-200">
            <RocketLaunch className="w-3.5 h-3.5 text-primary-600" />
            <span>Getting Started</span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Let&apos;s get you billing, {ownerName}
            </h1>
            <p className="text-xs text-zinc-500 mt-1 max-w-2xl leading-relaxed">
              Work down the steps in order. Each one ticks itself off as you finish it — nothing here is marked by hand.
            </p>
          </div>

          {/* Dynamic Status Alert Pill */}
          {isReadyToBill ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <CheckCircle weight="fill" className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Everything a bill needs is in place — ring one to finish.</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
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
