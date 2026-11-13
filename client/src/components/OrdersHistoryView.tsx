import { useCallback, useEffect, useMemo, useState } from 'react';
import { Receipt, ArrowClockwise, ArrowUUpLeft } from '@phosphor-icons/react';
import { api, unwrap, getErrorMessage } from '@/lib/api';
import { orderToInvoice } from '@/lib/invoice';
import { Button, Dropdown, cn } from '@/components/ui';
import type { OrderItemRecord, InvoiceData, AuthUser, PaymentMode } from '@/types/pos.types';
import { OrdersKpiStrip } from './orders/OrdersKpiStrip';
import { OrdersTable } from './orders/OrdersTable';
import { SalesReturnModal } from './orders/SalesReturnModal';

interface OrdersHistoryViewProps {
  currentUser: AuthUser | null;
  onReprintInvoice: (invoice: InvoiceData) => void;
}

type ModeFilter = PaymentMode | 'ALL';

const MODE_OPTIONS: { value: ModeFilter; label: string }[] = [
  { value: 'ALL', label: 'All modes' },
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CARD', label: 'Card' },
  { value: 'CREDIT', label: 'Khata / credit' },
];

const sumBy = (orders: OrderItemRecord[], modes: PaymentMode[]) =>
  orders.filter((o) => modes.includes(o.paymentMode)).reduce((sum, o) => sum + o.grandTotal, 0);

export function OrdersHistoryView({ currentUser, onReprintInvoice }: OrdersHistoryViewProps) {
  const [orders, setOrders] = useState<OrderItemRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<ModeFilter>('ALL');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = unwrap<OrderItemRecord[]>(await api.get('/orders', { params: { limit: 50 } }));
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      setLoadError(getErrorMessage(err, 'Failed to load bills history.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(
    () => (filterMode === 'ALL' ? orders : orders.filter((o) => o.paymentMode === filterMode)),
    [orders, filterMode],
  );

  const handleReprint = (o: OrderItemRecord) => onReprintInvoice(orderToInvoice(o, currentUser));

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 overflow-y-auto p-4 sm:p-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary-600" />
            <span>Store invoices & bills history</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Audit settled sales, reprint 80mm thermal receipts and filter by payment mode.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="secondary"
            onClick={fetchOrders}
            disabled={loading}
            icon={<ArrowClockwise className={cn('w-4 h-4', loading && 'animate-spin')} />}
          >
            Refresh bills
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsReturnModalOpen(true)}
            icon={<ArrowUUpLeft weight="bold" className="w-4 h-4" />}
          >
            Sales Return
          </Button>
        </div>
      </div>

      <OrdersKpiStrip
        totalRevenue={orders.reduce((sum, o) => sum + o.grandTotal, 0)}
        ordersCount={orders.length}
        cashTotal={sumBy(orders, ['CASH'])}
        digitalTotal={sumBy(orders, ['UPI', 'CARD'])}
        creditTotal={sumBy(orders, ['CREDIT'])}
      />

      <OrdersTable
        orders={filteredOrders}
        loading={loading}
        error={loadError}
        onRetry={fetchOrders}
        onReprint={handleReprint}
        onReturn={() => setIsReturnModalOpen(true)}
        toolbar={
          <div className="w-44">
            <Dropdown<ModeFilter>
              aria-label="Filter by payment mode"
              options={MODE_OPTIONS}
              value={filterMode}
              onChange={(v) => setFilterMode(v ?? 'ALL')}
            />
          </div>
        }
      />

      {isReturnModalOpen && (
        <SalesReturnModal
          onClose={() => setIsReturnModalOpen(false)}
          onReturnSuccess={fetchOrders}
        />
      )}
    </div>
  );
}
