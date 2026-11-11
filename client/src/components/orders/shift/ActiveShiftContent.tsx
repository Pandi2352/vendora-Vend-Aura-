import { Clock, Warning } from '@phosphor-icons/react';
import type { ShiftSummary } from '@/types/shift-return.types';
import type { CloseShiftValues, OpenShiftValues } from '@/validations/orders';
import { formatInr, formatTime } from '@/utils';
import { cn } from '@/components/ui';
import { CloseShiftForm, OpenShiftForm } from './ShiftForms';

interface ActiveShiftContentProps {
  activeShift: ShiftSummary | null;
  defaultOpeningFloat: number;
  onOpenShift: (values: OpenShiftValues) => Promise<unknown>;
  onCloseShift: (values: CloseShiftValues) => Promise<unknown>;
}

export function ActiveShiftContent({ activeShift, defaultOpeningFloat, onOpenShift, onCloseShift }: ActiveShiftContentProps) {
  if (!activeShift) {
    return (
      <div className="space-y-4">
        <div className="p-3.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <Warning weight="bold" className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">No cash drawer shift is open.</span>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Open a new shift to record the opening float in the till and start taking orders.
            </p>
          </div>
        </div>
        <OpenShiftForm defaultOpeningFloat={defaultOpeningFloat} onSubmit={onOpenShift} />
      </div>
    );
  }

  const refunds = activeShift.cashRefundsTotal || 0;

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-md bg-ink text-white flex justify-between items-center text-xs">
        <div>
          <span className="font-mono font-bold text-primary-300">{activeShift.shiftNumber}</span>
          <span className="text-zinc-400 ml-2">Cashier: {activeShift.cashierName}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-zinc-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span>{formatTime(activeShift.openedAt)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <Kpi label="Opening float" value={formatInr(activeShift.openingFloat)} />
        <Kpi label="Cash sales" value={formatInr(activeShift.cashSalesTotal)} tone="text-emerald-700" bg="bg-emerald-50/50" />
        <Kpi label="UPI sales" value={formatInr(activeShift.upiSalesTotal)} />
        <Kpi label="Cash refunds" value={`-${formatInr(refunds)}`} tone="text-red-700" bg="bg-red-50/50" />
      </div>

      <div className="p-3 rounded-md bg-zinc-100 border border-zinc-200 text-xs flex justify-between items-center gap-3">
        <div>
          <span className="font-semibold text-zinc-800">Expected cash in drawer</span>
          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
            Float ({formatInr(activeShift.openingFloat)}) + Cash sales ({formatInr(activeShift.cashSalesTotal)}) - Refunds (
            {formatInr(refunds)})
          </p>
        </div>
        <span className="font-mono font-black text-base text-zinc-950">{formatInr(activeShift.expectedCash)}</span>
      </div>

      <div className="pt-3 border-t border-zinc-200">
        <h4 className="font-bold text-xs text-zinc-900 mb-3">End-of-shift reconciliation</h4>
        <CloseShiftForm expectedCash={activeShift.expectedCash} onSubmit={onCloseShift} />
      </div>
    </div>
  );
}

function Kpi({ label, value, tone = 'text-zinc-900', bg = 'bg-zinc-50' }: { label: string; value: string; tone?: string; bg?: string }) {
  return (
    <div className={cn('p-2.5 rounded-md border border-zinc-200', bg)}>
      <span className="text-[10px] text-zinc-500 block">{label}</span>
      <span className={cn('font-mono font-bold text-sm', tone)}>{value}</span>
    </div>
  );
}
