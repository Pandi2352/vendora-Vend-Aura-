import { cn } from './cn';

interface UsageMeterProps {
  label: string;
  used: number;
  limit: number;
  caption?: string;
}

/** Plan usage bar: amber from 80%, red when the limit is reached. */
export function UsageMeter({ label, used, limit, caption }: UsageMeterProps) {
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const tone = percent >= 100 ? 'bg-red-600' : percent >= 80 ? 'bg-amber-500' : 'bg-primary-600';

  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">{label}</span>
        <span className="text-sm font-bold text-zinc-900">
          {used.toLocaleString('en-IN')}
          <span className="text-zinc-400 font-medium"> / {limit.toLocaleString('en-IN')}</span>
        </span>
      </div>
      <div
        className="h-1.5 rounded-full bg-zinc-100 overflow-hidden"
        role="progressbar"
        aria-label={label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={cn('h-full rounded-full transition-all', tone)} style={{ width: `${percent}%` }} />
      </div>
      {caption && <p className="text-[11px] text-zinc-400 mt-1.5">{caption}</p>}
    </div>
  );
}
