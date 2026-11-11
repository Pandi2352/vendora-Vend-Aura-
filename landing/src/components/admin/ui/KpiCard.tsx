import type { ReactNode } from 'react';

export type KpiTone = 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan';

/** Soft tinted wash + icon tile per tone ("light colour effect" without shadows). */
const TONES: Record<KpiTone, { wash: string; icon: string; bar: string }> = {
  blue: { wash: 'from-blue-50', icon: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500' },
  emerald: { wash: 'from-emerald-50', icon: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' },
  violet: { wash: 'from-violet-50', icon: 'bg-violet-100 text-violet-700', bar: 'bg-violet-500' },
  amber: { wash: 'from-amber-50', icon: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' },
  rose: { wash: 'from-rose-50', icon: 'bg-rose-100 text-rose-700', bar: 'bg-rose-500' },
  cyan: { wash: 'from-cyan-50', icon: 'bg-cyan-100 text-cyan-700', bar: 'bg-cyan-500' },
};

interface KpiCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: ReactNode;
  tone?: KpiTone;
}

export function KpiCard({ label, value, hint, icon, tone = 'blue' }: KpiCardProps) {
  const t = TONES[tone];
  return (
    <div className={`relative overflow-hidden rounded-md border border-zinc-200 bg-gradient-to-br ${t.wash} via-white to-white p-5`}>
      <span className={`absolute left-0 top-0 h-full w-1 ${t.bar}`} aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{label}</p>
          <p className="text-2xl font-black text-zinc-950 mt-1.5 tabular-nums truncate">{value}</p>
          {hint && <p className="text-xs text-zinc-500 mt-1">{hint}</p>}
        </div>
        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-md shrink-0 [&>svg]:w-5 [&>svg]:h-5 ${t.icon}`}>
          {icon}
        </span>
      </div>
    </div>
  );
}
