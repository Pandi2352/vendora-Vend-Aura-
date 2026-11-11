import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Truck,
  Plus,
  MagnifyingGlass,
  ArrowClockwise,
  HandCoins,
  Package,
  X,
  Phone,
  CurrencyInr,
  CalendarBlank,
  Trash,
} from '@phosphor-icons/react';
import type { SupplierItem, PurchaseItemRecord, ProductItem } from '../types/pos.types';

const API_BASE = 'http://localhost:5000/api/v1';

interface SuppliersViewProps {
  tenantId?: string;
  authToken: string | null;
  products: ProductItem[];
  onInwardStockCompleted: () => void;
}

export function SuppliersView({
  tenantId,
  authToken,
  products,
  onInwardStockCompleted,
}: SuppliersViewProps) {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [purchases, setPurchases] = useState<PurchaseItemRecord[]>([]);
  const [subTab, setSubTab] = useState<'suppliers' | 'inwards'>('suppliers');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Add Supplier Modal
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [supName, setSupName] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supGstin, setSupGstin] = useState('');
  const [supCategory, setSupCategory] = useState('General FMCG');
  const [supCreditDays, setSupCreditDays] = useState(30);
  const [addSupError, setAddSupError] = useState('');
  const [isSubmittingSup, setIsSubmittingSup] = useState(false);

  // New GRN / Inward Stock Modal
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [supplierBillNo, setSupplierBillNo] = useState('');
  const [inwardItems, setInwardItems] = useState<
    Array<{
      productId: string;
      name: string;
      barcode: string;
      quantityReceived: number;
      unitCostPrice: number;
      taxRatePercent: number;
    }>
  >([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState('');
  const [inwardPaymentStatus, setInwardPaymentStatus] = useState<'PAID' | 'PARTIAL' | 'UNPAID'>('UNPAID');
  const [inwardAmountPaid, setInwardAmountPaid] = useState('');
  const [inwardError, setInwardError] = useState('');
  const [isInwarding, setIsInwarding] = useState(false);

  // Supplier Settlement Payment Modal
  const [selectedSupForPay, setSelectedSupForPay] = useState<SupplierItem | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState<'CASH' | 'UPI' | 'BANK_TRANSFER'>('BANK_TRANSFER');
  const [payRef, setPayRef] = useState('');
  const [payError, setPayError] = useState('');
  const [isPayingSup, setIsPayingSup] = useState(false);

  const fetchAllData = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const [supRes, purRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/suppliers?tenantId=${tenantId}`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        }),
        axios.get(`${API_BASE}/suppliers/inward/history?tenantId=${tenantId}`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        }),
      ]);

      if (supRes.status === 'fulfilled' && Array.isArray(supRes.value.data?.data)) {
        setSuppliers(supRes.value.data.data);
      }
      if (purRes.status === 'fulfilled' && Array.isArray(purRes.value.data?.data)) {
        setPurchases(purRes.value.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch suppliers/purchases:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, authToken]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handle Create Supplier
  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim() || !supPhone.trim()) {
      setAddSupError('Supplier name and phone are required.');
      return;
    }

    setIsSubmittingSup(true);
    setAddSupError('');
    try {
      await axios.post(
        `${API_BASE}/suppliers`,
        {
          tenantId,
          name: supName.trim(),
          contactPerson: supContact.trim() || undefined,
          phone: supPhone.trim(),
          email: supEmail.trim() || undefined,
          gstin: supGstin.trim() || undefined,
          category: supCategory,
          creditDays: Number(supCreditDays) || 30,
        },
        { headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} }
      );

      setIsAddSupplierOpen(false);
      setSupName('');
      setSupContact('');
      setSupPhone('');
      setSupEmail('');
      setSupGstin('');
      fetchAllData();
    } catch (err: any) {
      setAddSupError(err.response?.data?.message || 'Failed to register supplier');
    } finally {
      setIsSubmittingSup(false);
    }
  };

  // Add Item line to Inward draft
  const handleAddItemToInward = () => {
    if (!selectedProductToAdd) return;
    const prod = products.find((p) => p.id === selectedProductToAdd);
    if (!prod) return;

    if (inwardItems.some((it) => it.productId === prod.id)) {
      return; // already added
    }

    setInwardItems((prev) => [
      ...prev,
      {
        productId: prod.id,
        name: prod.name,
        barcode: prod.barcode,
        quantityReceived: 10,
        unitCostPrice: prod.costPrice || Math.round(prod.unitPrice * 0.75),
        taxRatePercent: prod.taxRatePercent || 0,
      },
    ]);
    setSelectedProductToAdd('');
  };

  const handleUpdateInwardItem = (index: number, field: string, val: number) => {
    setInwardItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: val } : item))
    );
  };

  const handleRemoveInwardItem = (index: number) => {
    setInwardItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const inwardSubtotal = inwardItems.reduce(
    (sum, it) => sum + it.unitCostPrice * it.quantityReceived,
    0
  );
  const inwardTaxTotal = inwardItems.reduce(
    (sum, it) => sum + (it.unitCostPrice * it.quantityReceived * it.taxRatePercent) / 100,
    0
  );
  const inwardGrandTotal = Math.round(inwardSubtotal + inwardTaxTotal);

  // Submit Inward Stock / GRN
  const handleSubmitInward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      setInwardError('Please select a supplier.');
      return;
    }
    if (inwardItems.length === 0) {
      setInwardError('Add at least one item to inward shipment.');
      return;
    }

    setIsInwarding(true);
    setInwardError('');
    try {
      const payload = {
        tenantId,
        supplierId: selectedSupplierId,
        supplierInvoiceNumber: supplierBillNo.trim() || undefined,
        items: inwardItems.map((it) => ({
          productId: it.productId,
          name: it.name,
          barcode: it.barcode,
          quantityReceived: Number(it.quantityReceived),
          unitCostPrice: Number(it.unitCostPrice),
          taxRatePercent: Number(it.taxRatePercent),
          taxAmount: Math.round(((it.unitCostPrice * it.quantityReceived * it.taxRatePercent) / 100) * 100) / 100,
          total: Math.round(it.unitCostPrice * it.quantityReceived * (1 + it.taxRatePercent / 100)),
        })),
        subTotal: inwardSubtotal,
        taxTotal: inwardTaxTotal,
        grandTotal: inwardGrandTotal,
        paymentStatus: inwardPaymentStatus,
        amountPaid: inwardPaymentStatus === 'PAID' ? inwardGrandTotal : Number(inwardAmountPaid) || 0,
      };

      await axios.post(`${API_BASE}/suppliers/inward`, payload, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });

      setIsInwardModalOpen(false);
      setSelectedSupplierId('');
      setSupplierBillNo('');
      setInwardItems([]);
      setInwardAmountPaid('');

      // Refresh both supplier state and trigger POS product stock update
      fetchAllData();
      onInwardStockCompleted();
    } catch (err: any) {
      setInwardError(err.response?.data?.message || 'Failed to submit inward shipment');
    } finally {
      setIsInwarding(false);
    }
  };

  // Submit Supplier Settlement Payment
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupForPay) return;
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      setPayError('Please enter a valid amount.');
      return;
    }

    setIsPayingSup(true);
    setPayError('');
    try {
      await axios.post(
        `${API_BASE}/suppliers/${selectedSupForPay.id}/pay?tenantId=${tenantId}`,
        {
          amount,
          paymentMode: payMode,
          referenceNumber: payRef.trim() || undefined,
        },
        { headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} }
      );

      setSelectedSupForPay(null);
      setPayAmount('');
      setPayRef('');
      fetchAllData();
    } catch (err: any) {
      setPayError(err.response?.data?.message || 'Failed to record supplier payment');
    } finally {
      setIsPayingSup(false);
    }
  };

  const totalPayablesDue = suppliers.reduce((sum, s) => sum + s.balanceDue, 0);
  const totalInwardedValue = purchases.reduce((sum, p) => sum + p.grandTotal, 0);

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredPurchases = purchases.filter(
    (p) =>
      p.grnNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      (p.supplierInvoiceNumber && p.supplierInvoiceNumber.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 overflow-hidden p-4 sm:p-6 select-none font-sans">
      {/* Top Banner & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2">
            <Truck className="w-5 h-5 text-red-600" />
            <span>Suppliers & Inward Inventory (GRN)</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Procure stock from distributors, log Goods Receipt Notes (GRN), and manage vendor payables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-zinc-300 hover:border-zinc-400 text-zinc-700 text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
          >
            <ArrowClockwise className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsAddSupplierOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-zinc-300 hover:border-zinc-400 text-zinc-800 text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Plus weight="bold" className="w-3.5 h-3.5" />
            <span>New Supplier</span>
          </button>

          <button
            onClick={() => setIsInwardModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Package weight="bold" className="w-3.5 h-3.5" />
            <span>Inward Stock (GRN)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-white p-3.5 rounded-md border border-zinc-200">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-semibold mb-1">
            <span>Outstanding Supplier Payables</span>
            <HandCoins className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-xl font-black font-mono text-red-600">
            ₹{totalPayablesDue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Pending distributor dues to be settled</div>
        </div>

        <div className="bg-white p-3.5 rounded-md border border-zinc-200">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-semibold mb-1">
            <span>Total Goods Procured (GRN)</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black font-mono text-zinc-950">
            ₹{totalInwardedValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">{purchases.length} inward shipments received</div>
        </div>

        <div className="bg-white p-3.5 rounded-md border border-zinc-200">
          <div className="flex items-center justify-between text-zinc-500 text-[11px] font-semibold mb-1">
            <span>Active Suppliers</span>
            <Truck className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-xl font-black font-mono text-zinc-950">{suppliers.length}</div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Wholesalers & direct brand distributors</div>
        </div>
      </div>

      {/* Sub-Tabs: Suppliers Directory vs GRN Shipments */}
      <div className="bg-white p-3 rounded-md border border-zinc-200 mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setSubTab('suppliers')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              subTab === 'suppliers'
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Suppliers Directory ({suppliers.length})
          </button>
          <button
            onClick={() => setSubTab('inwards')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              subTab === 'inwards'
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Inward GRN Shipments ({purchases.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <MagnifyingGlass className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              subTab === 'suppliers'
                ? 'Search suppliers by name, phone...'
                : 'Search GRN #, supplier, bill #...'
            }
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-zinc-200 text-xs text-zinc-900 focus:border-red-600 outline-none"
          />
        </div>
      </div>

      {/* Content Table */}
      <div className="flex-1 bg-white rounded-md border border-zinc-200 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {subTab === 'suppliers' ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-zinc-100 sticky top-0 border-b border-zinc-200 text-zinc-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Supplier / Firm Name</th>
                  <th className="py-2.5 px-4">Contact Person</th>
                  <th className="py-2.5 px-4">Phone / Email</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Credit Terms</th>
                  <th className="py-2.5 px-4 text-right">Balance Due</th>
                  <th className="py-2.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-zinc-950">
                      <div>{s.name}</div>
                      {s.gstin && (
                        <div className="font-mono text-[10px] text-zinc-400">GST: {s.gstin}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-zinc-700">
                      {s.contactPerson || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-700">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{s.phone}</span>
                      </div>
                      {s.email && <div className="text-[10px] text-zinc-400">{s.email}</div>}
                    </td>
                    <td className="py-3 px-4 text-zinc-600 text-[11px] font-medium">
                      {s.category}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-600">
                      {s.creditDays} days
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-right">
                      <span className={s.balanceDue > 0 ? 'text-red-600' : 'text-emerald-600'}>
                        ₹{s.balanceDue.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedSupForPay(s);
                          setPayAmount(String(s.balanceDue || ''));
                        }}
                        className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-emerald-600 hover:text-white text-zinc-700 font-semibold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="Record Payment Settlement"
                      >
                        <CurrencyInr weight="bold" className="w-3 h-3" />
                        <span>Pay Dues</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredSuppliers.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-400 text-xs">
                      <Truck className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                      <p className="font-semibold text-zinc-600">No suppliers registered yet.</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Click "New Supplier" to register distributor profiles.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-zinc-100 sticky top-0 border-b border-zinc-200 text-zinc-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">GRN #</th>
                  <th className="py-2.5 px-4">Received Date</th>
                  <th className="py-2.5 px-4">Supplier</th>
                  <th className="py-2.5 px-4">Vendor Bill #</th>
                  <th className="py-2.5 px-4">Items Received</th>
                  <th className="py-2.5 px-4 text-right">Invoice Value</th>
                  <th className="py-2.5 px-4">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-950">
                      {p.grnNumber}
                    </td>
                    <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">
                      <div className="flex items-center gap-1">
                        <CalendarBlank className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{new Date(p.receivedDate).toLocaleDateString('en-IN')}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-900">
                      {p.supplierName}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-600">
                      {p.supplierInvoiceNumber || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-600">
                      {p.itemsCount} {p.itemsCount === 1 ? 'item' : 'items'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-zinc-950 text-right">
                      ₹{p.grandTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                          p.paymentStatus === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : p.paymentStatus === 'PARTIAL'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {p.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredPurchases.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-400 text-xs">
                      <Package className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                      <p className="font-semibold text-zinc-600">No inward shipments recorded.</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Use "Inward Stock (GRN)" to log distributor deliveries.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Supplier Modal */}
      {isAddSupplierOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-zinc-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-sm text-zinc-950 flex items-center gap-2">
                <Truck className="w-4 h-4 text-red-600" />
                <span>Register Supplier / Distributor</span>
              </h3>
              <button
                onClick={() => setIsAddSupplierOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addSupError && (
              <div className="p-2 rounded-md bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
                {addSupError}
              </div>
            )}

            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Company / Firm Name *</label>
                <input
                  type="text"
                  required
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  placeholder="e.g. Sri Meenakshi Traders"
                  className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={supContact}
                    onChange={(e) => setSupContact(e.target.value)}
                    placeholder="e.g. Murugan K"
                    className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    placeholder="e.g. +91 98401 22334"
                    className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={supEmail}
                    onChange={(e) => setSupEmail(e.target.value)}
                    placeholder="orders@supplier.in"
                    className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={supGstin}
                    onChange={(e) => setSupGstin(e.target.value.toUpperCase())}
                    placeholder="33AAAAA..."
                    className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Category</label>
                  <input
                    type="text"
                    value={supCategory}
                    onChange={(e) => setSupCategory(e.target.value)}
                    placeholder="e.g. FMCG, Dairy, Spices"
                    className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Credit Days</label>
                  <input
                    type="number"
                    min="0"
                    value={supCreditDays}
                    onChange={(e) => setSupCreditDays(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierOpen(false)}
                  className="px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSup}
                  className="px-4 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingSup ? 'Saving...' : 'Register Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inward Stock / GRN Modal */}
      {isInwardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-zinc-200 w-full max-w-2xl p-5 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-zinc-950 flex items-center gap-2">
                  <Package className="w-4 h-4 text-red-600" />
                  <span>Inward Stock Delivery (Goods Receipt Note)</span>
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Increments active inventory stock and records double-entry audit records.
                </p>
              </div>
              <button
                onClick={() => setIsInwardModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {inwardError && (
              <div className="p-2 rounded-md bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
                {inwardError}
              </div>
            )}

            <form onSubmit={handleSubmitInward} className="space-y-4 text-xs flex-1 overflow-y-auto pr-1">
              {/* Supplier & Bill selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Select Supplier *</label>
                  <select
                    required
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none bg-white"
                  >
                    <option value="">-- Choose Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.phone})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Vendor Invoice #</label>
                  <input
                    type="text"
                    value={supplierBillNo}
                    onChange={(e) => setSupplierBillNo(e.target.value)}
                    placeholder="e.g. INV/2026/894"
                    className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Add item to inward list */}
              <div className="p-3 bg-zinc-50 rounded-md border border-zinc-200 space-y-2">
                <label className="font-bold text-zinc-800 block">Add Product to Inward Batch</label>
                <div className="flex gap-2">
                  <select
                    value={selectedProductToAdd}
                    onChange={(e) => setSelectedProductToAdd(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none bg-white text-xs"
                  >
                    <option value="">-- Select Product from Catalog --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Barcode: {p.barcode} | Current Stock: {p.stock ?? 0})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddItemToInward}
                    disabled={!selectedProductToAdd}
                    className="px-3 py-1.5 rounded-md bg-zinc-900 text-white font-semibold cursor-pointer disabled:opacity-40"
                  >
                    Add Line
                  </button>
                </div>
              </div>

              {/* Inward Items Table */}
              <div className="border border-zinc-200 rounded-md overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-zinc-100 border-b border-zinc-200 font-bold uppercase text-[10px] text-zinc-600">
                    <tr>
                      <th className="py-2 px-3">Product Name</th>
                      <th className="py-2 px-3 w-24">Inward Qty</th>
                      <th className="py-2 px-3 w-28">Cost / Unit (₹)</th>
                      <th className="py-2 px-3 w-20">GST %</th>
                      <th className="py-2 px-3 text-right">Line Total</th>
                      <th className="py-2 px-2 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {inwardItems.map((it, idx) => {
                      const lineTotal = Math.round(
                        it.unitCostPrice * it.quantityReceived * (1 + it.taxRatePercent / 100)
                      );
                      return (
                        <tr key={it.productId} className="hover:bg-zinc-50">
                          <td className="py-2 px-3 font-semibold text-zinc-950">
                            <div>{it.name}</div>
                            <div className="font-mono text-[10px] text-zinc-400">{it.barcode}</div>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="1"
                              value={it.quantityReceived}
                              onChange={(e) =>
                                handleUpdateInwardItem(idx, 'quantityReceived', Number(e.target.value))
                              }
                              className="w-full px-2 py-1 rounded-md border border-zinc-300 font-mono text-center outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              value={it.unitCostPrice}
                              onChange={(e) =>
                                handleUpdateInwardItem(idx, 'unitCostPrice', Number(e.target.value))
                              }
                              className="w-full px-2 py-1 rounded-md border border-zinc-300 font-mono text-center outline-none"
                            />
                          </td>
                          <td className="py-2 px-3 font-mono text-zinc-600 text-center">
                            {it.taxRatePercent}%
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-zinc-950 text-right">
                            ₹{lineTotal.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveInwardItem(idx)}
                              className="text-zinc-400 hover:text-red-600 cursor-pointer"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {inwardItems.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-zinc-400 text-xs">
                          No items added to this inward shipment yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals & Payment Status */}
              <div className="p-3 bg-zinc-50 rounded-md border border-zinc-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <label className="font-bold text-zinc-800 block mb-1">Payment Status</label>
                  <div className="flex gap-1.5">
                    {(['UNPAID', 'PARTIAL', 'PAID'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setInwardPaymentStatus(status)}
                        className={`px-3 py-1 rounded-md text-xs font-bold border transition-all cursor-pointer ${
                          inwardPaymentStatus === status
                            ? 'bg-zinc-900 text-white border-zinc-900'
                            : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  {inwardPaymentStatus === 'PARTIAL' && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-zinc-600 font-semibold text-[11px]">Amount Paid Now (₹):</span>
                      <input
                        type="number"
                        min="0"
                        max={inwardGrandTotal}
                        value={inwardAmountPaid}
                        onChange={(e) => setInwardAmountPaid(e.target.value)}
                        className="w-28 px-2 py-1 rounded-md border border-zinc-300 font-mono text-xs outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-zinc-500">Subtotal: ₹{inwardSubtotal.toLocaleString('en-IN')}</div>
                  <div className="text-[11px] text-zinc-500">GST Tax: ₹{inwardTaxTotal.toLocaleString('en-IN')}</div>
                  <div className="text-base font-black font-mono text-zinc-950 mt-0.5">
                    Total: ₹{inwardGrandTotal.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInwardModalOpen(false)}
                  className="px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInwarding || inwardItems.length === 0}
                  className="px-4 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isInwarding ? 'Finalizing GRN...' : 'Confirm Inward & Add Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settle Supplier Dues Modal */}
      {selectedSupForPay && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-zinc-200 w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-sm text-zinc-950 flex items-center gap-2">
                <CurrencyInr className="w-4 h-4 text-emerald-600" />
                <span>Pay Supplier Dues</span>
              </h3>
              <button
                onClick={() => setSelectedSupForPay(null)}
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-zinc-50 rounded-md border border-zinc-200 text-xs">
              <div className="font-bold text-zinc-900">{selectedSupForPay.name}</div>
              <div className="text-zinc-500 font-mono text-[11px]">{selectedSupForPay.phone}</div>
              <div className="mt-1.5 pt-1.5 border-t border-zinc-200 flex justify-between items-center">
                <span className="text-zinc-500">Balance Owed:</span>
                <span className="font-mono font-black text-red-600">
                  ₹{selectedSupForPay.balanceDue.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {payError && (
              <div className="p-2 rounded-md bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
                {payError}
              </div>
            )}

            <form onSubmit={handleSubmitPayment} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Amount to Pay (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedSupForPay.balanceDue}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['BANK_TRANSFER', 'UPI', 'CASH'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPayMode(mode)}
                      className={`py-1.5 rounded-md text-[11px] font-bold border transition-all cursor-pointer ${
                        payMode === mode
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {mode === 'BANK_TRANSFER' ? 'BANK' : mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">UTR / Reference #</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. UTR #, Cheque #, IMPS ref"
                  className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSupForPay(null)}
                  className="px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPayingSup}
                  className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isPayingSup ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
