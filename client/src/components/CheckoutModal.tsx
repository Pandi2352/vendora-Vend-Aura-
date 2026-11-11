import { useState } from 'react';
import {
  X,
  Money,
  DeviceMobile,
  CreditCard,
  CheckCircle,
  QrCode,
} from '@phosphor-icons/react';

interface CheckoutModalProps {
  grandTotal: number;
  isOpen: boolean;
  onClose: () => void;
  onFinalize: (paymentMode: 'CASH' | 'UPI' | 'CARD', cashTendered: number) => void;
}

export function CheckoutModal({
  grandTotal,
  isOpen,
  onClose,
  onFinalize,
}: CheckoutModalProps) {
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');
  const [cashTendered, setCashTendered] = useState<number>(grandTotal);

  if (!isOpen) return null;

  const changeDue = Math.max(0, cashTendered - grandTotal);

  const addCash = (amount: number) => {
    setCashTendered((prev) => prev + amount);
  };

  const setExact = () => {
    setCashTendered(grandTotal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-md border border-zinc-300 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-zinc-950">Payment Tender</h3>
            <p className="text-[11px] text-zinc-500">Select payment method & complete sale</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-zinc-200 hover:bg-zinc-300 text-zinc-700 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Amount Due Banner */}
          <div className="p-3.5 rounded-md bg-zinc-950 text-white text-center">
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">
              Total Amount Due
            </span>
            <span className="font-mono font-black text-2xl text-red-500 mt-0.5 block">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Payment Mode Selector Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'CASH', label: 'Cash', icon: Money },
              { id: 'UPI', label: 'UPI / QR', icon: DeviceMobile },
              { id: 'CARD', label: 'Card Swipe', icon: CreditCard },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = paymentMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setPaymentMode(tab.id as any)}
                  className={`p-2.5 rounded-md border flex flex-col items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <Icon weight="bold" className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* CASH MODE CONTROLS */}
          {paymentMode === 'CASH' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Cash Tendered (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={cashTendered || ''}
                  onChange={(e) => setCashTendered(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-md border border-zinc-300 font-mono font-bold text-base text-zinc-950 focus:border-red-600 outline-none"
                />
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={setExact}
                  className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold border border-zinc-200 cursor-pointer"
                >
                  Exact (₹{grandTotal})
                </button>
                <button
                  type="button"
                  onClick={() => addCash(100)}
                  className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold border border-zinc-200 cursor-pointer"
                >
                  +₹100
                </button>
                <button
                  type="button"
                  onClick={() => addCash(500)}
                  className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold border border-zinc-200 cursor-pointer"
                >
                  +₹500
                </button>
                <button
                  type="button"
                  onClick={() => addCash(2000)}
                  className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold border border-zinc-200 cursor-pointer"
                >
                  +₹2,000
                </button>
              </div>

              {/* Change Due Display */}
              <div className="p-3 rounded-md bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-700">Change Return to Customer:</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    changeDue > 0 ? 'text-emerald-600' : 'text-zinc-600'
                  }`}
                >
                  ₹{changeDue.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* UPI MODE PREVIEW */}
          {paymentMode === 'UPI' && (
            <div className="p-4 rounded-md bg-zinc-50 border border-zinc-200 text-center space-y-2">
              <div className="w-28 h-28 mx-auto bg-white border border-zinc-300 rounded-md p-2 flex items-center justify-center">
                <QrCode className="w-24 h-24 text-zinc-950" />
              </div>
              <p className="font-mono text-xs font-bold text-zinc-900">vendora.store@upi</p>
              <p className="text-[11px] text-zinc-500">
                Customer scans with PhonePe, Google Pay, or Paytm.
              </p>
            </div>
          )}

          {/* CARD MODE PREVIEW */}
          {paymentMode === 'CARD' && (
            <div className="p-4 rounded-md bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold text-zinc-700">
                <span>POS EDC Terminal:</span>
                <span className="font-mono text-zinc-950 font-bold">READY (PinPad #01)</span>
              </div>
              <p className="text-zinc-500 text-[11px]">
                Insert or tap Visa, Mastercard, or RuPay on the EDC counter machine.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-md bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onFinalize(paymentMode, paymentMode === 'CASH' ? cashTendered : grandTotal)}
            disabled={paymentMode === 'CASH' && cashTendered < grandTotal}
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
          >
            <CheckCircle weight="bold" className="w-4 h-4" />
            <span>Complete & Print Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
}

