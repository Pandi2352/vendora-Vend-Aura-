import { canManageSuppliers, canViewReports } from './lib/permissions';
import { useState, useEffect, useCallback } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { PosHeader } from './components/PosHeader';
import type { PosActiveTab } from './components/PosHeader';
import { CategoryBar } from './components/CategoryBar';
import { ProductGrid } from './components/ProductGrid';
import { CartPanel } from './components/CartPanel';
import { OrdersHistoryView } from './components/OrdersHistoryView';
import { CustomersView } from './components/CustomersView';
import { SuppliersView } from './components/SuppliersView';
import { ReportsView } from './components/reports/ReportsView';
import { AppModals } from './components/AppModals';
import { PasswordResetModal } from './components/PasswordResetModal';
import { useAuthSession } from './hooks/useAuthSession';
import { useCart } from './hooks/useCart';
import { useDrawerShift } from './hooks/useDrawerShift';
import { useCatalogCustomers } from './hooks/useCatalogCustomers';
import { api, unwrap, getErrorMessage, LOGOUT_EVENT } from './lib/api';
import { orderToInvoice } from './lib/invoice';
import type { InvoiceData, CustomerItem, OrderItemRecord, PaymentMode } from './types/pos.types';
import type { HeldCart } from './types/shift-return.types';

