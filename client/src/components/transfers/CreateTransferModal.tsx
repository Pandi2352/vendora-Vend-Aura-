import { useState, useEffect } from 'react';
import { api, unwrap, getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui';
import { X, Plus, Trash, WarningCircle, ArrowsLeftRight } from '@phosphor-icons/react';

interface OutletOption {
  id: string;
  name: string;
  outletCode: string;
  city?: string;
}

interface ProductOption {
  id: string;
  name: string;
  barcode: string;
  stock: number;
}

interface TransferLine {
  productId: string;
  quantity: number;
}

interface CreateTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTransferModal({ isOpen, onClose, onSuccess }: CreateTransferModalProps) {
  const [outlets, setOutlets] = useState<OutletOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [sourceOutletId, setSourceOutletId] = useState('');
  const [destinationOutletId, setDestinationOutletId] = useState('');
  const [lines, setLines] = useState<TransferLine[]>([{ productId: '', quantity: 1 }]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    setError('');
    Promise.all([
      api.get('/outlets'),
      api.get('/products', { params: { limit: 100 } }),
    ])
      .then(([outletsRes, prodsRes]) => {
        const oData = unwrap<OutletOption[]>(outletsRes) || [];
        const pData = unwrap<ProductOption[]>(prodsRes) || [];
        setOutlets(oData);
        setProducts(pData);
        if (oData.length >= 2) {
          setSourceOutletId(oData[0].id);
          setDestinationOutletId(oData[1].id);
        } else if (oData.length === 1) {
          setSourceOutletId(oData[0].id);
        }
        if (pData.length > 0) {
          setLines([{ productId: pData[0].id, quantity: 1 }]);
        }
      })
      .catch((err) => setError(getErrorMessage(err, 'Failed to load transfer dependencies')))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddLine = () => {
    const firstProd = products[0]?.id || '';
    setLines((prev) => [...prev, { productId: firstProd, quantity: 1 }]);
  };

  const handleRemoveLine = (idx: number) => {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateLine = (idx: number, field: keyof TransferLine, val: string | number) => {
    setLines((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceOutletId || !destinationOutletId) {
      setError('Please select both source and destination branches');
      return;
    }
    if (sourceOutletId === destinationOutletId) {
      setError('Source and destination branches cannot be the same outlet');
      return;
    }
    const validLines = lines.filter((l) => l.productId && l.quantity > 0);
    if (validLines.length === 0) {
      setError('Please add at least one product line item to transfer');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/inventory/transfers', {
        sourceOutletId,
        destinationOutletId,
        items: validLines,
        notes: notes.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create stock transfer note'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-sans">
      <div className="bg-white rounded-md border border-zinc-300 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowsLeftRight weight="bold" className="w-5 h-5 text-primary-600" />
            <div>
              <h3 className="font-bold text-sm text-zinc-950">New Inter-Branch Stock Transfer (STN)</h3>
              <p className="text-[0.6875rem] text-zinc-500">Initiate inventory movement between outlets or warehouses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-zinc-200 hover:bg-zinc-300 text-zinc-700 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <WarningCircle weight="bold" className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Source and Destination Branch Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-zinc-50 rounded-md border border-zinc-200">
            <div>
              <label htmlFor="transfer-source-select" className="text-xs font-bold text-zinc-700 block mb-1">
                From (Source Branch) *
              </label>
              <select
                id="transfer-source-select"
                value={sourceOutletId}
                onChange={(e) => setSourceOutletId(e.target.value)}
                disabled={isLoading}
                className="w-full px-2.5 py-1.5 text-xs rounded-md border border-zinc-300 bg-white font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.outletCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="transfer-destination-select" className="text-xs font-bold text-zinc-700 block mb-1">
                To (Destination Branch) *
              </label>
              <select
                id="transfer-destination-select"
                value={destinationOutletId}
                onChange={(e) => setDestinationOutletId(e.target.value)}
                disabled={isLoading}
                className="w-full px-2.5 py-1.5 text-xs rounded-md border border-zinc-300 bg-white font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.outletCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Line items section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-800">Transfer Line Items</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddLine}
                icon={<Plus weight="bold" className="w-3.5 h-3.5" />}
              >
                Add Item
              </Button>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {lines.map((line, idx) => {
                return (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-zinc-50 rounded-md border border-zinc-200">
                    <select
                      value={line.productId}
                      onChange={(e) => handleUpdateLine(idx, 'productId', e.target.value)}
                      aria-label="Select product to transfer"
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-md border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.barcode}) — Avail: {p.stock}
                        </option>
                      ))}
                    </select>

                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) => handleUpdateLine(idx, 'quantity', Math.max(1, parseInt(e.target.value, 10) || 1))}
                        placeholder="Qty"
                        aria-label="Transfer quantity"
                        className="w-full px-2 py-1.5 text-xs text-center font-mono font-bold rounded-md border border-zinc-300 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>

                    {lines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 rounded cursor-pointer"
                        title="Remove Line"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="transfer-notes-input" className="text-xs font-semibold text-zinc-700 block mb-1">
              Dispatch Instructions / Reason
            </label>
            <input
              id="transfer-notes-input"
              type="text"
              placeholder="e.g. Regular monthly store replenishment, urgent weekend buffer"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting || lines.length === 0}
              loading={isSubmitting}
            >
              Generate Transfer Note
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
