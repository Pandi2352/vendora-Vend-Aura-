import { useState, useEffect } from 'react';
import { X, UserPlus } from '@phosphor-icons/react';
import { api, getErrorMessage } from '../../lib/api';
import type { StaffRole } from '@/types/user.types';

interface OutletOption {
  _id: string;
  name: string;
  code: string;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddUserModal({ isOpen, onClose, onSuccess }: AddUserModalProps) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<StaffRole>('CASHIER');
  const [password, setPassword] = useState('');
  const [selectedOutletIds, setSelectedOutletIds] = useState<string[]>([]);
  const [outlets, setOutlets] = useState<OutletOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setFullName('');
    setUsername('');
    setEmail('');
    setPhone('');
    setRole('CASHIER');
    setPassword('');
    setError('');

    api
      .get('/outlets')
      .then((res) => {
        const list = res.data?.data || [];
        setOutlets(list);
        if (list.length > 0) setSelectedOutletIds([list[0]._id]);
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      await api.post('/users', {
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        role,
        password,
        outletIds: selectedOutletIds,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to add staff member'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs">
      <div className="bg-white rounded-md shadow-xl border border-zinc-200 w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-zinc-900 text-white flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Add Staff Member</h2>
              <p className="text-xs text-zinc-500">Create login credentials for store staff</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="user-fullname" className="block text-xs font-medium text-zinc-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="user-fullname"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Babu"
              className="w-full text-sm rounded-md border border-zinc-300 px-3 py-2 focus:ring-1 focus:ring-zinc-900 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="user-username" className="block text-xs font-medium text-zinc-700 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="user-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="ramesh_cashier"
                className="w-full text-sm rounded-md border border-zinc-300 px-3 py-2 font-mono focus:ring-1 focus:ring-zinc-900 focus:outline-hidden"
              />
            </div>
            <div>
              <label htmlFor="user-role" className="block text-xs font-medium text-zinc-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="user-role"
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                className="w-full text-sm rounded-md border border-zinc-300 px-3 py-2 bg-white focus:ring-1 focus:ring-zinc-900 focus:outline-hidden"
              >
                <option value="CASHIER">Cashier</option>
                <option value="STORE_MANAGER">Store Manager</option>
                <option value="ACCOUNTANT">Accountant</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="user-email" className="block text-xs font-medium text-zinc-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="user-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@store.com"
                className="w-full text-sm rounded-md border border-zinc-300 px-3 py-2 focus:ring-1 focus:ring-zinc-900 focus:outline-hidden"
              />
            </div>
            <div>
              <label htmlFor="user-phone" className="block text-xs font-medium text-zinc-700 mb-1">Phone Number</label>
              <input
                id="user-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full text-sm rounded-md border border-zinc-300 px-3 py-2 focus:ring-1 focus:ring-zinc-900 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label htmlFor="user-password" className="block text-xs font-medium text-zinc-700 mb-1">
              Temporary Password <span className="text-red-500">*</span>
            </label>
            <input
              id="user-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full text-sm rounded-md border border-zinc-300 px-3 py-2 focus:ring-1 focus:ring-zinc-900 focus:outline-hidden"
            />
            <p className="text-[11px] text-zinc-500 mt-1">User will be required to change password on first login.</p>
          </div>

          {outlets.length > 0 && (
            <div>
              <label htmlFor="user-outlet" className="block text-xs font-medium text-zinc-700 mb-1">Assigned Branch</label>
              <select
                id="user-outlet"
                value={selectedOutletIds[0] || ''}
                onChange={(e) => setSelectedOutletIds([e.target.value])}
                className="w-full text-sm rounded-md border border-zinc-300 px-3 py-2 bg-white focus:ring-1 focus:ring-zinc-900 focus:outline-hidden"
              >
                {outlets.map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.name} ({o.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-md hover:bg-zinc-800 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
