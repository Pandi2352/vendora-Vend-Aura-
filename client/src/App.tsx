import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { LoginScreen } from './components/LoginScreen';
import { PasswordResetModal } from './components/PasswordResetModal';
import { PosHeader } from './components/PosHeader';
import type { PosActiveTab } from './components/PosHeader';
import { CategoryBar } from './components/CategoryBar';
import { ProductGrid } from './components/ProductGrid';
import { CartPanel } from './components/CartPanel';
import { CheckoutModal } from './components/CheckoutModal';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';
import { OrdersHistoryView } from './components/OrdersHistoryView';
import { CustomersView } from './components/CustomersView';
import { SuppliersView } from './components/SuppliersView';
import { HeldCartsModal } from './components/cart/HeldCartsModal';
import { SalesReturnModal } from './components/orders/SalesReturnModal';
import { CashDrawerModal } from './components/orders/CashDrawerModal';
import { useAuthSession } from './hooks/useAuthSession';
import { useCart } from './hooks/useCart';
import { useDrawerShift } from './hooks/useDrawerShift';
import type { ProductItem, InvoiceData, CustomerItem } from './types/pos.types';

const API_BASE = 'http://localhost:5000/api/v1';

export default function App() {
  const auth = useAuthSession();
  const {
    cart,
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
  } = useCart();

  const { activeShift, setActiveShift, refreshShift } = useDrawerShift(auth.currentUser?.tenantId);

  // Active Store Tab & Modals State
  const [activeTab, setActiveTab] = useState<PosActiveTab>('pos');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<InvoiceData | null>(null);
  const [isHeldCartsOpen, setIsHeldCartsOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isDrawerModalOpen, setIsDrawerModalOpen] = useState(false);

  // Search & Catalog State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['ALL']);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);

  // Fetch Catalog & Customers dynamically
  const fetchCatalog = useCallback((tenantId: string) => {
    axios
      .get(`${API_BASE}/catalog/products?tenantId=${tenantId}`)
      .then((res) => {
        if (Array.isArray(res.data?.data)) {
          setProducts(
            res.data.data.map((p: any) => ({
              id: p._id || p.id,
              name: p.name,
              category: p.category,
              barcode: p.barcode,
              unitPrice: p.unitPrice,
              mrp: p.mrp || p.unitPrice,
              costPrice: p.costPrice || 0,
              taxRatePercent: p.taxRatePercent || 0,
              stock: p.stock,
            }))
          );
        }
      })
      .catch(() => {});

    axios
      .get(`${API_BASE}/catalog/categories?tenantId=${tenantId}`)
      .then((res) => {
        if (Array.isArray(res.data?.data)) {
          setCategories(['ALL', ...res.data.data.map((c: any) => c.name)]);
        }
      })
      .catch(() => {});
  }, []);

  const fetchCustomers = useCallback((tenantId: string) => {
    axios
      .get(`${API_BASE}/customers?tenantId=${tenantId}`)
      .then((res) => {
        if (Array.isArray(res.data?.data)) setCustomers(res.data.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (auth.currentUser?.tenantId) {
      fetchCatalog(auth.currentUser.tenantId);
      fetchCustomers(auth.currentUser.tenantId);
    }
  }, [auth.currentUser?.tenantId, fetchCatalog, fetchCustomers]);

  // Finalize POS Order
  const handleFinalizeBill = async (
    paymentMode: 'CASH' | 'UPI' | 'CARD' | 'CREDIT',
    cashTendered: number,
    customer?: CustomerItem | null
  ) => {
    try {
      let finalInvoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      if (auth.currentUser?.tenantId) {
        const orderPayload = {
          tenantId: auth.currentUser.tenantId,
          outletId: auth.currentUser.outletIds?.[0],
          cashierName: auth.currentUser.fullName || auth.currentUser.username || 'Cashier',
          customerId: customer?.id || undefined,
          customerName: customer?.name || undefined,
          customerPhone: customer?.phone || undefined,
          items: cart.map((item) => ({
            productId: item.id,
            name: item.name,
            barcode: item.barcode,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRatePercent: item.taxRatePercent,
            taxAmount: Math.round(((item.unitPrice * item.quantity * item.taxRatePercent) / 100) * 100) / 100,
            total: Math.round(item.unitPrice * item.quantity * (1 + item.taxRatePercent / 100)),
          })),
          subTotal,
          taxTotal,
          cgst: taxTotal / 2,
          sgst: taxTotal / 2,
          grandTotal,
          paymentMode,
          cashTendered: paymentMode === 'CASH' ? cashTendered : grandTotal,
          changeDue: paymentMode === 'CASH' ? Math.max(0, cashTendered - grandTotal) : 0,
        };

        const res = await axios.post(`${API_BASE}/orders`, orderPayload, {
          headers: auth.authToken ? { Authorization: `Bearer ${auth.authToken}` } : {},
        });

        if (res.data?.order?.invoiceNumber) {
          finalInvoiceNumber = res.data.order.invoiceNumber;
        }

        fetchCatalog(auth.currentUser.tenantId);
        fetchCustomers(auth.currentUser.tenantId);
        refreshShift();
      }

      setCompletedInvoice({
        invoiceNumber: finalInvoiceNumber,
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN'),
        cashier: auth.currentUser?.fullName || auth.currentUser?.username || 'Cashier',
        terminal: 'OUT-01',
        shopName: auth.currentUser?.businessName || 'Vendora Retail Store',
        shopId: auth.currentUser?.shopId || 'shop',
        customerId: customer?.id,
        customerName: customer?.name,
        customerPhone: customer?.phone,
        items: [...cart],
        subTotal,
        cgst: taxTotal / 2,
        sgst: taxTotal / 2,
        grandTotal,
        paymentMode,
        cashTendered: paymentMode === 'CASH' ? cashTendered : grandTotal,
        changeDue: paymentMode === 'CASH' ? Math.max(0, cashTendered - grandTotal) : 0,
      });

      setIsCheckoutOpen(false);
      clearCart();
      setSelectedCustomer(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit order to server.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === 'ALL' || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  if (!auth.isAuthenticated && !auth.mustChangePassword) {
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
        onSignOut={() => {
          auth.handleSignOut();
          setSelectedCustomer(null);
          setActiveTab('pos');
        }}
        activeShift={activeShift}
        onOpenDrawer={() => setIsDrawerModalOpen(true)}
        onOpenReturns={() => setIsReturnModalOpen(true)}
        heldCartsCount={heldCarts.length}
        onOpenHeldCarts={() => setIsHeldCartsOpen(true)}
      />

      {/* 2. Operational Views */}
      {activeTab === 'pos' && (
        <div className="flex-1 flex flex-col overflow-hidden">
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
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onClearCart={clearCart}
              onProceedCheckout={() => setIsCheckoutOpen(true)}
              onHoldCart={() => holdCurrentCart(selectedCustomer)}
              heldCartsCount={heldCarts.length}
              onOpenHeldCarts={() => setIsHeldCartsOpen(true)}
            />
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <OrdersHistoryView
          tenantId={auth.currentUser?.tenantId}
          authToken={auth.authToken}
          shopName={auth.currentUser?.businessName || 'Vendora Retail Store'}
          shopId={auth.currentUser?.shopId || 'shop'}
          onReprintInvoice={(inv) => setCompletedInvoice(inv)}
        />
      )}

      {activeTab === 'customers' && (
        <CustomersView
          tenantId={auth.currentUser?.tenantId}
          authToken={auth.authToken}
          shopName={auth.currentUser?.businessName || 'Vendora Retail Store'}
        />
      )}

      {activeTab === 'suppliers' && (
        <SuppliersView
          tenantId={auth.currentUser?.tenantId}
          authToken={auth.authToken}
          products={products}
          onInwardStockCompleted={() => {
            if (auth.currentUser?.tenantId) fetchCatalog(auth.currentUser.tenantId);
          }}
        />
      )}

      {/* 3. Modals */}
      <CheckoutModal
        grandTotal={grandTotal}
        isOpen={isCheckoutOpen}
        customers={customers}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={setSelectedCustomer}
        onClose={() => setIsCheckoutOpen(false)}
        onFinalize={handleFinalizeBill}
      />

      {completedInvoice && (
        <ThermalReceiptModal
          invoice={completedInvoice}
          onClose={() => setCompletedInvoice(null)}
          onNewSale={() => {
            setCompletedInvoice(null);
            clearCart();
          }}
        />
      )}

      {auth.mustChangePassword && (
        <PasswordResetModal
          newPassword={auth.newPassword}
          setNewPassword={auth.setNewPassword}
          confirmPassword={auth.confirmPassword}
          setConfirmPassword={auth.setConfirmPassword}
          passwordError={auth.passwordError}
          isUpdatingPassword={auth.isUpdatingPassword}
          onSubmit={auth.handleChangePassword}
        />
      )}

      <HeldCartsModal
        isOpen={isHeldCartsOpen}
        onClose={() => setIsHeldCartsOpen(false)}
        heldCarts={heldCarts}
        onResumeCart={(c) => {
          resumeCart(c);
          setIsHeldCartsOpen(false);
        }}
        onDiscardCart={discardHeldCart}
      />

      {auth.currentUser?.tenantId && (
        <>
          <SalesReturnModal
            isOpen={isReturnModalOpen}
            onClose={() => setIsReturnModalOpen(false)}
            tenantId={auth.currentUser.tenantId}
            cashierName={auth.currentUser.fullName || auth.currentUser.username || 'Cashier'}
            onReturnSuccess={() => {
              if (auth.currentUser?.tenantId) {
                fetchCatalog(auth.currentUser.tenantId);
                fetchCustomers(auth.currentUser.tenantId);
                refreshShift();
              }
            }}
          />

          <CashDrawerModal
            isOpen={isDrawerModalOpen}
            onClose={() => setIsDrawerModalOpen(false)}
            tenantId={auth.currentUser.tenantId}
            cashierName={auth.currentUser.fullName || auth.currentUser.username || 'Cashier'}
            onShiftChange={setActiveShift}
          />
        </>
      )}
    </div>
  );
}
