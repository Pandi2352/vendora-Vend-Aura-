import { useMemo, useState } from 'react';
import { CategoryBar } from '../components/CategoryBar';
import { ProductGrid } from '../components/ProductGrid';
import { CartPanel } from '../components/CartPanel';
import { PosToolbar } from '../components/pos/PosToolbar';
import { OfflineBanner } from '../components/pos/OfflineBanner';
import { Alert } from '../components/ui';
import { usePosSession } from '../hooks/usePosSession';
import { usePosHotkeys } from '../hooks/usePosHotkeys';

/** Billing counter: product search + categories on the left, cart on the right, offline sync & hotkeys. */
export function PosPage() {
  const pos = usePosSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Register physical keyboard shortcuts (F1-F10, Esc)
  usePosHotkeys({
    openModal: pos.openModal,
    setOpenModal: pos.setOpenModal,
    closeModal: pos.closeModal,
    cartLength: pos.cart.length,
    onHoldCart: pos.holdCart,
    startCheckout: pos.startCheckout,
  });

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return pos.products.filter(
      (p) =>
        (activeCategory === 'ALL' || p.category === activeCategory) &&
        (p.name.toLowerCase().includes(q) || p.barcode.includes(searchQuery)),
    );
  }, [pos.products, searchQuery, activeCategory]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PosToolbar />
      <OfflineBanner />
      {pos.catalogError && (
        <Alert tone="error" className="rounded-none border-x-0 border-t-0">
          {pos.catalogError}
        </Alert>
      )}
      <CategoryBar categories={pos.categories} activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <ProductGrid
          products={filteredProducts}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddToCart={pos.addToCart}
        />
        <CartPanel
          cart={pos.cart}
          subTotal={pos.subTotal}
          taxTotal={pos.taxTotal}
          roundOff={pos.roundOff}
          grandTotal={pos.grandTotal}
          isShiftOpen={pos.isShiftOpen}
          onUpdateQuantity={pos.updateQuantity}
          onRemoveItem={pos.removeItem}
          onClearCart={pos.clearCart}
          onProceedCheckout={pos.startCheckout}
          onHoldCart={pos.holdCart}
          heldCartsCount={pos.heldCarts.length}
          onOpenHeldCarts={() => pos.setOpenModal('heldCarts')}
        />
      </div>
    </div>
  );
}
