import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlass, Receipt, ArrowClockwise } from '@phosphor-icons/react';
import { api, unwrap, getErrorMessage } from '../lib/api';
import { orderToInvoice } from '../lib/invoice';
import type { OrderItemRecord, InvoiceData, AuthUser } from '../types/pos.types';
import { OrdersKpiStrip } from './orders/OrdersKpiStrip';
import { OrdersTable } from './orders/OrdersTable';

interface OrdersHistoryViewProps {
  currentUser: AuthUser | null;
  onReprintInvoice: (invoice: InvoiceData) => void;
}

export function OrdersHistoryView({ currentUser, onReprintInvoice }: OrdersHistoryViewProps) {
  const [orders, setOrders] = useState<OrderItemRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<string>('ALL');
  const [loadError, setLoadError] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const list = unwrap<OrderItemRecord[]>(await api.get('/orders', { params: { limit: 50 } }));
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch orders history:', err);
      setLoadError(getErrorMessage(err, 'Failed to load bills history.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (o.customerPhone && o.customerPhone.includes(search));
    const matchesMode = filterMode === 'ALL' || o.paymentMode === filterMode;
    return matchesSearch && matchesMode;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);
  const cashTotal = orders.filter((o) => o.paymentMode === 'CASH').reduce((sum, o) => sum + o.grandTotal, 0);
  const creditTotal = orders.filter((o) => o.paymentMode === 'CREDIT').reduce((sum, o) => sum + o.grandTotal, 0);
  const digitalTotal = orders.filter((o) => o.paymentMode === 'UPI' || o.paymentMode === 'CARD').reduce((sum, o) => sum + o.grandTotal, 0);

  const handleReprint = (o: OrderItemRecord) => {
    onReprintInvoice(orderToInvoice(o, currentUser));
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 overflow-hidden p-4 sm:p-6 select-none font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-red-600" />
            <span>Store Invoices & Bills History</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Audit settled sales orders, print duplicate 80mm thermal receipts, and filter by payment modes.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-zinc-300 hover:border-zinc-400 text-zinc-700 text-xs font-semibold cursor-pointer disabled:opacity-50"
        >
          <ArrowClockwise className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-600' : ''}`} />
          <span>Refresh Bills</span>
        </button>
      </div>

      {loadError && (
        <div className="mb-4 p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {loadError}
        </div>
      )}

      {/* Summary KPI Strip */}
      <OrdersKpiStrip
        totalRevenue={totalRevenue}
        ordersCount={orders.length}
        cashTotal={cashTotal}
        digitalTotal={digitalTotal}
        creditTotal={creditTotal}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-md border border-zinc-200 mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice number (e.g. INV-2026-...) or customer name / mobile"
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-zinc-200 text-xs text-zinc-900 focus:border-red-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-1 shrink-0 overflow-x-auto text-[11px]">
          {['ALL', 'CASH', 'UPI', 'CARD', 'CREDIT'].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                filterMode === mode ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="flex-1 bg-white rounded-md border border-zinc-200 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <OrdersTable orders={filteredOrders} loading={loading} onReprint={handleReprint} />
        </div>
      </div>
    </div>
  );
}
