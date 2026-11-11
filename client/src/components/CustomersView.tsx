import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  UsersThree,
  UserPlus,
  MagnifyingGlass,
  HandCoins,
  Receipt,
  WhatsappLogo,
  ArrowClockwise,
  X,
  Phone,
  CurrencyInr,
  BookOpen,
} from '@phosphor-icons/react';
import type { CustomerItem, CustomerStatementItem } from '../types/pos.types';

const API_BASE = 'http://localhost:5000/api/v1';

interface CustomersViewProps {
  tenantId?: string;
  authToken: string | null;
  shopName: string;
}

export function CustomersView({ tenantId, authToken, shopName }: CustomersViewProps) {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Add Customer Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newGstin, setNewGstin] = useState('');
  const [newCreditLimit, setNewCreditLimit] = useState(5000);
  const [addError, setAddError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Record Repayment Modal State
  const [selectedCustomerForPay, setSelectedCustomerForPay] = useState<CustomerItem | null>(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayMode, setRepayMode] = useState<'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER'>('UPI');
  const [repayRef, setRepayRef] = useState('');
  const [repayError, setRepayError] = useState('');
  const [isRepaying, setIsRepaying] = useState(false);

  // Statement / Passbook Modal State
  const [selectedCustomerForStatement, setSelectedCustomerForStatement] = useState<CustomerItem | null>(null);
  const [statement, setStatement] = useState<CustomerStatementItem[]>([]);
  const [loadingStatement, setLoadingStatement] = useState(false);

  const fetchCustomers = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/customers?tenantId=${tenantId}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      if (Array.isArray(res.data?.data)) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, authToken]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Open statement modal and fetch double-entry ledger
  const openStatementModal = async (customer: CustomerItem) => {
    setSelectedCustomerForStatement(customer);
    setLoadingStatement(true);
    try {
      const res = await axios.get(
        `${API_BASE}/customers/${customer.id}/statement?tenantId=${tenantId}`,
        { headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} }
      );
      if (Array.isArray(res.data?.data)) {
        setStatement(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load customer statement:', err);
    } finally {
      setLoadingStatement(false);
    }
  };

  // Handle Add Customer
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!newName.trim() || !newPhone.trim()) {
      setAddError('Customer Name and Phone number are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}/customers`,
        {
          tenantId,
          name: newName.trim(),
          phone: newPhone.trim(),
          email: newEmail.trim() || undefined,
          gstin: newGstin.trim() || undefined,
          creditLimit: Number(newCreditLimit) || 5000,
        },
        { headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} }
      );

      setIsAddModalOpen(false);
      setNewName('');
      setNewPhone('');
      setNewEmail('');
      setNewGstin('');
      fetchCustomers();
    } catch (err: any) {
      setAddError(err.response?.data?.message || 'Failed to create customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Khata Repayment
  const handleRecordRepayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForPay) return;
    const amount = Number(repayAmount);
    if (!amount || amount <= 0) {
      setRepayError('Enter a valid payment amount greater than zero.');
      return;
    }

    setIsRepaying(true);
    setRepayError('');
    try {
      await axios.post(
        `${API_BASE}/customers/${selectedCustomerForPay.id}/payment?tenantId=${tenantId}`,
        {
          amount,
          paymentMode: repayMode,
          referenceNumber: repayRef.trim() || undefined,
        },
        { headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} }
      );

      setSelectedCustomerForPay(null);
      setRepayAmount('');
      setRepayRef('');
      fetchCustomers();
    } catch (err: any) {
      setRepayError(err.response?.data?.message || 'Failed to record repayment');
    } finally {
      setIsRepaying(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.gstin && c.gstin.toLowerCase().includes(search.toLowerCase()))
  );

  const totalOutstandingKhata = customers.reduce((sum, c) => sum + c.currentCreditBalance, 0);
  const totalLifetimeSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const customersWithDues = customers.filter((c) => c.currentCreditBalance > 0).length;

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 overflow-hidden p-4 sm:p-6 select-none font-sans">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2">
            <UsersThree className="w-5 h-5 text-red-600" />
            <span>Customers & Khata (Udhar) Ledger</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage customer credit limits, track outstanding balances, and send WhatsApp payment reminders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCustomers}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-zinc-300 hover:border-zinc-400 text-zinc-700 text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
          >
            <ArrowClockwise className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            <UserPlus weight="bold" className="w-3.5 h-3.5" />
            <span>New Customer</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-white p-3.5 rounded-md border border-zinc-200">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-semibold mb-1">
            <span>Total Outstanding Khata</span>
            <HandCoins className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black font-mono text-red-600">
            ₹{totalOutstandingKhata.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">
            {customersWithDues} {customersWithDues === 1 ? 'customer has' : 'customers have'} pending dues
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-md border border-zinc-200">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-semibold mb-1">
            <span>Customer Lifetime Purchases</span>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black font-mono text-zinc-950">
            ₹{totalLifetimeSpent.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Across {customers.length} registered customers</div>
        </div>

        <div className="bg-white p-3.5 rounded-md border border-zinc-200">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-semibold mb-1">
            <span>Registered Customers</span>
            <UsersThree className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-xl font-black font-mono text-zinc-950">{customers.length}</div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Active retail loyalty & Khata accounts</div>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3 rounded-md border border-zinc-200 mb-4 relative">
        <MagnifyingGlass className="w-4 h-4 text-zinc-400 absolute left-6 top-5.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers by name, phone (e.g. 9840...), or GSTIN..."
          className="w-full pl-9 pr-3 py-1.5 rounded-md border border-zinc-200 text-xs text-zinc-900 focus:border-red-600 outline-none"
        />
      </div>

      {/* Customers Table */}
      <div className="flex-1 bg-white rounded-md border border-zinc-200 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-zinc-100 sticky top-0 border-b border-zinc-200 text-zinc-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Customer Name</th>
                <th className="py-2.5 px-4">Mobile / Contact</th>
                <th className="py-2.5 px-4">Credit Limit</th>
                <th className="py-2.5 px-4">Khata Balance</th>
                <th className="py-2.5 px-4">Lifetime Spent</th>
                <th className="py-2.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredCustomers.map((c) => {
                const limitPct = Math.min(100, Math.round((c.currentCreditBalance / (c.creditLimit || 1)) * 100));
                const waMessage = encodeURIComponent(
                  `Namaste ${c.name}, this is a gentle reminder from ${shopName}. Your outstanding Khata balance is Rs. ${c.currentCreditBalance.toLocaleString('en-IN')}. Please settle at your convenience. Thank you!`
                );
                return (
                  <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-950">{c.name}</div>
                      {c.gstin && (
                        <div className="font-mono text-[10px] text-zinc-400">GST: {c.gstin}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-zinc-700">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{c.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-700">
                      ₹{c.creditLimit.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-black ${
                            c.currentCreditBalance > 0 ? 'text-red-600' : 'text-emerald-600'
                          }`}
                        >
                          ₹{c.currentCreditBalance.toLocaleString('en-IN')}
                        </span>
                        {c.currentCreditBalance > 0 && (
                          <span className="text-[10px] text-zinc-400 font-mono">({limitPct}% limit)</span>
                        )}
                      </div>
                      {c.currentCreditBalance > 0 && (
                        <div className="w-24 h-1.5 bg-zinc-200 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full ${limitPct > 80 ? 'bg-red-600' : 'bg-amber-500'}`}
                            style={{ width: `${limitPct}%` }}
                          />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-900">
                      <div>₹{c.totalSpent.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-zinc-400">{c.totalPurchasesCount} orders</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Repay Button */}
                        <button
                          onClick={() => {
                            setSelectedCustomerForPay(c);
                            setRepayAmount(String(c.currentCreditBalance || ''));
                          }}
                          className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-emerald-600 hover:text-white text-zinc-700 font-semibold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                          title="Record Khata Payment"
                        >
                          <CurrencyInr weight="bold" className="w-3 h-3" />
                          <span>Repay</span>
                        </button>

                        {/* Statement Passbook Button */}
                        <button
                          onClick={() => openStatementModal(c)}
                          className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-800 hover:text-white text-zinc-700 font-semibold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                          title="View Statement Ledger"
                        >
                          <BookOpen weight="bold" className="w-3 h-3" />
                          <span>Passbook</span>
                        </button>

                        {/* WhatsApp Reminder Button */}
                        {c.currentCreditBalance > 0 && (
                          <a
                            href={`https://wa.me/91${c.phone}?text=${waMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded-md bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                            title="Send WhatsApp Reminder"
                          >
                            <WhatsappLogo weight="fill" className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCustomers.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400 text-xs">
                    <UsersThree className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="font-semibold text-zinc-600">No customers found.</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Click "New Customer" above to add customer profiles.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-zinc-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-sm text-zinc-950 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-red-600" />
                <span>Add Customer Profile</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addError && (
              <div className="p-2 rounded-md bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Arun Kumar"
                  className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Mobile Number (10 digits) *</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. 9840123456"
                  className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="arun@gmail.com"
                    className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">GSTIN (Optional)</label>
                  <input
                    type="text"
                    value={newGstin}
                    onChange={(e) => setNewGstin(e.target.value.toUpperCase())}
                    placeholder="33AAAAA..."
                    className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none font-mono uppercase"
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
                  value={newCreditLimit}
                  onChange={(e) => setNewCreditLimit(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Repayment Modal */}
      {selectedCustomerForPay && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-zinc-200 w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-sm text-zinc-950 flex items-center gap-2">
                <CurrencyInr className="w-4 h-4 text-emerald-600" />
                <span>Record Khata Repayment</span>
              </h3>
              <button
                onClick={() => setSelectedCustomerForPay(null)}
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-zinc-50 rounded-md border border-zinc-200 text-xs">
              <div className="font-bold text-zinc-900">{selectedCustomerForPay.name}</div>
              <div className="text-zinc-500 font-mono text-[11px]">{selectedCustomerForPay.phone}</div>
              <div className="mt-1.5 pt-1.5 border-t border-zinc-200 flex justify-between items-center">
                <span className="text-zinc-500">Current Outstanding:</span>
                <span className="font-mono font-black text-red-600">
                  ₹{selectedCustomerForPay.currentCreditBalance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {repayError && (
              <div className="p-2 rounded-md bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
                {repayError}
              </div>
            )}

            <form onSubmit={handleRecordRepayment} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Repayment Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedCustomerForPay.currentCreditBalance}
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Payment Mode</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['CASH', 'UPI', 'CARD'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setRepayMode(mode)}
                      className={`py-1.5 rounded-md text-xs font-bold border transition-all cursor-pointer ${
                        repayMode === mode
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Payment Reference (Optional)</label>
                <input
                  type="text"
                  value={repayRef}
                  onChange={(e) => setRepayRef(e.target.value)}
                  placeholder="UPI UTR, receipt # or note"
                  className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomerForPay(null)}
                  className="px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRepaying}
                  className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isRepaying ? 'Processing...' : 'Confirm Repayment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Passbook / Ledger Statement Modal */}
      {selectedCustomerForStatement && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-zinc-200 w-full max-w-xl p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-zinc-950 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-red-600" />
                  <span>Khata Passbook: {selectedCustomerForStatement.name}</span>
                </h3>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  Mobile: {selectedCustomerForStatement.phone} | Outstanding Dues: ₹
                  {selectedCustomerForStatement.currentCreditBalance.toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomerForStatement(null)}
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto border border-zinc-200 rounded-md">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-zinc-100 sticky top-0 border-b border-zinc-200 text-[10px] font-bold uppercase text-zinc-600">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Transaction</th>
                    <th className="py-2 px-3">Ref ID</th>
                    <th className="py-2 px-3 text-right">Debit (+)</th>
                    <th className="py-2 px-3 text-right">Credit (-)</th>
                    <th className="py-2 px-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-mono text-[11px]">
                  {statement.map((st) => (
                    <tr key={st.id} className="hover:bg-zinc-50">
                      <td className="py-2 px-3 text-zinc-500">
                        {new Date(st.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-2 px-3 font-sans font-semibold">
                        {st.transactionType === 'DEBIT_SALE' ? (
                          <span className="text-red-600">Khata Purchase</span>
                        ) : (
                          <span className="text-emerald-600">Repayment ({st.paymentMode || 'Cash'})</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-zinc-500">{st.referenceId}</td>
                      <td className="py-2 px-3 text-right font-bold text-red-600">
                        {st.transactionType === 'DEBIT_SALE' ? `₹${st.amount.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-600">
                        {st.transactionType === 'CREDIT_PAYMENT' ? `₹${st.amount.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-zinc-950">
                        ₹{st.balanceAfter.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}

                  {statement.length === 0 && !loadingStatement && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-400 text-xs font-sans">
                        No transactions recorded in passbook yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                onClick={() => setSelectedCustomerForStatement(null)}
                className="px-4 py-1.5 rounded-md bg-zinc-900 text-white font-semibold text-xs cursor-pointer"
              >
                Close Passbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
