import { useState } from 'react';
import axios from 'axios';
import { Truck, X } from '@phosphor-icons/react';

const API_BASE = 'http://localhost:5000/api/v1';

interface AddSupplierModalProps {
  tenantId?: string;
  authToken: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSupplierAdded: () => void;
}

export function AddSupplierModal({
  tenantId,
  authToken,
  isOpen,
  onClose,
  onSupplierAdded,
}: AddSupplierModalProps) {
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [category, setCategory] = useState('General FMCG');
  const [creditDays, setCreditDays] = useState(30);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Supplier name and phone are required.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await axios.post(
        `${API_BASE}/suppliers`,
        {
          tenantId,
          name: name.trim(),
          contactPerson: contactPerson.trim() || undefined,
          phone: phone.trim(),
          email: email.trim() || undefined,
          gstin: gstin.trim() || undefined,
          category,
          creditDays: Number(creditDays) || 30,
        },
        { headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} }
      );

      onSupplierAdded();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register supplier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-md border border-zinc-200 w-full max-w-md p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h3 className="font-bold text-sm text-zinc-950 flex items-center gap-2">
            <Truck className="w-4 h-4 text-red-600" />
            <span>Register Supplier / Distributor</span>
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
            <label className="font-semibold text-zinc-700 block mb-1">Company / Firm Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sri Meenakshi Traders"
              className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Contact Person</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Murugan K"
                className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98401 22334"
                className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="orders@supplier.in"
                className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">GSTIN</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="33AAAAA..."
                className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. FMCG, Dairy, Spices"
                className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-zinc-700 block mb-1">Credit Days</label>
              <input
                type="number"
                min="0"
                value={creditDays}
                onChange={(e) => setCreditDays(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none font-mono"
              />
            </div>
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
              className="px-4 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Register Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

