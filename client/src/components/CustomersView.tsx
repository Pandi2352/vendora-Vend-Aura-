import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { UsersThree, UserPlus, MagnifyingGlass, ArrowClockwise } from '@phosphor-icons/react';
import type { CustomerItem, CustomerStatementItem } from '../types/pos.types';
import { CustomersKpiStrip } from './customers/CustomersKpiStrip';
import { CustomersTable } from './customers/CustomersTable';
import { AddCustomerModal } from './customers/AddCustomerModal';
import { RecordRepaymentModal } from './customers/RecordRepaymentModal';
import { PassbookModal } from './customers/PassbookModal';

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

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomerForPay, setSelectedCustomerForPay] = useState<CustomerItem | null>(null);
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-zinc-300 hover:border-zinc-400 text-zinc-700 text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            <ArrowClockwise className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
          >
            <UserPlus weight="bold" className="w-3.5 h-3.5" />
            <span>New Customer</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <CustomersKpiStrip
        totalOutstandingKhata={totalOutstandingKhata}
        totalLifetimeSpent={totalLifetimeSpent}
        customersWithDues={customersWithDues}
        customersCount={customers.length}
      />

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
          <CustomersTable
            customers={filteredCustomers}
            loading={loading}
            shopName={shopName}
            onRepay={(c) => setSelectedCustomerForPay(c)}
            onOpenStatement={openStatementModal}
          />
        </div>
      </div>

      {/* Modals */}
      <AddCustomerModal
        tenantId={tenantId}
        authToken={authToken}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCustomerAdded={fetchCustomers}
      />

      <RecordRepaymentModal
        tenantId={tenantId}
        authToken={authToken}
        customer={selectedCustomerForPay}
        onClose={() => setSelectedCustomerForPay(null)}
        onRepaymentSuccess={fetchCustomers}
      />

      <PassbookModal
        customer={selectedCustomerForStatement}
        statement={statement}
        loadingStatement={loadingStatement}
        onClose={() => setSelectedCustomerForStatement(null)}
      />
    </div>
  );
}
