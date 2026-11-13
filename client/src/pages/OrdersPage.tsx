import { useSearchParams } from 'react-router-dom';
import { Tabs } from '../components/ui';
import { OrdersHistoryView } from '../components/OrdersHistoryView';
import { DiscountsView } from '../components/discounts/DiscountsView';
import { useAuth } from '../hooks/useAuth';
import { usePosSession } from '../hooks/usePosSession';

type OrdersTab = 'bills' | 'discounts';

/** Bills history with reprint & merchandising discounts. */
export function OrdersPage() {
  const { user } = useAuth();
  const { checkout } = usePosSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const currentTab: OrdersTab = rawTab === 'discounts' ? 'discounts' : 'bills';

  const handleTabChange = (nextTab: OrdersTab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextTab === 'bills') {
        next.delete('tab');
      } else {
        next.set('tab', nextTab);
      }
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col bg-zinc-50">
      <div className="px-4 sm:px-6 pt-4 bg-zinc-50 border-b border-zinc-200">
        <Tabs<OrdersTab>
          className="self-start"
          value={currentTab}
          onChange={handleTabChange}
          items={[
            { value: 'bills', label: 'Store Bills & Invoices' },
            { value: 'discounts', label: 'Discounts & Offers' },
          ]}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        {currentTab === 'bills' ? (
          <OrdersHistoryView currentUser={user} onReprintInvoice={checkout.showInvoice} />
        ) : (
          <DiscountsView />
        )}
      </div>
    </div>
  );
}
