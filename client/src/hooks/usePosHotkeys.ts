import { useEffect } from 'react';
import type { PosModal } from '../app/providers/PosSessionProvider';
import type { PaymentMode } from '../types/pos.types';

interface UsePosHotkeysOptions {
  openModal: PosModal;
  setOpenModal: (modal: PosModal) => void;
  closeModal: () => void;
  cartLength: number;
  onHoldCart: () => void;
  startCheckout: () => void;
  onQuickTender?: (mode: PaymentMode) => void;
}

export function usePosHotkeys({
  openModal,
  setOpenModal,
  closeModal,
  cartLength,
  onHoldCart,
  startCheckout,
}: UsePosHotkeysOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing in inputs except for functional F-keys and Escape
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if (e.key === 'F1') {
        e.preventDefault();
        const searchInput = document.getElementById('pos-product-search') as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      if (e.key === 'F2') {
        e.preventDefault();
        if (cartLength > 0 && !openModal) {
          onHoldCart();
        }
        return;
      }

      if (e.key === 'F3') {
        e.preventDefault();
        if (!openModal) {
          setOpenModal('heldCarts');
        }
        return;
      }

      if (e.key === 'F4') {
        e.preventDefault();
        if (!openModal) {
          setOpenModal('drawer');
        }
        return;
      }

      if (e.key === 'F8') {
        e.preventDefault();
        if (!openModal && cartLength > 0) {
          startCheckout();
        }
        return;
      }

      if (e.key === 'Escape') {
        if (openModal) {
          e.preventDefault();
          closeModal();
        }
        return;
      }

      if (isInput) return;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openModal, setOpenModal, closeModal, cartLength, onHoldCart, startCheckout]);
}

