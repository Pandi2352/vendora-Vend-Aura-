import { useState, useEffect } from 'react';
import { api, unwrap, getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui';
import { X, WarningCircle, Trash } from '@phosphor-icons/react';
import type { WastageReason } from '@/types/stockControl.types';

interface ProductOption {
  id: string;
  name: string;
  barcode: string;
  stock: number;
  costPrice?: number;
  unitPrice: number;
}

interface LogWastageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const REASONS: Array<{ value: WastageReason; label: string }> = [
  { value: 'EXPIRED', label: 'Expired / Past Shelf Life' },
  { value: 'DAMAGED_IN_TRANSIT', label: 'Damaged in Transit / Receiving' },
  { value: 'HANDLING_SPOILAGE', label: 'Handling Spoilage / Broken on Shelf' },
  { value: 'THEFT_SHRINKAGE', label: 'Theft / Pilferage / Unaccounted Shrinkage' },
  { value: 'CUSTOMER_RETURN_DEFECTIVE', label: 'Defective Customer Return' },
  { value: 'OTHER', label: 'Other Loss Reason' },
];

export function LogWastageModal({ isOpen, onClose, onSuccess }: LogWastageModalProps) {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<WastageReason>('EXPIRED');
  const [remarks, setRemarks] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setIsLoadingProducts(true);
    api
      .get('/products', { params: { limit: 100 } })
      .then((res) => {
        const data = unwrap<ProductOption[]>(res) || [];
        setProducts(data);
        if (data.length > 0) setSelectedProductId(data[0].id);
      })
      .catch((err) => setError(getErrorMessage(err, 'Failed to load products list')))
      .finally(() => setIsLoadingProducts(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const estimatedCost = selectedProduct?.costPrice ?? (selectedProduct ? Math.round(selectedProduct.unitPrice * 0.75) : 0);
  const totalEstimatedLoss = Math.round(estimatedCost * quantity * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity <= 0) return;
    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/inventory/wastage', {
        productId: selectedProductId,
        quantity,
        reason,
        remarks: remarks.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to log stock wastage'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-sans">
      <div className="bg-white rounded-md border border-zinc-300 w-full max-w-md overflow-hidden flex flex-col shadow-xl">
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trash weight="bold" className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-sm text-zinc-950">Record Stock Wastage / Write-Off</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-zinc-200 hover:bg-zinc-300 text-zinc-700 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <WarningCircle weight="bold" className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="wastage-product-select" className="text-xs font-semibold text-zinc-700 block mb-1">
              Product to Write Off *
            </label>
            <select
              id="wastage-product-select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              disabled={isLoadingProducts}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-zinc-300 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.barcode}) — Current Stock: {p.stock}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="wastage-quantity-input" className="text-xs font-semibold text-zinc-700 block mb-1">
                Damaged / Expired Qty *
              </label>
              <input
                id="wastage-quantity-input"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-md border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-zinc-700 block mb-1">Loss Valuation</span>
              <div className="px-2.5 py-1.5 text-xs font-mono font-bold text-red-600 bg-red-50 border border-red-200 rounded-md">
                ₹{totalEstimatedLoss}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="wastage-reason-select" className="text-xs font-semibold text-zinc-700 block mb-1">
              Reason for Loss *
            </label>
            <select
              id="wastage-reason-select"
              value={reason}
              onChange={(e) => setReason(e.target.value as WastageReason)}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-zinc-300 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="wastage-remarks-textarea" className="text-xs font-semibold text-zinc-700 block mb-1">
              Remarks / Audit Note
            </label>
            <textarea
              id="wastage-remarks-textarea"
              rows={2}
              placeholder="e.g. Batch B-104 milk packet leaked, broken glass during shelf loading"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
            />
          </div>

          <div className="pt-2 border-t border-zinc-200 flex items-center justify-end gap-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="danger"
              type="submit"
              disabled={isSubmitting || !selectedProductId}
              loading={isSubmitting}
            >
              Record & Deduct Stock
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
