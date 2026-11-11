import { CustomersView } from '../components/CustomersView';
import { useAuth } from '../hooks/useAuth';
import { usePosSession } from '../hooks/usePosSession';

/** Customers & khata. Shares the customer list with checkout so new customers appear there at once. */
export function CustomersPage() {
  const { user } = useAuth();
  const { customers, isLoadingCustomers, fetchCustomers } = usePosSession();

  return (
    <div className="h-full flex flex-col">
      <CustomersView
        customers={customers}
        loading={isLoadingCustomers}
        onRefreshCustomers={fetchCustomers}
        shopName={user?.businessName || 'Vendora Retail Store'}
      />
    </div>
  );
}
