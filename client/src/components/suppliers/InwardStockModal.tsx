import { useState } from 'react';
import { api, getErrorMessage } from '../../lib/api';
import { Package, X } from '@phosphor-icons/react';
import type { SupplierItem, ProductItem } from '../../types/pos.types';
import { InwardItemsTable, type InwardLineItem } from './InwardItemsTable';

interface InwardStockModalProps {
  isOpen: boolean;
  suppliers: SupplierItem[];
  products: ProductItem[];
  onClose: () => void;
  onInwardSuccess: () => void;
}

export function InwardStockModal({
  isOpen,
  suppliers,
  products,
  onClose,
  onInwardSuccess,
}: InwardStockModalProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [supplierBillNo, setSupplierBillNo] = useState('');
  const [inwardItems, setInwardItems] = useState<InwardLineItem[]>([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'PARTIAL' | 'UNPAID'>('UNPAID');
  const [amountPaid, setAmountPaid] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!selectedProductToAdd) return;
    const prod = products.find((p) => p.id === selectedProductToAdd);
    if (!prod || inwardItems.some((it) => it.productId === prod.id)) return;

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

  const handleUpdateItem = (index: number, field: keyof InwardLineItem, val: number) => {
    setInwardItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: val } : item))
    );
  };

  const handleRemoveItem = (index: number) => {
    setInwardItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const subtotal = inwardItems.reduce((s, it) => s + it.unitCostPrice * it.quantityReceived, 0);
  const taxTotal = inwardItems.reduce(
    (s, it) => s + (it.unitCostPrice * it.quantityReceived * it.taxRatePercent) / 100,
    0
  );
  const grandTotal = Math.round(subtotal + taxTotal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) return setError('Please select a supplier.');
    if (inwardItems.length === 0) return setError('Add at least one item to inward shipment.');

    setLoading(true);
    setError('');
    try {
      const payload = {
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
        subTotal: subtotal,
        taxTotal,
        grandTotal,
        paymentStatus,
        amountPaid: paymentStatus === 'PAID' ? grandTotal : Number(amountPaid) || 0,
      };

      await api.post(`/suppliers/inward`, payload);

      onInwardSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to submit inward shipment'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-md border border-zinc-200 w-full max-w-2xl p-5 space-y-4 max-h-[90vh] flex flex-col font-sans">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-zinc-950 flex items-center gap-2">
              <Package className="w-4 h-4 text-red-600" />
              <span>Inward Stock Delivery (Goods Receipt Note)</span>
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Increments active stock and updates cost ledger.</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2 rounded-md bg-red-50 text-red-600 text-xs font-semibold border border-red-200">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs flex-1 overflow-y-auto pr-1">
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
                  <option key={s.id} value={s.id}>{s.name} ({s.phone})</option>
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
                  <option key={p.id} value={p.id}>{p.name} ({p.barcode}) - Stock: {p.stock ?? 0}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddItem}
                disabled={!selectedProductToAdd}
                className="px-3 py-1.5 rounded-md bg-zinc-900 text-white font-semibold cursor-pointer disabled:opacity-40"
              >
                Add Line
              </button>
            </div>
          </div>

          <InwardItemsTable
            items={inwardItems}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
          />

          <div className="p-3 bg-zinc-50 rounded-md border border-zinc-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <label className="font-bold text-zinc-800 block mb-1">Payment Status</label>
              <div className="flex gap-1.5">
                {(['UNPAID', 'PARTIAL', 'PAID'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setPaymentStatus(s)}
                    className={`px-3 py-1 rounded-md text-xs font-bold border cursor-pointer ${
                      paymentStatus === s ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {paymentStatus === 'PARTIAL' && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-zinc-600 font-semibold text-[11px]">Amount Paid Now (₹):</span>
                  <input
                    type="number"
                    min="0"
                    max={grandTotal}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-28 px-2 py-1 rounded-md border border-zinc-300 font-mono text-xs outline-none"
                  />
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="text-[11px] text-zinc-500">Subtotal: ₹{subtotal.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-zinc-500">GST Tax: ₹{taxTotal.toLocaleString('en-IN')}</div>
              <div className="text-base font-black font-mono text-zinc-950 mt-0.5">Total: ₹{grandTotal.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || inwardItems.length === 0}
              className="px-4 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Finalizing GRN...' : 'Confirm Inward & Add Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
