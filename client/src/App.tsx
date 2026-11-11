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
import type {
  CartItem,
  ProductItem,
  AuthUser,
  InvoiceData,
  CustomerItem,
} from './types/pos.types';

const API_BASE = 'http://localhost:5000/api/v1';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Active Store Operations Tab
  const [activeTab, setActiveTab] = useState<PosActiveTab>('pos');

  // Sign In form state
  const [shopId, setShopId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // First-Login Password Reset State
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // POS Billing State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<InvoiceData | null>(null);

  // Customers & Catalog State
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['ALL']);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);

  // Check URL query parameters for prefilled shopId
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get('shopId');
    if (shop) {
      const clean = shop.toLowerCase().trim();
      setShopId(clean);
      setUsername(`${clean}_admin`);
    }

    // Restore saved session from localStorage if present
    const savedToken = localStorage.getItem('vendora_token');
    const savedUser = localStorage.getItem('vendora_user');
    if (savedToken && savedUser) {
      try {
        const userObj = JSON.parse(savedUser);
        setAuthToken(savedToken);
        setCurrentUser(userObj);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('vendora_token');
        localStorage.removeItem('vendora_user');
      }
    }
  }, []);

  // Fetch tenant-specific products and categories dynamically from MongoDB
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
          const catNames = res.data.data.map((c: any) => c.name);
          setCategories(['ALL', ...catNames]);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Customers dynamically
  const fetchCustomers = useCallback((tenantId: string) => {
    axios
      .get(`${API_BASE}/customers?tenantId=${tenantId}`)
      .then((res) => {
        if (Array.isArray(res.data?.data)) {
          setCustomers(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (currentUser?.tenantId) {
      fetchCatalog(currentUser.tenantId);
      fetchCustomers(currentUser.tenantId);
    }
  }, [currentUser?.tenantId, fetchCatalog, fetchCustomers]);

  // Handle Multi-Tenant API Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    if (!shopId.trim() || !username.trim() || !password.trim()) {
      setLoginError('Please enter Shop ID, Username, and Password');
      setIsLoggingIn(false);
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        shopId: shopId.trim(),
        username: username.trim(),
        password: password.trim(),
      });

      const data = res.data?.data;
      if (data?.accessToken && data?.user) {
        setAuthToken(data.accessToken);
        setCurrentUser(data.user);
        localStorage.setItem('vendora_token', data.accessToken);
        localStorage.setItem('vendora_user', JSON.stringify(data.user));

        if (data.mustChangePassword) {
          setMustChangePassword(true);
        } else {
          setIsAuthenticated(true);
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please verify your Shop ID and credentials.';
      setLoginError(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle First-Login Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      if (authToken) {
        await axios.post(
          `${API_BASE}/auth/change-password`,
          { currentPassword: password, newPassword },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
      }
      setMustChangePassword(false);
      setIsAuthenticated(true);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = () => {
    localStorage.removeItem('vendora_token');
    localStorage.removeItem('vendora_user');
    setAuthToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setPassword('');
    setSelectedCustomer(null);
    setActiveTab('pos');
  };

  // Cart operations
  const handleAddToCart = (product: ProductItem) => {
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
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
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
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const subTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const taxTotal = cart.reduce(
    (sum, item) => sum + (item.unitPrice * item.quantity * item.taxRatePercent) / 100,
    0
  );
  const grandTotal = Math.round(subTotal + taxTotal);

  // Finalize POS Order with Customer Tagging & Multi-Tender Support (Cash, UPI, Card, Credit)
  const handleFinalizeBill = async (
    paymentMode: 'CASH' | 'UPI' | 'CARD' | 'CREDIT',
    cashTendered: number,
    customer?: CustomerItem | null
  ) => {
    try {
      let finalInvoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      if (currentUser?.tenantId) {
        const orderPayload = {
          tenantId: currentUser.tenantId,
          outletId: currentUser.outletIds?.[0],
          cashierName: currentUser.fullName || currentUser.username || 'Cashier',
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
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        });

        if (res.data?.order?.invoiceNumber) {
          finalInvoiceNumber = res.data.order.invoiceNumber;
        }

        // Re-fetch catalog to reflect stock deduction
        fetchCatalog(currentUser.tenantId);

        // Re-fetch customers to reflect updated Khata balance & spent volume
        fetchCustomers(currentUser.tenantId);
      }

      const invoice: InvoiceData = {
        invoiceNumber: finalInvoiceNumber,
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN'),
        cashier: currentUser?.fullName || currentUser?.username || 'Cashier',
        terminal: 'OUT-01',
        shopName: currentUser?.businessName || 'Vendora Retail Store',
        shopId: currentUser?.shopId || 'shop',
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
      };

      setCompletedInvoice(invoice);
      setIsCheckoutOpen(false);
      setCart([]);
      setSelectedCustomer(null);
    } catch (err: any) {
      console.error('Failed to persist order:', err);
      alert(err.response?.data?.message || 'Failed to submit order to server. Please try again.');
    }
  };

  const handleNewSale = () => {
    setCompletedInvoice(null);
    setCart([]);
  };

  // Filter products by active category & search query
  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === 'ALL' || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  // 1. If not authenticated, render Login Screen
  if (!isAuthenticated && !mustChangePassword) {
    return (
      <LoginScreen
        shopId={shopId}
        setShopId={setShopId}
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        loginError={loginError}
        isLoggingIn={isLoggingIn}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-100 font-sans select-none overflow-hidden">
      {/* 2. Top POS & Operations Command Bar */}
      <PosHeader
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSignOut={handleSignOut}
      />

      {/* 3. Conditional Operational View Rendering */}
      {activeTab === 'pos' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Category Horizontal Pills */}
          <CategoryBar
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />

          {/* Main POS Workspace: Product Grid + Cart Register */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left: Product Catalog Grid */}
            <ProductGrid
              products={filteredProducts}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onAddToCart={handleAddToCart}
            />

            {/* Right: Cart & Billing Register */}
            <CartPanel
              cart={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onProceedCheckout={() => setIsCheckoutOpen(true)}
            />
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <OrdersHistoryView
          tenantId={currentUser?.tenantId}
          authToken={authToken}
          shopName={currentUser?.businessName || 'Vendora Retail Store'}
          shopId={currentUser?.shopId || 'shop'}
          onReprintInvoice={(inv) => setCompletedInvoice(inv)}
        />
      )}

      {activeTab === 'customers' && (
        <CustomersView
          tenantId={currentUser?.tenantId}
          authToken={authToken}
          shopName={currentUser?.businessName || 'Vendora Retail Store'}
        />
      )}

      {activeTab === 'suppliers' && (
        <SuppliersView
          tenantId={currentUser?.tenantId}
          authToken={authToken}
          products={products}
          onInwardStockCompleted={() => {
            if (currentUser?.tenantId) {
              fetchCatalog(currentUser.tenantId);
            }
          }}
        />
      )}

      {/* 4. Checkout Payment Tender Modal */}
      <CheckoutModal
        grandTotal={grandTotal}
        isOpen={isCheckoutOpen}
        customers={customers}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={setSelectedCustomer}
        onClose={() => setIsCheckoutOpen(false)}
        onFinalize={handleFinalizeBill}
      />

      {/* 5. Thermal Receipt Modal */}
      {completedInvoice && (
        <ThermalReceiptModal
          invoice={completedInvoice}
          onClose={() => setCompletedInvoice(null)}
          onNewSale={handleNewSale}
        />
      )}

      {/* 6. First-Login Password Reset Modal */}
      {mustChangePassword && (
        <PasswordResetModal
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          passwordError={passwordError}
          isUpdatingPassword={isUpdatingPassword}
          onSubmit={handleChangePassword}
        />
      )}
    </div>
  );
}
