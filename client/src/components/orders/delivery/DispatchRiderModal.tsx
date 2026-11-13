import { useState, useEffect } from 'react';
import { X, Motorcycle, FloppyDisk } from '@phosphor-icons/react';
import { Button } from '../../ui';
import type { DeliveryOrder, DeliveryStatus, UpdateDeliveryPayload } from '../../../types/delivery.types';

interface DispatchRiderModalProps {
  order: DeliveryOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderId: string, payload: UpdateDeliveryPayload) => Promise<boolean>;
}

export function DispatchRiderModal({ order, isOpen, onClose, onSave }: DispatchRiderModalProps) {
  const [riderName, setRiderName] = useState('');
  const [riderPhone, setRiderPhone] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<DeliveryStatus>('OUT_FOR_DELIVERY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (order) {
      setRiderName(order.deliveryRiderName || '');
      setRiderPhone(order.deliveryRiderPhone || '');
      setAddress(order.deliveryAddress || '');
      setStatus(order.deliveryStatus || 'OUT_FOR_DELIVERY');
      setError('');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'OUT_FOR_DELIVERY' && !riderName.trim()) {
      setError('Please provide the assigned rider name to dispatch.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const ok = await onSave(order.id, {
        deliveryStatus: status,
        deliveryRiderName: riderName.trim(),
        deliveryRiderPhone: riderPhone.trim(),
        deliveryAddress: address.trim(),
      });
      if (ok) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dispatch-rider-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white rounded-lg shadow-xl border border-zinc-200 w-full max-w-md overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
              <Motorcycle weight="bold" className="w-4 h-4" />
            </div>
            <div>
              <h3 id="dispatch-rider-title" className="text-sm font-bold text-zinc-900">
                Dispatch Rider & Status
              </h3>
              <p className="text-xs text-zinc-500 font-mono">Invoice #{order.invoiceNumber}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="delivery-status" className="block text-xs font-semibold text-zinc-700 mb-1">
              Fulfillment Status
            </label>
            <select
              id="delivery-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as DeliveryStatus)}
              className="w-full h-9 px-3 rounded-md border border-zinc-200 bg-white text-xs font-medium text-zinc-800 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="PENDING_DISPATCH">Pending Dispatch</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label htmlFor="rider-name" className="block text-xs font-semibold text-zinc-700 mb-1">
              Rider / Courier Name
            </label>
            <input
              id="rider-name"
              type="text"
              value={riderName}
              onChange={(e) => setRiderName(e.target.value)}
              placeholder="e.g. Suresh Kumar"
              className="w-full h-9 px-3 rounded-md border border-zinc-200 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="rider-phone" className="block text-xs font-semibold text-zinc-700 mb-1">
              Rider Contact Phone
            </label>
            <input
              id="rider-phone"
              type="tel"
              value={riderPhone}
              onChange={(e) => setRiderPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full h-9 px-3 rounded-md border border-zinc-200 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="delivery-address" className="block text-xs font-semibold text-zinc-700 mb-1">
              Delivery Destination Address
            </label>
            <textarea
              id="delivery-address"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Customer address, landmark, pin code..."
              className="w-full p-2.5 rounded-md border border-zinc-200 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isSubmitting}
              icon={<FloppyDisk weight="bold" className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
