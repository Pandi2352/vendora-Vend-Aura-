import { useState, useEffect } from 'react';
import { api, getErrorMessage } from '../../lib/api';
import { CurrencyInr, X } from '@phosphor-icons/react';
import type { SupplierItem } from '../../types/pos.types';

interface SettleDuesModalProps {
  supplier: SupplierItem | null;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export function SettleDuesModal({
  supplier,
  onClose,
  onPaymentSuccess,
}: SettleDuesModalProps) {
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState<'CASH' | 'UPI' | 'BANK_TRANSFER'>('BANK_TRANSFER');
  const [payRef, setPayRef] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supplier) {
      setPayAmount(String(supplier.balanceDue || ''));
      setPayRef('');
      setError('');
    }
  }, [supplier]);

  if (!supplier) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post(`/suppliers/${supplier.id}/pay`, {
        amount,
        paymentMode: payMode,
        referenceNumber: payRef.trim() || undefined,
      });

      onPaymentSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to record supplier payment'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-md border border-zinc-200 w-full max-w-sm p-5 space-y-4 font-sans">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h3 className="font-bold text-sm text-zinc-950 flex items-center gap-2">
            <CurrencyInr className="w-4 h-4 text-emerald-600" />
            <span>Pay Supplier Dues</span>
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-zinc-50 rounded-md border border-zinc-200 text-xs">
          <div className="font-bold text-zinc-900">{supplier.name}</div>
          <div className="text-zinc-500 font-mono text-[11px]">{supplier.phone}</div>
          <div className="mt-1.5 pt-1.5 border-t border-zinc-200 flex justify-between items-center">
            <span className="text-zinc-500">Balance Owed:</span>
            <span className="font-mono font-black text-red-600">
              ₹{supplier.balanceDue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-2 rounded-md bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-zinc-700 block mb-1">Amount to Pay (₹) *</label>
            <input
              type="number"
              required
              min="1"
              max={supplier.balanceDue}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none font-mono text-sm font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-zinc-700 block mb-1">Payment Method</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['BANK_TRANSFER', 'UPI', 'CASH'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPayMode(mode)}
                  className={`py-1.5 rounded-md text-[11px] font-bold border transition-all cursor-pointer ${
                    payMode === mode
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  {mode === 'BANK_TRANSFER' ? 'BANK' : mode}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold text-zinc-700 block mb-1">UTR / Reference #</label>
            <input
              type="text"
              value={payRef}
              onChange={(e) => setPayRef(e.target.value)}
              placeholder="e.g. UTR #, Cheque #, IMPS ref"
              className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

