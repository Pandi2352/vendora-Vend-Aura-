import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { MagnifyingGlass, Receipt, ArrowClockwise } from '@phosphor-icons/react';
import type { OrderItemRecord, InvoiceData } from '../types/pos.types';
import { OrdersKpiStrip } from './orders/OrdersKpiStrip';
import { OrdersTable } from './orders/OrdersTable';

const API_BASE = 'http://localhost:5000/api/v1';

interface OrdersHistoryViewProps {
  tenantId?: string;
  authToken: string | null;
  shopName: string;
  shopId: string;
  onReprintInvoice: (invoice: InvoiceData) => void;
}

export function OrdersHistoryView({
  tenantId,
  authToken,
  shopName,
  shopId,
  onReprintInvoice,
}: OrdersHistoryViewProps) {
  const [orders, setOrders] = useState<OrderItemRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<string>('ALL');

  const fetchOrders = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/orders?tenantId=${tenantId}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      if (Array.isArray(res.data?.data)) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch orders history:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, authToken]);

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
    const invoice: InvoiceData = {
      invoiceNumber: o.invoiceNumber,
      date: new Date(o.createdAt).toLocaleDateString('en-IN'),
      time: new Date(o.createdAt).toLocaleTimeString('en-IN'),
      cashier: o.cashierName || 'Cashier',
      terminal: 'OUT-01',
      shopName,
      shopId,
      items: (o.items || []).map((it) => ({
        id: it.productId,
        name: it.name,
        barcode: it.barcode,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        taxRatePercent: it.taxRatePercent,
      })),
      subTotal: o.subTotal,
      cgst: o.cgst || (o.taxTotal ? o.taxTotal / 2 : 0),
      sgst: o.sgst || (o.taxTotal ? o.taxTotal / 2 : 0),
      grandTotal: o.grandTotal,
      paymentMode: o.paymentMode,
      cashTendered: o.cashTendered || o.grandTotal,
      changeDue: o.changeDue || 0,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
    };
    onReprintInvoice(invoice);
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
