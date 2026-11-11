import { useState, useEffect, useCallback } from 'react';
import type { CartItem, ProductItem, CustomerItem } from '../types/pos.types';
import type { HeldCart } from '../types/shift-return.types';

const HELD_CARTS_STORAGE_KEY = 'vendora_held_carts';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [heldCarts, setHeldCarts] = useState<HeldCart[]>(() => {
    try {
      const saved = localStorage.getItem(HELD_CARTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(HELD_CARTS_STORAGE_KEY, JSON.stringify(heldCarts));
  }, [heldCarts]);

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

  const subTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const taxTotal = cart.reduce(
    (sum, item) => sum + (item.unitPrice * item.quantity * item.taxRatePercent) / 100,
    0
  );
  const grandTotal = Math.round(subTotal + taxTotal);

  // Park / Hold Current Register Cart
  const holdCurrentCart = useCallback((customer?: CustomerItem | null) => {
    if (cart.length === 0) return;
    const newHeld: HeldCart = {
      id: `HELD-${Date.now()}`,
      heldAt: new Date().toISOString(),
      customerName: customer?.name,
      customerPhone: customer?.phone,
      items: [...cart],
      subTotal,
      taxTotal,
      grandTotal,
    };
    setHeldCarts((prev) => [newHeld, ...prev]);
    setCart([]);
  }, [cart, subTotal, taxTotal, grandTotal]);

  // Resume a held cart into current register
  const resumeCart = useCallback((heldCart: HeldCart) => {
    setCart(heldCart.items);
    setHeldCarts((prev) => prev.filter((c) => c.id !== heldCart.id));
  }, []);

  // Discard a held cart
  const discardHeldCart = useCallback((heldCartId: string) => {
    setHeldCarts((prev) => prev.filter((c) => c.id !== heldCartId));
  }, []);

  return {
    cart,
    setCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    subTotal,
    taxTotal,
    grandTotal,
    heldCarts,
    holdCurrentCart,
    resumeCart,
    discardHeldCart,
  };
}

