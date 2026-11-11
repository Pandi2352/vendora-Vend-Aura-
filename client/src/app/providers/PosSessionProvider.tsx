import { createContext, useCallback, useState, type ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useDrawerShift } from '../../hooks/useDrawerShift';
import { useCatalogCustomers } from '../../hooks/useCatalogCustomers';
import { usePosCheckout } from '../../hooks/usePosCheckout';
import { useConfirm } from '../../hooks/useConfirm';
import type { CustomerItem } from '../../types/pos.types';
import type { HeldCart } from '../../types/shift-return.types';

export type PosModal = 'checkout' | 'heldCarts' | 'returns' | 'drawer' | null;

/**
 * Store-session state shared by every page: cart, catalog, customers, cash
 * drawer shift, checkout and the global POS modals. Lives above the router
 * outlet so the cart survives moving between pages.
 */
function usePosSessionState() {
  const { user, status } = useAuth();
  const enabled = status === 'authenticated' && !!user;

  const cartState = useCart(user?.tenantId, user?.id);
  const shift = useDrawerShift(enabled);
  const catalog = useCatalogCustomers(enabled);
  const confirm = useConfirm();

  const [openModal, setOpenModal] = useState<PosModal>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);

  const { clearCart } = cartState;
  const { fetchCatalog, fetchCustomers } = catalog;
  const { refreshShift } = shift;

  const refreshAfterSale = useCallback(() => {
    fetchCatalog();
    fetchCustomers();
    refreshShift();
  }, [fetchCatalog, fetchCustomers, refreshShift]);

  const checkout = usePosCheckout({
    user,
    cart: cartState.cart,
    onCompleted: () => {
      setOpenModal(null);
      clearCart();
      setSelectedCustomer(null);
      refreshAfterSale();
    },
    onShiftProblem: refreshShift,
  });

  const isShiftOpen = shift.activeShift?.status === 'OPEN';

  const startCheckout = useCallback(async () => {
    if (!isShiftOpen) {
      const openDrawer = await confirm({
        title: 'No cash drawer shift is open',
        message: 'Billing requires an open shift. Open the cash drawer now?',
        confirmLabel: 'Open cash drawer',
      });
      if (openDrawer) setOpenModal('drawer');
      return;
    }
    checkout.clearError();
    setOpenModal('checkout');
  }, [isShiftOpen, checkout, confirm]);

  const holdCart = useCallback(() => {
    cartState.holdCurrentCart(selectedCustomer);
    setSelectedCustomer(null);
  }, [cartState, selectedCustomer]);

  const resumeHeldCart = useCallback(
    async (held: HeldCart) => {
      if (
        cartState.cart.length > 0 &&
        !(await confirm({
          title: 'Resume held bill?',
          message: 'The register already has items. The current bill will be parked and the selected one resumed.',
          confirmLabel: 'Park & resume',
        }))
      ) {
        return;
      }
      cartState.resumeCart(held, selectedCustomer);
      setSelectedCustomer(
        held.customer ? catalog.customers.find((c) => c.id === held.customerId) || held.customer : null,
      );
      setOpenModal(null);
    },
    [cartState, selectedCustomer, catalog.customers, confirm],
  );

  return {
    ...cartState,
    ...shift,
    ...catalog,
    isShiftOpen,
    openModal,
    setOpenModal,
    closeModal: () => setOpenModal(null),
    selectedCustomer,
    setSelectedCustomer,
    checkout,
    startCheckout,
    holdCart,
    resumeHeldCart,
    refreshAfterSale,
  };
}

export type PosSessionValue = ReturnType<typeof usePosSessionState>;

export const PosSessionContext = createContext<PosSessionValue | null>(null);

export function PosSessionProvider({ children }: { children: ReactNode }) {
  const value = usePosSessionState();
  return <PosSessionContext.Provider value={value}>{children}</PosSessionContext.Provider>;
}
