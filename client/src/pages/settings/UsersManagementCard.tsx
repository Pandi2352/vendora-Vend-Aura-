import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  ArrowClockwise,
  CheckCircle,
  XCircle,
  Key,
  Trash,
  ShieldCheck,
} from '@phosphor-icons/react';
import { api, unwrap, getErrorMessage } from '../../lib/api';
import type { StaffUser } from '@/types/user.types';
import { AddUserModal } from './AddUserModal';
import { formatDate } from '@/utils';

export function UsersManagementCard() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.get('/users');
      const list = unwrap<StaffUser[]>(res) || [];
      setUsers(list);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load staff list'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleActive = async (u: StaffUser) => {
    try {
      await api.patch(`/users/${u.id}`, { isActive: !u.isActive });
      fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update user status'));
    }
  };

  const handleResetPassword = async (e: React.FormEvent, userId: string) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) return;
    try {
      const res = await api.post(`/users/${userId}/reset-password`, { newPassword });
      setResetMessage(res.data?.message || 'Password reset successfully');
      setResettingUserId(null);
      setNewPassword('');
      setTimeout(() => setResetMessage(''), 4000);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to reset password'));
    }
  };

  const handleDelete = async (u: StaffUser) => {
    if (!window.confirm(`Are you sure you want to remove staff member ${u.fullName} (@${u.username})?`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete user'));
    }
  };

  const totalUsers = users.length;
  const totalManagers = users.filter((u) => u.role === 'STORE_MANAGER').length;
  const totalCashiers = users.filter((u) => u.role === 'CASHIER').length;
  const activeCount = users.filter((u) => u.isActive).length;

  return (
    <div className="bg-white rounded-md border border-zinc-200 shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-zinc-900" />
            <h2 className="text-base font-semibold text-zinc-900">Staff & Cashier Accounts</h2>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Manage store team members, roles, and terminal access</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchUsers}
            disabled={isLoading}
            className="p-2 text-zinc-500 hover:text-zinc-900 rounded-md border border-zinc-200 hover:bg-zinc-50"
            title="Refresh"
          >
            <ArrowClockwise className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-zinc-900 rounded-md hover:bg-zinc-800"
          >
            <UserPlus className="w-4 h-4" />
            Add Staff Member
          </button>
        </div>
      </div>

      {resetMessage && (
        <div className="m-4 p-3 bg-emerald-50 text-emerald-800 text-xs rounded-md border border-emerald-200">
          {resetMessage}
        </div>
      )}
      {error && (
        <div className="m-4 p-3 bg-red-50 text-red-700 text-xs rounded-md border border-red-200">{error}</div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-zinc-50/50 border-b border-zinc-200">
        <div className="p-3 bg-white rounded-md border border-zinc-200">
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Total Staff</p>
          <p className="text-xl font-bold text-zinc-900 mt-0.5">{totalUsers}</p>
        </div>
        <div className="p-3 bg-white rounded-md border border-zinc-200">
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Store Managers</p>
          <p className="text-xl font-bold text-zinc-900 mt-0.5">{totalManagers}</p>
        </div>
        <div className="p-3 bg-white rounded-md border border-zinc-200">
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Cashiers</p>
          <p className="text-xl font-bold text-zinc-900 mt-0.5">{totalCashiers}</p>
        </div>
        <div className="p-3 bg-white rounded-md border border-zinc-200">
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Active Status</p>
          <p className="text-xl font-bold text-emerald-600 mt-0.5">
            {activeCount} / {totalUsers}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-100 text-zinc-600 font-semibold uppercase tracking-wider border-b border-zinc-200">
            <tr>
              <th className="px-4 py-3">User & Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Branch Outlet</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-zinc-700">
            {users.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  No staff members registered yet.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-zinc-900 text-sm">{u.fullName}</div>
                    <div className="text-[11px] text-zinc-500 font-mono">@{u.username}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        u.role === 'OWNER'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'STORE_MANAGER'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-zinc-100 text-zinc-800'
                      }`}
                    >
                      {u.role === 'OWNER' && <ShieldCheck className="w-3 h-3" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.outletIds && u.outletIds.length > 0 ? (
                      <span className="text-zinc-800 font-medium">{u.outletIds.map((o) => o.name).join(', ')}</span>
                    ) : (
                      <span className="text-zinc-400">All Outlets</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div>{u.email}</div>
                    {u.phone && <div className="text-zinc-500 font-mono">{u.phone}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => u.role !== 'OWNER' && handleToggleActive(u)}
                      disabled={u.role === 'OWNER'}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      {u.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {u.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setResettingUserId(u.id)}
                        className="p-1 text-zinc-500 hover:text-zinc-900 rounded-md hover:bg-zinc-100"
                        title="Reset Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      {u.role !== 'OWNER' && (
                        <button
                          type="button"
                          onClick={() => handleDelete(u)}
                          className="p-1 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50"
                          title="Delete Staff"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Password Reset Dialog */}
      {resettingUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50">
          <div className="bg-white rounded-md shadow-xl border border-zinc-200 w-full max-w-sm p-4">
            <h3 className="text-sm font-semibold text-zinc-900 mb-1">Set New Temporary Password</h3>
            <p className="text-xs text-zinc-500 mb-3">User will be required to change this upon login.</p>
            <form onSubmit={(e) => handleResetPassword(e, resettingUserId)} className="space-y-3">
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 8 chars)"
                className="w-full text-xs rounded-md border border-zinc-300 px-3 py-2 focus:ring-1 focus:ring-zinc-900 focus:outline-hidden"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setResettingUserId(null);
                    setNewPassword('');
                  }}
                  className="px-3 py-1.5 text-xs text-zinc-600 border border-zinc-200 rounded-md hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-zinc-900 rounded-md hover:bg-zinc-800"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
}

