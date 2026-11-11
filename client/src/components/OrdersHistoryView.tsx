import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  MagnifyingGlass,
  Receipt,
  Printer,
  CalendarBlank,
  ArrowClockwise,
  Money,
  QrCode,
  HandCoins,
} from '@phosphor-icons/react';
import type { OrderItemRecord, InvoiceData } from '../types/pos.types';

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
      customerId: o.customerId,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      items: (o.items || []).map((it) => ({
        id: it.productId,
        name: it.name,
        barcode: it.barcode,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        taxRatePercent: it.taxRatePercent || 0,
      })),
      subTotal: o.subTotal,
      cgst: o.cgst,
      sgst: o.sgst,
      grandTotal: o.grandTotal,
      paymentMode: o.paymentMode,
      cashTendered: o.cashTendered,
      changeDue: o.changeDue,
    };
    onReprintInvoice(invoice);
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 overflow-hidden p-4 sm:p-6 select-none font-sans">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-red-600" />
            <span>Past Invoices & Sales Ledger</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Audit trail of all finalized counter orders and reprint thermal receipts.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-zinc-300 hover:border-zinc-400 text-zinc-700 text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
        >
          <ArrowClockwise className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-600' : ''}`} />
          <span>Refresh Bills</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-white p-3.5 rounded-md border border-zinc-200">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-semibold mb-1">
            <span>Total Sales</span>
            <Receipt className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-xl font-black font-mono text-zinc-950">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">{orders.length} bills generated</div>
        </div>

        <div className="bg-white p-3.5 rounded-md border border-zinc-200">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-semibold mb-1">
            <span>Cash Tendered</span>
            <Money className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black font-mono text-zinc-950">
            ₹{cashTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Physical cash drawer</div>
        </div>

        <div className="bg-white p-3.5 rounded-md border border-zinc-200">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-semibold mb-1">
            <span>UPI & Cards</span>
            <QrCode className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black font-mono text-zinc-950">
            ₹{digitalTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Digital bank settlement</div>
        </div>

        <div className="bg-white p-3.5 rounded-md border border-zinc-200">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-semibold mb-1">
            <span>Khata / Credit Sales</span>
            <HandCoins className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black font-mono text-zinc-950">
            ₹{creditTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Billed on customer credit</div>
        </div>
      </div>

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

        {/* Mode filter pills */}
        <div className="flex items-center gap-1 shrink-0 overflow-x-auto text-[11px]">
          {['ALL', 'CASH', 'UPI', 'CARD', 'CREDIT'].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                filterMode === mode
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
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
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-zinc-100 sticky top-0 border-b border-zinc-200 text-zinc-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Invoice #</th>
                <th className="py-2.5 px-4">Date & Time</th>
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-4">Items</th>
                <th className="py-2.5 px-4">Tender Mode</th>
                <th className="py-2.5 px-4 text-right">Grand Total</th>
                <th className="py-2.5 px-4">Cashier</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-bold text-zinc-900">
                    {o.invoiceNumber}
                  </td>
                  <td className="py-2.5 px-4 text-zinc-500 font-mono text-[11px]">
                    <div className="flex items-center gap-1">
                      <CalendarBlank className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{new Date(o.createdAt).toLocaleDateString('en-IN')}</span>
                      <span className="text-zinc-400 ml-1">
                        {new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    {o.customerName ? (
                      <div>
                        <span className="font-semibold text-zinc-900">{o.customerName}</span>
                        {o.customerPhone && (
                          <span className="block font-mono text-[10px] text-zinc-400">{o.customerPhone}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-400 text-[11px] italic">Walk-in Customer</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-zinc-600">
                    {o.itemsCount} {o.itemsCount === 1 ? 'item' : 'items'}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                        o.paymentMode === 'CASH'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : o.paymentMode === 'UPI'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : o.paymentMode === 'CARD'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {o.paymentMode}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-zinc-950 text-right">
                    ₹{o.grandTotal.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-4 text-zinc-600 text-[11px]">
                    {o.cashierName || 'Cashier'}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <button
                      onClick={() => handleReprint(o)}
                      className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-red-600 hover:text-white border border-zinc-200 text-zinc-700 font-semibold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                      title="Reprint 80mm Receipt"
                    >
                      <Printer weight="bold" className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400 text-xs">
                    <Receipt className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="font-semibold text-zinc-600">No invoices match your filter.</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Bills completed in the POS register will appear here automatically.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
