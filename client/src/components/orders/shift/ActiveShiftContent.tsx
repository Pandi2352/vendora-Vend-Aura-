import { Clock, Warning } from '@phosphor-icons/react';
import type { ShiftSummary } from '../../../types/shift-return.types';

interface ActiveShiftContentProps {
  activeShift: ShiftSummary | null;
  openingFloat: number;
  setOpeningFloat: (val: number) => void;
  openNotes: string;
  setOpenNotes: (val: string) => void;
  isOpening: boolean;
  onOpenShift: () => void;
  actualCash: string;
  setActualCash: (val: string) => void;
  closeNotes: string;
  setCloseNotes: (val: string) => void;
  isClosing: boolean;
  onCloseShift: () => void;
}

export function ActiveShiftContent({
  activeShift,
  openingFloat,
  setOpeningFloat,
  openNotes,
  setOpenNotes,
  isOpening,
  onOpenShift,
  actualCash,
  setActualCash,
  closeNotes,
  setCloseNotes,
  isClosing,
  onCloseShift,
}: ActiveShiftContentProps) {
  if (!activeShift) {
    return (
      <div className="space-y-4 py-2">
        <div className="p-3.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <Warning weight="bold" className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">No Cash Drawer Shift is currently open.</span>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Open a new shift to record beginning physical float cash in the till and start taking orders.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Opening Physical Cash Float (₹)
            </label>
            <input
              type="number"
              min={0}
              value={openingFloat}
              onChange={(e) => setOpeningFloat(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm font-mono font-bold rounded-md border border-zinc-300 focus:border-primary-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Opening Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Morning opening shift, clean till"
              value={openNotes}
              onChange={(e) => setOpenNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 focus:border-primary-600"
            />
          </div>

          <button
            onClick={onOpenShift}
            disabled={isOpening}
            className="w-full py-2.5 rounded-md bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            {isOpening ? 'Opening Shift...' : `Open Shift with ₹${openingFloat} Float`}
          </button>
        </div>
      </div>
    );
  }

  const countedVal = parseFloat(actualCash);
  const variance = !isNaN(countedVal) ? countedVal - activeShift.expectedCash : 0;

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-md bg-ink text-white flex justify-between items-center text-xs">
        <div>
          <span className="font-mono font-bold text-red-500">{activeShift.shiftNumber}</span>
          <span className="text-zinc-400 ml-2">Cashier: {activeShift.cashierName}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-zinc-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span>{new Date(activeShift.openedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-md border border-zinc-200 bg-zinc-50">
          <span className="text-[10px] text-zinc-500 block">Opening Float</span>
          <span className="font-mono font-bold text-sm text-zinc-900">₹{activeShift.openingFloat}</span>
        </div>
        <div className="p-2.5 rounded-md border border-zinc-200 bg-emerald-50/50">
          <span className="text-[10px] text-zinc-500 block">Cash Sales</span>
          <span className="font-mono font-bold text-sm text-emerald-700">₹{activeShift.cashSalesTotal}</span>
        </div>
        <div className="p-2.5 rounded-md border border-zinc-200 bg-zinc-50">
          <span className="text-[10px] text-zinc-500 block">UPI Sales</span>
          <span className="font-mono font-bold text-sm text-zinc-900">₹{activeShift.upiSalesTotal}</span>
        </div>
        <div className="p-2.5 rounded-md border border-zinc-200 bg-red-50/50">
          <span className="text-[10px] text-zinc-500 block">Cash Refunds</span>
          <span className="font-mono font-bold text-sm text-red-700">-₹{activeShift.cashRefundsTotal || 0}</span>
        </div>
      </div>

      {/* Expected Cash in Till Formula Card */}
      <div className="p-3 rounded-md bg-zinc-100 border border-zinc-200 text-xs flex justify-between items-center">
        <div>
          <span className="font-semibold text-zinc-800">Expected Physical Cash in Drawer:</span>
          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
            Float (₹{activeShift.openingFloat}) + Cash Sales (₹{activeShift.cashSalesTotal}) - Refunds (₹{activeShift.cashRefundsTotal || 0})
          </p>
        </div>
        <span className="font-mono font-black text-base text-zinc-950">₹{activeShift.expectedCash}</span>
      </div>

      {/* Closing Reconcile Section */}
      <div className="pt-2 border-t border-zinc-200 space-y-3">
        <h4 className="font-bold text-xs text-zinc-900">End-of-Shift Reconciliation</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-zinc-700 mb-1">
              Actual Physical Cash Counted (₹)
            </label>
            <input
              type="number"
              placeholder={`e.g. ${activeShift.expectedCash}`}
              value={actualCash}
              onChange={(e) => setActualCash(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-md border border-zinc-300 focus:border-primary-600"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-zinc-700 mb-1">Closing Variance</label>
            <div
              className={`px-3 py-1.5 rounded-md font-mono font-bold text-xs border ${
                !actualCash
                  ? 'bg-zinc-50 text-zinc-400 border-zinc-200'
                  : variance === 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : variance > 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-red-50 text-red-700 border-red-300'
              }`}
            >
              {!actualCash
                ? 'Enter counted cash'
                : variance === 0
                ? '₹0 (Balanced)'
                : variance > 0
                ? `+₹${variance} (Overage)`
                : `-₹${Math.abs(variance)} (Shortage)`}
            </div>
          </div>
        </div>

        <input
          type="text"
          placeholder="Closing reconciliation notes..."
          value={closeNotes}
          onChange={(e) => setCloseNotes(e.target.value)}
          className="w-full px-3 py-1.5 text-xs rounded-md border border-zinc-300"
        />

        <button
          onClick={onCloseShift}
          disabled={isClosing || !actualCash}
          className="w-full py-2.5 rounded-md bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer transition-colors"
        >
          {isClosing ? 'Closing Shift...' : 'Reconcile & Close Cash Drawer Shift'}
        </button>
      </div>
    </div>
  );
}

