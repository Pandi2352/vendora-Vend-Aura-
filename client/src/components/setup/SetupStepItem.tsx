import { Check, CheckCircle, Users, ArrowRight } from '@phosphor-icons/react';
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

/**
 * SetupStepItem renders an individual setup milestone matching the exact
 * reference design: circular nodes, solid connector line, calibrated slate/mint text colors.
 */
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
  const isPrimaryAction = actionLabel.includes('>') || (isHighlighted && !completed);

  return (
    <div className="flex items-stretch gap-4 sm:gap-5 group">
      {/* Dedicated Vertical Timeline Rail Column (100% Centered) */}
      <div className="flex flex-col items-center shrink-0 w-7.5 select-none">
        {/* Circular Milestone Node */}
        <div className="relative z-10 shrink-0">
          {completed ? (
            <div className="w-7.5 h-7.5 rounded-full bg-[#16a34a] text-white flex items-center justify-center shadow-xs">
              <Check weight="bold" className="w-3.5 h-3.5 text-white" />
            </div>
          ) : isOptional ? (
            <div className="w-7.5 h-7.5 rounded-full bg-[#f1f5f9] border border-slate-200 text-slate-400 flex items-center justify-center">
              <Users weight="bold" className="w-3.5 h-3.5 text-slate-400" />
            </div>
          ) : (
            <div
              className={cn(
                'w-7.5 h-7.5 rounded-full text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs',
                isHighlighted ? 'bg-[#005bbf] ring-4 ring-blue-500/15' : 'bg-[#475569]',
              )}
            >
              {stepNumber}
            </div>
          )}
        </div>

        {/* Continuous Connecting Line */}
        {!isLast && (
          <div className="w-full flex-1 flex justify-center py-1" aria-hidden="true">
            <div
              className={cn(
                'w-[2.5px] h-full rounded-full transition-colors duration-200',
                completed ? 'bg-[#16a34a]' : 'bg-slate-200',
              )}
            />
          </div>
        )}
      </div>

      {/* Step Content: Highlighted Box for Step 8, Clean Flowing Row for Standard Steps */}
      <div
        className={cn(
          'flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0 transition-colors duration-150',
          !isLast && 'pb-6 sm:pb-7',
          isHighlighted
            ? 'rounded-xl p-3.5 sm:p-4 bg-[#eff6ff] border border-[#bfdbfe] my-0'
            : 'p-1 -ml-1 rounded-xl hover:bg-slate-50/50',
        )}
      >
        <div className="space-y-0.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[0.84375rem] text-slate-800 tracking-[-0.01em]">{title}</h3>
            {isOptional ? (
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold text-[0.59375rem] uppercase tracking-wider">
                Optional
              </span>
            ) : count !== undefined ? (
              <span className="min-w-4.5 h-4.5 px-1.5 rounded-full bg-[#ecfdf5] text-[#16a34a] font-mono text-[0.65625rem] font-bold inline-flex items-center justify-center border border-[#bbf7d0]">
                {count}
              </span>
            ) : null}
          </div>

          <p className="text-[0.75rem] text-slate-400 font-normal leading-relaxed max-w-2xl">{description}</p>

          {/* Sub-master Badges on Step 3 matching reference image exactly */}
          {subMasters && subMasters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {subMasters.map((m, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#dcfce7] border border-[#16a34a] text-[#15803d]"
                >
                  <CheckCircle weight="fill" className="w-4 h-4 text-[#16a34a] shrink-0" />
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
              'h-9 px-6 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer',
              isPrimaryAction
                ? 'bg-[#005bbf] hover:bg-[#004fa8] text-white font-bold shadow-xs hover:scale-[1.01] active:scale-[0.99]'
                : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-medium border border-slate-200 hover:border-slate-300',
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