export default function App() {
  const auth = useAuthSession();
  const isReady = auth.isAuthenticated && !auth.mustChangePassword && !!auth.currentUser;

  const {
    cart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    subTotal,
    taxTotal,
    roundOff,
    grandTotal,
    heldCarts,
    holdCurrentCart,
    resumeCart,
    discardHeldCart,
  } = useCart(auth.currentUser?.tenantId, auth.currentUser?.id);

  const { activeShift, setActiveShift, refreshShift } = useDrawerShift(isReady);
  const { products, categories, customers, isLoadingCustomers, catalogError, fetchCatalog, fetchCustomers } =
    useCatalogCustomers(isReady);

  // Active View & Modals State
  const [activeTab, setActiveTab] = useState<PosActiveTab>('pos');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [isSubmittingBill, setIsSubmittingBill] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<InvoiceData | null>(null);
  const [isHeldCartsOpen, setIsHeldCartsOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isDrawerModalOpen, setIsDrawerModalOpen] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);

  const resetWorkspace = useCallback(() => {
    clearCart();
    setSelectedCustomer(null);
    setActiveTab('pos');
    setIsCheckoutOpen(false);
    setCompletedInvoice(null);
    setIsHeldCartsOpen(false);
    setIsReturnModalOpen(false);
    setIsDrawerModalOpen(false);
  }, [clearCart]);

  // Session expired / refresh failed (dispatched by the api module)
  useEffect(() => {
    window.addEventListener(LOGOUT_EVENT, resetWorkspace);
    return () => window.removeEventListener(LOGOUT_EVENT, resetWorkspace);
  }, [resetWorkspace]);

  const handleProceedCheckout = () => {
    if (!activeShift || activeShift.status !== 'OPEN') {
      if (window.confirm('No cash drawer shift is open. Billing requires an open shift.\n\nOpen the cash drawer now?')) {
        setIsDrawerModalOpen(true);
      }
      return;
    }
    setCheckoutError('');
    setIsCheckoutOpen(true);
  };

  // Finalize POS Order — the server prices the bill; the receipt uses its response.
  const handleFinalizeBill = async (paymentMode: PaymentMode, cashTendered: number, customer?: CustomerItem | null) => {
    if (cart.length === 0 || isSubmittingBill) return;
    setCheckoutError('');
    setIsSubmittingBill(true);
    try {
      const res = await api.post('/orders', {
        items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
        paymentMode,
        customerId: customer?.id || undefined,
        cashTendered: paymentMode === 'CASH' ? cashTendered : undefined,
      });

      const order = unwrap<OrderItemRecord>(res);
      setCompletedInvoice(orderToInvoice(order, auth.currentUser));
      setIsCheckoutOpen(false);
      clearCart();
      setSelectedCustomer(null);

      fetchCatalog();
      fetchCustomers();
      refreshShift();
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to submit order to server. The cart has been kept.');
      setCheckoutError(message);
      if (/shift/i.test(message)) refreshShift();
    } finally {
      setIsSubmittingBill(false);
    }
  };

  const handleResumeCart = (held: HeldCart) => {
    if (
      cart.length > 0 &&
      !window.confirm('The register already has items. Park the current bill and resume the selected one?')
    ) {
      return;
    }
    resumeCart(held, selectedCustomer);
    const tagged = held.customer
      ? customers.find((c) => c.id === held.customerId) || held.customer
      : null;
    setSelectedCustomer(tagged);
    setIsHeldCartsOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === 'ALL' || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  const handleSignOut = () => {
    auth.handleSignOut();
    resetWorkspace();
  };

  if (auth.mustChangePassword) {
    return (
      <div className="h-screen bg-zinc-100 font-sans">
        <PasswordResetModal
          currentPassword={auth.currentPassword}
          setCurrentPassword={auth.setCurrentPassword}
          newPassword={auth.newPassword}
          setNewPassword={auth.setNewPassword}
          confirmPassword={auth.confirmPassword}
          setConfirmPassword={auth.setConfirmPassword}
          passwordError={auth.passwordError}
          isUpdatingPassword={auth.isUpdatingPassword}
          onSubmit={auth.handleChangePassword}
          onSignOut={handleSignOut}
        />
      </div>
    );
  }

  if (!isReady) {
    return (
      <LoginScreen
        shopId={auth.shopId}
        setShopId={auth.setShopId}
        username={auth.username}
        setUsername={auth.setUsername}
        password={auth.password}
        setPassword={auth.setPassword}
        loginError={auth.loginError}
        isLoggingIn={auth.isLoggingIn}
        onLogin={auth.handleLogin}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-100 font-sans select-none overflow-hidden">
      {/* 1. POS Operations Command Bar */}
      <PosHeader
        currentUser={auth.currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSignOut={handleSignOut}
        activeShift={activeShift}
        onOpenDrawer={() => setIsDrawerModalOpen(true)}
        onOpenReturns={() => setIsReturnModalOpen(true)}
        heldCartsCount={heldCarts.length}
        onOpenHeldCarts={() => setIsHeldCartsOpen(true)}
      />

      {/* 2. Operational Views */}
      {activeTab === 'pos' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {catalogError && (
            <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-xs font-semibold">
              {catalogError}
            </div>
          )}
          <CategoryBar
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            <ProductGrid
              products={filteredProducts}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onAddToCart={addToCart}
            />
            <CartPanel
              cart={cart}
              subTotal={subTotal}
              taxTotal={taxTotal}
              roundOff={roundOff}
              grandTotal={grandTotal}
              isShiftOpen={activeShift?.status === 'OPEN'}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onClearCart={clearCart}
              onProceedCheckout={handleProceedCheckout}
              onHoldCart={() => {
                holdCurrentCart(selectedCustomer);
                setSelectedCustomer(null);
              }}
              heldCartsCount={heldCarts.length}
              onOpenHeldCarts={() => setIsHeldCartsOpen(true)}
            />
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <OrdersHistoryView
          currentUser={auth.currentUser}
          onReprintInvoice={(inv) => setCompletedInvoice(inv)}
        />
      )}

      {activeTab === 'customers' && (
        <CustomersView
          customers={customers}
          loading={isLoadingCustomers}
          onRefreshCustomers={fetchCustomers}
          shopName={auth.currentUser?.businessName || 'Vendora Retail Store'}
        />
      )}

      {activeTab === 'suppliers' && canManageSuppliers(auth.currentUser?.role) && (
        <SuppliersView products={products} onInwardStockCompleted={fetchCatalog} />
      )}

      {activeTab === 'reports' && canViewReports(auth.currentUser?.role) && <ReportsView />}

      {/* 3. Operational Modals */}
      <AppModals
        isCheckoutOpen={isCheckoutOpen}
        grandTotal={grandTotal}
        customers={customers}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={setSelectedCustomer}
        onCloseCheckout={() => setIsCheckoutOpen(false)}
        onFinalizeBill={handleFinalizeBill}
        checkoutError={checkoutError}
        isSubmittingBill={isSubmittingBill}
        completedInvoice={completedInvoice}
        onCloseReceipt={() => setCompletedInvoice(null)}
        onNewSale={() => setCompletedInvoice(null)}
        isHeldCartsOpen={isHeldCartsOpen}
        onCloseHeldCarts={() => setIsHeldCartsOpen(false)}
        heldCarts={heldCarts}
        onResumeCart={handleResumeCart}
        onDiscardCart={discardHeldCart}
        isReturnModalOpen={isReturnModalOpen}
        onCloseReturnModal={() => setIsReturnModalOpen(false)}
        onReturnSuccess={() => {
          fetchCatalog();
          fetchCustomers();
          refreshShift();
        }}
        isDrawerModalOpen={isDrawerModalOpen}
        onCloseDrawerModal={() => setIsDrawerModalOpen(false)}
        onShiftChange={setActiveShift}
      />
    </div>
  );
}
