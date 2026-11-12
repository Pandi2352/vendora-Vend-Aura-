import { Check, Users, ArrowRight } from '@phosphor-icons/react';
import { cn } from '../ui/cn';

export interface SubMasterPill {
  label: string;
  count: number;
  ready: boolean;
}

interface SetupStepItemProps {
  stepNumber: number;
  title: string;
  description: string;
  count?: number | string;
  completed: boolean;
  isOptional?: boolean;
  isHighlighted?: boolean;
  subMasters?: SubMasterPill[];
  actionLabel?: string;
  onAction: () => void;
  isLast?: boolean;
}

export function SetupStepItem({
  stepNumber,
  title,
  description,
  count,
  completed,
  isOptional = false,
  isHighlighted = false,
  subMasters,
  actionLabel = 'View',
  onAction,
  isLast = false,
}: SetupStepItemProps) {
  return (
    <div className="relative flex items-start gap-4">
      {/* Vertical Timeline Track */}
      {!isLast && (
        <div
          className={cn(
            'absolute left-[15px] top-[32px] bottom-[-16px] w-[2px] transition-colors',
            completed ? 'bg-emerald-500' : 'bg-zinc-200',
          )}
          aria-hidden
        />
      )}

      {/* Step Circle Indicator */}
      <div className="relative z-10 shrink-0 mt-3">
        {completed ? (
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <Check weight="bold" className="w-4 h-4" />
          </div>
        ) : isOptional ? (
          <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-300 text-zinc-500 flex items-center justify-center">
            <Users weight="bold" className="w-4 h-4" />
          </div>
        ) : isHighlighted ? (
          <div className="w-8 h-8 rounded-full bg-primary-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {stepNumber}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-300 text-zinc-600 font-bold text-xs flex items-center justify-center">
            {stepNumber}
          </div>
        )}
      </div>

      {/* Step Main Card */}
      <div
        className={cn(
          'flex-1 rounded-md p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4',
          isHighlighted && !completed
            ? 'border-2 border-primary-500 bg-primary-50/20'
            : 'border border-zinc-200 bg-white hover:border-zinc-300',
        )}
      >
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-sm text-zinc-950">{title}</h3>
            {isOptional ? (
              <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 font-semibold text-[10px] uppercase">
                Optional
              </span>
            ) : count !== undefined ? (
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[11px] font-bold inline-flex items-center justify-center border border-emerald-200">
                {count}
              </span>
            ) : null}
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed">{description}</p>

          {/* Sub-master Pills (e.g. Department, Category, Brand, UOM, Floor) */}
          {subMasters && subMasters.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
              {subMasters.map((m, idx) => (
                <span
                  key={idx}
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border',
                    m.ready
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600',
                  )}
                >
                  <Check weight="bold" className="w-3 h-3 text-emerald-600" />
                  <span>
                    {m.label} {m.count}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={onAction}
            className={cn(
              'px-4 py-2 rounded-md font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer',
              isHighlighted && !completed
                ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm'
                : actionLabel.includes('>')
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300',
            )}
          >
            <span>{actionLabel}</span>
            {actionLabel.includes('>') && <ArrowRight weight="bold" className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

