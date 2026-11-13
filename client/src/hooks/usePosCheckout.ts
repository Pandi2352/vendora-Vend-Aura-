import { useCallback, useState } from 'react';
import { api, unwrap, getErrorMessage } from '../lib/api';
import { orderToInvoice } from '../lib/invoice';
import { queueOfflineOrder } from '../lib/offline/syncManager';
import type { AuthUser, CartItem, CustomerItem, InvoiceData, OrderItemRecord, PaymentMode } from '../types/pos.types';

interface UsePosCheckoutOptions {
  user: AuthUser | null;
  cart: CartItem[];
  /** Called after the bill is saved (clear cart, refresh catalog/customers/shift). */
  onCompleted: () => void;
  /** Called when the server rejects because no shift is open. */
  onShiftProblem: () => void;
}

/** Submits the bill to cloud or queues it locally in IndexedDB if offline. */
export function usePosCheckout({ user, cart, onCompleted, onShiftProblem }: UsePosCheckoutOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completedInvoice, setCompletedInvoice] = useState<InvoiceData | null>(null);

  const finalizeBill = useCallback(
    async (
      paymentMode: PaymentMode,
      cashTendered: number,
      customer?: CustomerItem | null,
      discount?: { couponCode: string; discountAmount: number } | null,
      delivery?: {
        isHomeDelivery: boolean;
        deliveryAddress?: string;
        deliveryRiderName?: string;
        deliveryRiderPhone?: string;
      } | null,
    ) => {
      if (cart.length === 0 || isSubmitting) return false;
      setError('');
      setIsSubmitting(true);

      const isOfflineMode = typeof navigator !== 'undefined' && !navigator.onLine;

      if (isOfflineMode) {
        try {
          const offlineInvoice = await queueOfflineOrder(cart, paymentMode, cashTendered, customer, user);
          setCompletedInvoice(offlineInvoice);
          onCompleted();
          return true;
        } catch (err: unknown) {
          setError(getErrorMessage(err, 'Failed to save offline bill locally.'));
          return false;
        } finally {
          setIsSubmitting(false);
        }
      }

      try {
        const res = await api.post('/orders', {
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate,
          })),
          paymentMode,
          customerId: customer?.id || undefined,
          cashTendered: paymentMode === 'CASH' ? cashTendered : undefined,
          couponCode: discount?.couponCode || undefined,
          discountAmount: discount?.discountAmount || undefined,
          isHomeDelivery: delivery?.isHomeDelivery || undefined,
          deliveryAddress: delivery?.deliveryAddress || undefined,
          deliveryRiderName: delivery?.deliveryRiderName || undefined,
          deliveryRiderPhone: delivery?.deliveryRiderPhone || undefined,
        });
        setCompletedInvoice(orderToInvoice(unwrap<OrderItemRecord>(res), user));
        onCompleted();
        return true;
      } catch (err: unknown) {
        const isNetworkError =
          typeof err === 'object' && err !== null && 'message' in err && (err as { code?: string }).code === 'ERR_NETWORK';
        if (isNetworkError) {
          try {
            const offlineInvoice = await queueOfflineOrder(cart, paymentMode, cashTendered, customer, user);
            setCompletedInvoice(offlineInvoice);
            onCompleted();
            return true;
          } catch {
            // continue to error below
          }
        }

        const message = getErrorMessage(err, 'Failed to submit order to server.');
        setError(message);
        if (/shift/i.test(message)) onShiftProblem();
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [cart, isSubmitting, user, onCompleted, onShiftProblem],
  );

  return {
    isSubmitting,
    error,
    clearError: () => setError(''),
    completedInvoice,
    showInvoice: setCompletedInvoice,
    finalizeBill,
  };
}
