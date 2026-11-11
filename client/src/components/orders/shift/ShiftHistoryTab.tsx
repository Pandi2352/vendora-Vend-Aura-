import type { ShiftSummary } from '../../../types/shift-return.types';

interface ShiftHistoryTabProps {
  historyList: ShiftSummary[];
}

export function ShiftHistoryTab({ historyList }: ShiftHistoryTabProps) {
  if (historyList.length === 0) {
    return <div className="py-8 text-center text-zinc-400 text-xs">No past shifts recorded yet.</div>;
  }

  return (
    <div className="space-y-2">
      {historyList.map((sh) => (
        <div
          key={sh.shiftNumber}
          className="p-3 rounded-md border border-zinc-200 bg-zinc-50 text-xs flex justify-between items-center"
        >
          <div>
            <span className="font-mono font-bold text-zinc-900">{sh.shiftNumber}</span>
            <span className="text-zinc-500 ml-2">by {sh.cashierName}</span>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
              {new Date(sh.openedAt).toLocaleDateString('en-IN')} • Float ₹{sh.openingFloat} • Sales ₹{sh.cashSalesTotal}
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono font-bold text-xs block">Counted: ₹{sh.actualCashCounted}</span>
            <span
              className={`text-[10px] font-mono font-bold ${
                (sh.variance || 0) === 0
                  ? 'text-emerald-600'
                  : (sh.variance || 0) > 0
                  ? 'text-emerald-600'
                  : 'text-red-600'
              }`}
            >
              {(sh.variance || 0) === 0
                ? 'Balanced'
                : (sh.variance || 0) > 0
                ? `+₹${sh.variance}`
                : `-₹${Math.abs(sh.variance || 0)}`}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

