import { useState } from 'react';
import { X, Wallet, Check } from '@phosphor-icons/react';
import { api } from '../../lib/api';
import { Spinner } from '../ui/Spinner';

interface RecordExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  outletId: string;
}

const CATEGORIES = [
  { value: 'RENT', label: 'Store Rent (5020)' },
  { value: 'UTILITIES', label: 'Utilities & Power (5021)' },
  { value: 'SALARIES', label: 'Staff Salaries & Wages (5022)' },
  { value: 'PACKAGING', label: 'Packaging & Supplies (5023)' },
  { value: 'FREIGHT', label: 'Transport & Freight (5024)' },
  { value: 'MAINTENANCE', label: 'Repairs & Maintenance (5025)' },
  { value: 'MARKETING', label: 'Marketing & Promotions (5026)' },
  { value: 'SOFTWARE', label: 'Software & Cloud Services (5027)' },
  { value: 'BANK_FEES', label: 'Bank & Card Charges (5028)' },
  { value: 'OTHER', label: 'Miscellaneous Expenses (5029)' },
];

export function RecordExpenseModal({ isOpen, onClose, onSuccess, outletId }: RecordExpenseModalProps) {
  const [category, setCategory] = useState('RENT');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'BANK' | 'UPI' | 'CARD'>('CASH');
  const [vendorName, setVendorName] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid expense amount greater than 0.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await api.post('/finance/expenses', {
        outletId,
        category,
        amount: numAmount,
        paymentMode,
        vendorName: vendorName.trim(),
        description: description.trim(),
        expenseDate: new Date(expenseDate).toISOString(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not record expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-md max-w-lg w-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-red-50 text-red-600 border border-red-200 flex items-center justify-center">
              <Wallet weight="bold" className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-950">Record Store Expense</h3>
              <p className="text-[11px] text-zinc-500">Auto-posts double-entry transaction to General Ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 font-medium">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-700 font-semibold mb-1">Expense Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-xs bg-white text-zinc-900 font-medium"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-xs font-mono font-bold text-zinc-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-700 font-semibold mb-1">Payment Mode *</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-xs bg-white text-zinc-900 font-medium"
              >
                <option value="CASH">Cash (Draw from Till Cash)</option>
                <option value="UPI">UPI / QR Payment</option>
                <option value="BANK">Bank Account / IMPS</option>
                <option value="CARD">Debit / Credit Card</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">Date *</label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-xs text-zinc-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-700 font-semibold mb-1">Payee / Vendor Name</label>
            <input
              type="text"
              placeholder="e.g. Landlord, State Electricity Board, Cleaner"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md text-xs text-zinc-900"
            />
          </div>

          <div>
            <label className="block text-zinc-700 font-semibold mb-1">Narration / Note</label>
            <textarea
              rows={2}
              placeholder="e.g. Monthly shop rental payment for November"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md text-xs text-zinc-900 resize-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-xs cursor-pointer transition-colors flex items-center gap-1.5"
            >
              {isSubmitting ? <Spinner size="sm" /> : <Check weight="bold" className="w-3.5 h-3.5" />}
              <span>{isSubmitting ? 'Recording…' : 'Record Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

