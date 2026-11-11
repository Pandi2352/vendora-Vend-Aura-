import { useCallback, useState } from 'react';
import { api, unwrap, getErrorMessage } from '../lib/api';
import { orderToInvoice } from '../lib/invoice';
import type { AuthUser, CartItem, CustomerItem, InvoiceData, OrderItemRecord, PaymentMode } from '../types/pos.types';

interface UsePosCheckoutOptions {
  user: AuthUser | null;
  cart: CartItem[];
  /** Called after the server saved the bill (clear cart, refresh catalog/customers/shift). */
  onCompleted: () => void;
  /** Called when the server rejects because no shift is open. */
  onShiftProblem: () => void;
}

/** Submits the bill. The server prices it; the receipt is built from the server's order. */
export function usePosCheckout({ user, cart, onCompleted, onShiftProblem }: UsePosCheckoutOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completedInvoice, setCompletedInvoice] = useState<InvoiceData | null>(null);

  const finalizeBill = useCallback(
    async (paymentMode: PaymentMode, cashTendered: number, customer?: CustomerItem | null) => {
      if (cart.length === 0 || isSubmitting) return false;
      setError('');
      setIsSubmitting(true);
      try {
        const res = await api.post('/orders', {
          items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
          paymentMode,
          customerId: customer?.id || undefined,
          cashTendered: paymentMode === 'CASH' ? cashTendered : undefined,
        });
        setCompletedInvoice(orderToInvoice(unwrap<OrderItemRecord>(res), user));
        onCompleted();
        return true;
      } catch (err) {
        const message = getErrorMessage(err, 'Failed to submit order to server. The cart has been kept.');
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
