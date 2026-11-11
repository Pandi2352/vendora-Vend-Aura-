import { useState } from 'react';
import { api, getErrorMessage } from '../../lib/api';
import { UserPlus, X } from '@phosphor-icons/react';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerAdded: () => void;
}

export function AddCustomerModal({
  isOpen,
  onClose,
  onCustomerAdded,
}: AddCustomerModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [creditLimit, setCreditLimit] = useState(5000);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !phone.trim()) {
      setError('Customer Name and Phone number are required.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/customers`, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        gstin: gstin.trim() || undefined,
        creditLimit: Number(creditLimit) || 5000,
      });

      setName('');
      setPhone('');
      setEmail('');
      setGstin('');
      onCustomerAdded();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create customer'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-md border border-zinc-200 w-full max-w-md p-5 space-y-4 font-sans">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h3 className="font-bold text-sm text-zinc-950 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary-600" />
            <span>Add Customer Profile</span>
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2 rounded-md bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-zinc-700 block mb-1">Customer Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arun Kumar"
              className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-primary-600 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-zinc-700 block mb-1">Mobile Number (10 digits) *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9840123456"
              className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-primary-600 outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Email (Optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arun@gmail.com"
                className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-primary-600 outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">GSTIN (Optional)</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="33AAAAA..."
                className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-primary-600 outline-none font-mono uppercase"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-zinc-700 block mb-1">
              Credit Limit (Max Udhar allowed ₹)
            </label>
            <input
              type="number"
              min="0"
              step="500"
              value={creditLimit}
              onChange={(e) => setCreditLimit(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-primary-600 outline-none font-mono"
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
              className="px-4 py-1.5 rounded-md bg-primary-600 hover:bg-primary-700 text-white font-semibold cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

