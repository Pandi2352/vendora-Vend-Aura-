import { QrCode, WarningCircle } from '@phosphor-icons/react';
import type { CustomerItem, PaymentMode } from '../../types/pos.types';

interface PaymentModePanelsProps {
  paymentMode: PaymentMode;
  grandTotal: number;
  cashTendered: number;
  selectedCustomer: CustomerItem | null;
  onCashTenderedChange: (val: number) => void;
  onAddCash: (amount: number) => void;
  onSetExact: () => void;
}

export function PaymentModePanels({
  paymentMode,
  grandTotal,
  cashTendered,
  selectedCustomer,
  onCashTenderedChange,
  onAddCash,
  onSetExact,
}: PaymentModePanelsProps) {
  const changeDue = Math.max(0, cashTendered - grandTotal);
  const availableCredit = selectedCustomer
    ? Math.max(0, selectedCustomer.creditLimit - selectedCustomer.currentCreditBalance)
    : 0;
  const isCreditExceeded = selectedCustomer
    ? selectedCustomer.currentCreditBalance + grandTotal > selectedCustomer.creditLimit
    : false;

  if (paymentMode === 'CASH') {
    return (
      <div className="space-y-3 pt-1 font-sans">
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">Cash Tendered (₹)</label>
          <input
            type="number"
            min={0}
            value={cashTendered || ''}
            onChange={(e) => onCashTenderedChange(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-md border border-zinc-300 font-mono font-bold text-base text-zinc-950 focus:border-primary-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={onSetExact}
            className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold border border-zinc-200 cursor-pointer"
          >
            Exact (₹{grandTotal})
          </button>
          <button
            type="button"
            onClick={() => onAddCash(100)}
            className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold border border-zinc-200 cursor-pointer"
          >
            +₹100
          </button>
          <button
            type="button"
            onClick={() => onAddCash(500)}
            className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold border border-zinc-200 cursor-pointer"
          >
            +₹500
          </button>
          <button
            type="button"
            onClick={() => onAddCash(2000)}
            className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold border border-zinc-200 cursor-pointer"
          >
            +₹2,000
          </button>
        </div>

        <div className="p-3 rounded-md bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-700">Change Return to Customer:</span>
          <span className={`font-mono font-bold text-sm ${changeDue > 0 ? 'text-emerald-600' : 'text-zinc-600'}`}>
            ₹{changeDue.toFixed(2)}
          </span>
        </div>
      </div>
    );
  }

  if (paymentMode === 'UPI') {
    return (
      <div className="p-4 rounded-md bg-zinc-50 border border-zinc-200 text-center space-y-2 font-sans">
        <div className="w-24 h-24 mx-auto bg-white border border-zinc-300 rounded-md p-1.5 flex items-center justify-center">
          <QrCode className="w-20 h-20 text-zinc-950" />
        </div>
        <p className="font-mono text-xs font-bold text-zinc-900">vendora.store@upi</p>
        <p className="text-[11px] text-zinc-500">
          Customer scans dynamic QR with PhonePe, Google Pay, or Paytm.
        </p>
      </div>
    );
  }

  if (paymentMode === 'CARD') {
    return (
      <div className="p-4 rounded-md bg-zinc-50 border border-zinc-200 space-y-2 text-xs font-sans">
        <div className="flex items-center justify-between font-semibold text-zinc-700">
          <span>POS EDC Terminal:</span>
          <span className="font-mono text-zinc-950 font-bold">READY (PinPad #01)</span>
        </div>
        <p className="text-zinc-500 text-[11px]">
          Insert or tap Visa, Mastercard, or RuPay on the counter EDC card reader.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-md bg-amber-50/60 border border-amber-200 text-xs space-y-2 font-sans">
      {!selectedCustomer ? (
        <div className="flex items-start gap-2 text-amber-800">
          <WarningCircle weight="bold" className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Customer Selection Required</strong>: Select a customer above to bill on Khata / Udhar credit.
          </span>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="font-bold text-zinc-900">Khata Credit Sale for {selectedCustomer.name}</div>
          <div className="grid grid-cols-3 gap-2 font-mono text-[11px] pt-1">
            <div className="bg-white p-2 rounded-md border border-amber-200">
              <span className="text-zinc-500 block">Credit Limit</span>
              <span className="font-bold text-zinc-900">₹{selectedCustomer.creditLimit.toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-white p-2 rounded-md border border-amber-200">
              <span className="text-zinc-500 block">Current Dues</span>
              <span className="font-bold text-red-600">₹{selectedCustomer.currentCreditBalance.toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-white p-2 rounded-md border border-amber-200">
              <span className="text-zinc-500 block">Available</span>
              <span className="font-bold text-emerald-600">₹{availableCredit.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="pt-1 text-[11px] text-zinc-600">
            New Khata Balance after this bill:{' '}
            <strong className="text-zinc-950 font-mono">
              ₹{(selectedCustomer.currentCreditBalance + grandTotal).toLocaleString('en-IN')}
            </strong>
          </div>

          {isCreditExceeded && (
            <div className="flex items-start gap-2 text-[11px] text-red-700 font-semibold">
              <WarningCircle weight="bold" className="w-4 h-4 shrink-0" />
              <span>
                Credit limit exceeded: this bill would take the khata balance above the limit of ₹
                {selectedCustomer.creditLimit.toLocaleString('en-IN')}. Collect payment by another mode or record a
                repayment first.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

