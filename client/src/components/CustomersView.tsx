import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowClockwise, UserPlus, UsersThree } from '@phosphor-icons/react';
import { api, unwrap, getErrorMessage } from '@/lib/api';
import { Button, Tabs } from '@/components/ui';
import { useToast } from '@/hooks/useToast';
import type { CustomerItem, CustomerStatementItem } from '@/types/pos.types';
import { CustomersKpiStrip } from './customers/CustomersKpiStrip';
import { CustomersTable } from './customers/CustomersTable';
import { AddCustomerModal } from './customers/AddCustomerModal';
import { EditCustomerModal } from './customers/EditCustomerModal';
import { RecordRepaymentModal } from './customers/RecordRepaymentModal';
import { PassbookModal } from './customers/PassbookModal';

type CustomersTab = 'all' | 'khata';

/** Customer list is owned by App (useCatalogCustomers) so checkout sees the same, fresh data. */
interface CustomersViewProps {
  customers: CustomerItem[];
  loading: boolean;
  onRefreshCustomers: () => void;
  shopName: string;
}

export function CustomersView({ customers, loading, onRefreshCustomers, shopName }: CustomersViewProps) {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const currentTab: CustomersTab = rawTab === 'khata' ? 'khata' : 'all';

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<CustomerItem | null>(null);
  const [customerToRepay, setCustomerToRepay] = useState<CustomerItem | null>(null);
  const [statementCustomer, setStatementCustomer] = useState<CustomerItem | null>(null);
  const [statement, setStatement] = useState<CustomerStatementItem[]>([]);
  const [loadingStatement, setLoadingStatement] = useState(false);

  const handleTabChange = (nextTab: CustomersTab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextTab === 'all') {
        next.delete('tab');
      } else {
        next.set('tab', nextTab);
      }
      return next;
    });
  };

  const openStatementModal = async (customer: CustomerItem) => {
    setStatementCustomer(customer);
    setStatement([]);
    setLoadingStatement(true);
    try {
      const list = unwrap<CustomerStatementItem[]>(await api.get(`/customers/${customer.id}/statement`, { params: { limit: 100 } }));
      setStatement(Array.isArray(list) ? list : []);
    } catch (err) {
      setStatementCustomer(null);
      toast.error('Could not load the passbook', getErrorMessage(err, 'Failed to load customer statement.'));
    } finally {
      setLoadingStatement(false);
    }
  };

  const totalOutstandingKhata = customers.reduce((sum, c) => sum + c.currentCreditBalance, 0);
  const totalLifetimeSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const customersWithDues = customers.filter((c) => c.currentCreditBalance > 0).length;

  const displayedCustomers =
    currentTab === 'khata'
      ? customers.filter((c) => c.currentCreditBalance > 0)
      : customers;

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 overflow-y-auto p-4 sm:p-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2">
            <UsersThree aria-hidden className="w-5 h-5 text-primary-600" />
            <span>Customers & Khata (Udhar) Ledger</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage customer credit limits, track outstanding balances, and send WhatsApp payment reminders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={onRefreshCustomers}
            disabled={loading}
            icon={<ArrowClockwise aria-hidden className={loading ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />}
          >
            Refresh
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} icon={<UserPlus aria-hidden weight="bold" className="w-4 h-4" />}>
            New Customer
          </Button>
        </div>
      </div>

      <CustomersKpiStrip
        totalOutstandingKhata={totalOutstandingKhata}
        totalLifetimeSpent={totalLifetimeSpent}
        customersWithDues={customersWithDues}
        customersCount={customers.length}
      />

      <Tabs<CustomersTab>
        className="mb-4 self-start"
        value={currentTab}
        onChange={handleTabChange}
        items={[
          { value: 'all', label: 'All Customers Directory' },
          { value: 'khata', label: `Khata Outstanding Dues (${customersWithDues})` },
        ]}
      />

      <CustomersTable
        customers={displayedCustomers}
        loading={loading}
        shopName={shopName}
        onEdit={setCustomerToEdit}
        onRepay={setCustomerToRepay}
        onOpenStatement={openStatementModal}
      />

      <AddCustomerModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onCustomerAdded={onRefreshCustomers} />

      <EditCustomerModal
        isOpen={!!customerToEdit}
        customer={customerToEdit}
        onClose={() => setCustomerToEdit(null)}
        onCustomerUpdated={onRefreshCustomers}
      />

      <RecordRepaymentModal
        customer={customerToRepay}
        onClose={() => setCustomerToRepay(null)}
        onRepaymentSuccess={onRefreshCustomers}
      />

      <PassbookModal
        customer={statementCustomer}
        statement={statement}
        loadingStatement={loadingStatement}
        onClose={() => setStatementCustomer(null)}
      />
    </div>
  );
}
