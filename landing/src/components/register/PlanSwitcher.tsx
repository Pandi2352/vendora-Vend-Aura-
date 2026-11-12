import { SubscriptionPlanCode, type SubscriptionPlanDetails } from '../../shared';
import { cn } from '../ui/cn';

interface PlanSwitcherProps {
  selected: SubscriptionPlanCode;
  planInfo: SubscriptionPlanDetails;
  onSelect: (plan: SubscriptionPlanCode) => void;
}

const planLabel = (code: SubscriptionPlanCode) =>
  code === SubscriptionPlanCode.FREE_TRIAL ? 'Trial' : code.charAt(0) + code.slice(1).toLowerCase();

/** Selected plan summary with a segmented control to switch plans. */
export function PlanSwitcher({ selected, planInfo, onSelect }: PlanSwitcherProps) {
  const price = planInfo.monthlyPrice === 0 ? '30 days free' : `₹${planInfo.monthlyPrice.toLocaleString('en-IN')}/mo`;
  return (
    <div className="p-3.5 rounded-md bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
      <div className="flex items-center gap-2.5">
        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-100 text-red-700 uppercase">Plan</span>
        <span className="text-xs sm:text-sm font-bold text-zinc-900">
          {planInfo.name} ({price})
        </span>
      </div>
      <div role="group" aria-label="Subscription plan" className="flex items-center gap-1">
        {Object.values(SubscriptionPlanCode).map((code) => (
          <button
            key={code}
            type="button"
            aria-pressed={selected === code}
            onClick={() => onSelect(code)}
            className={cn(
              'px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer',
              selected === code ? 'bg-zinc-950 text-white' : 'bg-zinc-200/80 hover:bg-zinc-300 text-zinc-700',
            )}
          >
            {planLabel(code)}
          </button>
        ))}
      </div>
    </div>
  );
}
