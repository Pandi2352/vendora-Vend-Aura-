import { useState, useEffect, useCallback } from 'react';
import type { CartItem, ProductItem, CustomerItem } from '../types/pos.types';
import type { HeldCart } from '../types/shift-return.types';
import { computeCartTotals } from '../lib/totals';

const HELD_CARTS_STORAGE_PREFIX = 'vendora_held_carts';

function loadHeldCarts(storageKey: string | null): HeldCart[] {
  if (!storageKey) return [];
  try {
    const saved = localStorage.getItem(storageKey);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Held carts are scoped per tenant + user so cashiers never see each other's parked bills. */
export function useCart(tenantId?: string, userId?: string) {
  const storageKey = tenantId && userId ? `${HELD_CARTS_STORAGE_PREFIX}:${tenantId}:${userId}` : null;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [held, setHeld] = useState<{ key: string | null; carts: HeldCart[] }>(() => ({
    key: storageKey,
    carts: loadHeldCarts(storageKey),
  }));

  // Re-load when the signed-in user changes (adjusting state during render).
  if (held.key !== storageKey) {
    setHeld({ key: storageKey, carts: loadHeldCarts(storageKey) });
  }
  const heldCarts = held.key === storageKey ? held.carts : [];

  useEffect(() => {
    if (!held.key) return;
    try {
      localStorage.setItem(held.key, JSON.stringify(held.carts));
    } catch (err) {
      console.error('Failed to persist held carts:', err);
    }
  }, [held]);

  const setHeldCarts = useCallback((update: (prev: HeldCart[]) => HeldCart[]) => {
    setHeld((prev) => ({ ...prev, carts: update(prev.carts) }));
  }, []);

  const addToCart = useCallback((product: ProductItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          barcode: product.barcode,
          unitPrice: product.unitPrice,
          mrp: product.mrp,
          quantity: 1,
          taxRatePercent: product.taxRatePercent,
          category: product.category,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totals = computeCartTotals(cart);

  const buildHeldCart = useCallback((items: CartItem[], customer?: CustomerItem | null): HeldCart => {
    const t = computeCartTotals(items);
    return {
      id: `HELD-${Date.now()}`,
      heldAt: new Date().toISOString(),
      customerId: customer?.id,
      customer: customer ?? null,
      customerName: customer?.name,
      customerPhone: customer?.phone,
      items: [...items],
      subTotal: t.subTotal,
      taxTotal: t.taxTotal,
      grandTotal: t.grandTotal,
    };
  }, []);

  // Park / Hold Current Register Cart
  const holdCurrentCart = useCallback((customer?: CustomerItem | null) => {
    if (cart.length === 0) return;
    const newHeld = buildHeldCart(cart, customer);
    setHeldCarts((prev) => [newHeld, ...prev]);
    setCart([]);
  }, [cart, buildHeldCart, setHeldCarts]);

  /**
   * Resume a held cart into the register. If the register already has items they are
   * parked as a new held cart (with `currentCustomer`) instead of being discarded.
   */
  const resumeCart = useCallback((heldCart: HeldCart, currentCustomer?: CustomerItem | null) => {
    const parked = cart.length > 0 ? buildHeldCart(cart, currentCustomer) : null;
    setHeldCarts((prev) => {
      const rest = prev.filter((c) => c.id !== heldCart.id);
      return parked ? [parked, ...rest] : rest;
    });
    setCart(heldCart.items);
  }, [cart, buildHeldCart, setHeldCarts]);

  // Discard a held cart
  const discardHeldCart = useCallback((heldCartId: string) => {
    setHeldCarts((prev) => prev.filter((c) => c.id !== heldCartId));
  }, [setHeldCarts]);

  return {
    cart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    ...totals,
    heldCarts,
    holdCurrentCart,
    resumeCart,
    discardHeldCart,
  };
}
