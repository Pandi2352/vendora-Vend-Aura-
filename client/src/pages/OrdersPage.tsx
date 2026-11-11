import { OrdersHistoryView } from '../components/OrdersHistoryView';
import { useAuth } from '../hooks/useAuth';
import { usePosSession } from '../hooks/usePosSession';

/** Bills history with reprint; the receipt modal is shared app-wide. */
export function OrdersPage() {
  const { user } = useAuth();
  const { checkout } = usePosSession();

  return (
    <div className="h-full flex flex-col">
      <OrdersHistoryView currentUser={user} onReprintInvoice={checkout.showInvoice} />
    </div>
  );
}
