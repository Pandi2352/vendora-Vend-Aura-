import { useState, useEffect, useCallback } from 'react';
import {
  Motorcycle,
  ArrowClockwise,
  MapPin,
  Phone,
  User,
  CheckCircle,
  Truck,
  Package,
} from '@phosphor-icons/react';
import { api, unwrap, getErrorMessage } from '../../../lib/api';
import { Button } from '../../ui';
import { formatInr } from '../../../utils';
import type { DeliveryOrder, DeliveryStatus, DeliverySummary, UpdateDeliveryPayload } from '../../../types/delivery.types';
import { DeliveryKpiStrip } from './DeliveryKpiStrip';
import { DispatchRiderModal } from './DispatchRiderModal';

const STATUS_FILTERS: Array<{ id: string; label: string }> = [
  { id: 'ALL', label: 'All Orders' },
  { id: 'PENDING_DISPATCH', label: 'Pending Dispatch' },
  { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { id: 'DELIVERED', label: 'Delivered' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

function statusBadge(status: DeliveryStatus) {
  switch (status) {
    case 'PENDING_DISPATCH':
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Pending</span>;
    case 'OUT_FOR_DELIVERY':
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">On the Way</span>;
    case 'DELIVERED':
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Delivered</span>;
    case 'CANCELLED':
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-600">Cancelled</span>;
    default:
      return null;
  }
}

export function HomeDeliveryTab() {
  const [filter, setFilter] = useState('ALL');
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [summary, setSummary] = useState<DeliverySummary>({
    total: 0,
    pendingDispatch: 0,
    outForDelivery: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingOrder, setEditingOrder] = useState<DeliveryOrder | null>(null);

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/orders/delivery', {
        params: { status: filter === 'ALL' ? undefined : filter },
      });
      const data = unwrap<{ items: DeliveryOrder[]; summary: DeliverySummary }>(res);
      if (data) {
        setDeliveries(data.items || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch home delivery orders.'));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const handleUpdateDelivery = async (orderId: string, payload: UpdateDeliveryPayload): Promise<boolean> => {
    try {
      await api.patch(`/orders/${orderId}/delivery`, payload);
      await fetchDeliveries();
      return true;
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to update delivery status.'));
      return false;
    }
  };

  const handleQuickDeliver = async (order: DeliveryOrder) => {
    await handleUpdateDelivery(order.id, { deliveryStatus: 'DELIVERED' });
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 bg-zinc-50 flex-1 flex flex-col font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-lg border border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center">
            <Truck weight="bold" className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 tracking-tight">Home Delivery Fulfillment & Dispatch</h2>
            <p className="text-xs text-zinc-500">Track delivery orders, assign dispatch riders and monitor customer deliveries.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchDeliveries}
            disabled={loading}
            icon={<ArrowClockwise weight="bold" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <DeliveryKpiStrip summary={summary} />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setFilter(s.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filter === s.id
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Delivery Orders List */}
      <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden flex-1 flex flex-col">
        {loading && deliveries.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">Loading delivery records...</div>
        ) : deliveries.length === 0 ? (
          <div className="p-12 text-center">
            <Package weight="duotone" className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-700">No delivery orders found</p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Orders marked for Home Delivery during checkout will appear here for fulfillment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Invoice / Time</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Delivery Address</th>
                  <th className="py-3 px-4">Bill Total</th>
                  <th className="py-3 px-4">Rider / Dispatch</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {deliveries.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-zinc-900">{order.invoiceNumber}</div>
                      <div className="text-[11px] text-zinc-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-semibold text-zinc-900">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{order.customerName || 'Walk-in / Cash'}</span>
                      </div>
                      {order.customerPhone && (
                        <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono mt-0.5">
                          <Phone className="w-3 h-3 text-zinc-400" />
                          <a href={`tel:${order.customerPhone}`} className="hover:text-primary-600">
                            {order.customerPhone}
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-start gap-1 text-zinc-700">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{order.deliveryAddress || 'No address specified'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-900">{formatInr(order.grandTotal)}</div>
                      <div className="text-[11px] text-zinc-400">
                        {order.itemsCount || order.items?.length || 1} items • {order.paymentMode}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {order.deliveryRiderName ? (
                        <div>
                          <div className="font-semibold text-zinc-800 flex items-center gap-1">
                            <Motorcycle className="w-3.5 h-3.5 text-primary-600" />
                            <span>{order.deliveryRiderName}</span>
                          </div>
                          {order.deliveryRiderPhone && (
                            <div className="text-[11px] text-zinc-400 font-mono">
                              {order.deliveryRiderPhone}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{statusBadge(order.deliveryStatus)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {order.deliveryStatus === 'OUT_FOR_DELIVERY' && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<CheckCircle weight="bold" className="w-4 h-4" />}
                            onClick={() => handleQuickDeliver(order)}
                          >
                            Delivered
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Motorcycle weight="bold" className="w-4 h-4" />}
                          onClick={() => setEditingOrder(order)}
                        >
                          {order.deliveryStatus === 'PENDING_DISPATCH' ? 'Dispatch' : 'Edit'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dispatch Rider Modal */}
      <DispatchRiderModal
        order={editingOrder}
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        onSave={handleUpdateDelivery}
      />
    </div>
  );
}
