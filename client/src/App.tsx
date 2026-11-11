import { useState, useEffect } from 'react';
import axios from 'axios';
import { LoginScreen } from './components/LoginScreen';
import { PasswordResetModal } from './components/PasswordResetModal';
import { PosHeader } from './components/PosHeader';
import { CategoryBar } from './components/CategoryBar';
import { ProductGrid } from './components/ProductGrid';
import { CartPanel } from './components/CartPanel';
import { CheckoutModal } from './components/CheckoutModal';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';
import type { CartItem, ProductItem, AuthUser, InvoiceData } from './types/pos.types';

const API_BASE = 'http://localhost:5000/api/v1';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

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

  // Starter Retail Products Catalog
  const sampleProducts: ProductItem[] = [
    { id: '1', name: 'Aambal Handwash 2 x 300ml Combo', category: 'FMCG', barcode: '890103001', unitPrice: 115, mrp: 115, taxRatePercent: 0 },
    { id: '2', name: 'Aditi Chakki Fresh Atta 1kg', category: 'Grocery', barcode: '890172518', unitPrice: 55, mrp: 73, taxRatePercent: 0 },
    { id: '3', name: 'Bakers Al Faham Masala 80gm', category: 'Spices', barcode: '890600123', unitPrice: 75, mrp: 80, taxRatePercent: 5 },
    { id: '4', name: 'Tata Tea Gold Leaf 500g', category: 'Beverages', barcode: '890105885', unitPrice: 320, mrp: 350, taxRatePercent: 5 },
    { id: '5', name: 'Parle-G Gold Biscuits 1kg', category: 'FMCG', barcode: '890171910', unitPrice: 120, mrp: 140, taxRatePercent: 18 },
    { id: '6', name: 'Fortune Sunlite Refined Oil 1L', category: 'Grocery', barcode: '890600728', unitPrice: 145, mrp: 165, taxRatePercent: 5 },
    { id: '7', name: 'Cadbury Dairy Milk Silk 150g', category: 'Confectionery', barcode: '890123302', unitPrice: 175, mrp: 180, taxRatePercent: 18 },
    { id: '8', name: 'Surf Excel Quick Wash 1kg', category: 'FMCG', barcode: '890103039', unitPrice: 140, mrp: 155, taxRatePercent: 18 },
    { id: '9', name: 'Aashirvaad Select Sharbati Atta 5kg', category: 'Grocery', barcode: '890103042', unitPrice: 295, mrp: 320, taxRatePercent: 0 },
    { id: '10', name: 'Bru Instant Coffee 200g Pouch', category: 'Beverages', barcode: '890103055', unitPrice: 210, mrp: 230, taxRatePercent: 5 },
    { id: '11', name: 'Everest Turmeric Powder 500g', category: 'Spices', barcode: '890103067', unitPrice: 110, mrp: 125, taxRatePercent: 5 },
    { id: '12', name: 'Amul Pasteurised Butter 500g', category: 'Dairy', barcode: '890103088', unitPrice: 275, mrp: 285, taxRatePercent: 5 },
  ];

  const categories = ['ALL', 'FMCG', 'Grocery', 'Spices', 'Beverages', 'Confectionery', 'Dairy'];

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
      // Fallback demo login if server is offline or mock login testing
      if (shopId === 'srimurugan' && password.startsWith('Vn')) {
        const mockUser: AuthUser = {
          id: 'user-demo-1',
          username: username.trim(),
          fullName: 'Pandi Selvam',
          email: 'pandi@srimurugan.in',
          role: 'OWNER',
          shopId: 'srimurugan',
          businessName: 'Sri Murugan Supermarket',
          outletIds: ['out-1'],
        };
        setCurrentUser(mockUser);
        setAuthToken('mock_jwt_token_2026');
        localStorage.setItem('vendora_token', 'mock_jwt_token_2026');
        localStorage.setItem('vendora_user', JSON.stringify(mockUser));
        setMustChangePassword(true);
      } else {
        const msg = err.response?.data?.message || 'Login failed. Please verify your Shop ID and credentials.';
        setLoginError(msg);
      }
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
      if (authToken && authToken !== 'mock_jwt_token_2026') {
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

  const handleFinalizeBill = (paymentMode: 'CASH' | 'UPI' | 'CARD', cashTendered: number) => {
    const invoice: InvoiceData = {
      invoiceNumber: `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN'),
      cashier: currentUser?.fullName || currentUser?.username || 'Cashier',
      terminal: 'OUT-01',
      shopName: currentUser?.businessName || 'Vendora Retail Store',
      shopId: currentUser?.shopId || 'shop',
      items: [...cart],
      subTotal,
      cgst: taxTotal / 2,
      sgst: taxTotal / 2,
      grandTotal,
      paymentMode,
      cashTendered,
      changeDue: Math.max(0, cashTendered - grandTotal),
    };

    setCompletedInvoice(invoice);
    setIsCheckoutOpen(false);
    setCart([]);
  };

  const handleNewSale = () => {
    setCompletedInvoice(null);
    setCart([]);
  };

  // Filter products by active category & search query
  const filteredProducts = sampleProducts.filter((p) => {
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
      {/* 2. Top POS Bar */}
      <PosHeader currentUser={currentUser} onSignOut={handleSignOut} />

      {/* 3. Category Horizontal Pills */}
      <CategoryBar
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* 4. Main POS Workspace: Product Grid + Cart Register */}
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

      {/* 5. Checkout Payment Tender Modal */}
      <CheckoutModal
        grandTotal={grandTotal}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onFinalize={handleFinalizeBill}
      />

      {/* 6. Thermal Receipt Modal */}
      {completedInvoice && (
        <ThermalReceiptModal
          invoice={completedInvoice}
          onClose={() => setCompletedInvoice(null)}
          onNewSale={handleNewSale}
        />
      )}

      {/* 7. First-Login Password Reset Modal */}
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
