import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShoppingCart, 
  Barcode, 
  Trash, 
  Printer, 
  CreditCard, 
  DeviceMobile, 
  Money, 
  SignOut, 
  MagnifyingGlass, 
  CheckCircle, 
  Plus, 
  Minus,
  ArrowRight,
  ShieldCheck, 
  ArrowCounterClockwise,
  Key,
  WarningCircle
} from '@phosphor-icons/react';

interface CartItem {
  id: string;
  name: string;
  barcode: string;
  unitPrice: number;
  quantity: number;
  taxRatePercent: number;
}

interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  shopId: string;
  businessName: string;
  outletIds: string[];
}

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
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [completedInvoice, setCompletedInvoice] = useState<any>(null);

  // Check URL query parameters for prefilled shopId
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get('shopId');
    if (shop) {
      setShopId(shop);
      setUsername(`${shop}_admin`);
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

  const sampleProducts = [
    { id: '1', name: 'Aambal Handwash 2 x 300ml Combo', category: 'FMCG', barcode: '890103001', unitPrice: 115, mrp: 115, taxRatePercent: 0 },
    { id: '2', name: 'Aditi Chakki Fresh Atta 1kg', category: 'Grocery', barcode: '890172518', unitPrice: 55, mrp: 73, taxRatePercent: 0 },
    { id: '3', name: 'Bakers Al Faham Masala 80gm', category: 'Spices', barcode: '890600123', unitPrice: 75, mrp: 80, taxRatePercent: 5 },
    { id: '4', name: 'Tata Tea Gold Leaf 500g', category: 'Beverages', barcode: '890105885', unitPrice: 320, mrp: 350, taxRatePercent: 5 },
    { id: '5', name: 'Parle-G Gold Biscuits 1kg', category: 'FMCG', barcode: '890171910', unitPrice: 120, mrp: 140, taxRatePercent: 18 },
    { id: '6', name: 'Fortune Sunlite Refined Oil 1L', category: 'Grocery', barcode: '890600728', unitPrice: 145, mrp: 165, taxRatePercent: 5 },
    { id: '7', name: 'Cadbury Dairy Milk Silk 150g', category: 'Confectionery', barcode: '890123302', unitPrice: 175, mrp: 180, taxRatePercent: 18 },
    { id: '8', name: 'Surf Excel Quick Wash 1kg', category: 'FMCG', barcode: '890103039', unitPrice: 140, mrp: 155, taxRatePercent: 18 },
  ];

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
      await axios.post(
        `${API_BASE}/auth/change-password`,
        {
          currentPassword: password,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

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

  const handleAddToCart = (product: typeof sampleProducts[0]) => {
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
          quantity: 1,
          taxRatePercent: product.taxRatePercent,
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

  const subTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const taxTotal = cart.reduce(
    (sum, item) => sum + (item.unitPrice * item.quantity * item.taxRatePercent) / 100,
    0
  );
  const grandTotal = Math.round(subTotal + taxTotal);
  const changeDue = Math.max(0, cashTendered - grandTotal);

  const handleFinalizeBill = () => {
    const invoice = {
      invoiceNumber: `BR01-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('en-IN'),
      billedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      items: [...cart],
      subTotal,
      taxTotal,
      grandTotal,
      paymentMode,
      cashTendered: paymentMode === 'CASH' ? cashTendered : grandTotal,
      changeDue: paymentMode === 'CASH' ? changeDue : 0,
    };

    setCompletedInvoice(invoice);
    setIsCheckoutOpen(false);
    setCart([]);
  };

  // FIRST LOGIN MANDATORY PASSWORD RESET DIALOG
  if (mustChangePassword) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white border border-zinc-200 rounded-md max-w-md w-full p-8 animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-md bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mb-4">
            <Key weight="duotone" className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-black text-zinc-950">Set Permanent Password</h2>
          <p className="text-xs text-zinc-500 mt-1 mb-5 leading-relaxed">
            Welcome to Vendora! Because this is your first time logging in with a temporary password, you must create a new secure permanent password to unlock the store counter.
          </p>

          {passwordError && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-1.5">
              <WarningCircle weight="bold" className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">New Permanent Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-3 py-2 rounded-md border border-zinc-300 text-xs sm:text-sm focus:border-red-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full px-3 py-2 rounded-md border border-zinc-300 text-xs sm:text-sm focus:border-red-600 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full py-2.5 rounded-md bg-red-600 hover:bg-red-700 disabled:bg-zinc-300 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>{isUpdatingPassword ? 'Saving Password...' : 'Save & Enter Counter'}</span>
              <ArrowRight weight="bold" className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // IF NOT AUTHENTICATED: RENDER SIGN IN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white border border-zinc-200 rounded-md max-w-md w-full p-8 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100">
            <img
              src="/assets/vendora_logo.png"
              alt="Vendora Logo"
              className="h-10 w-auto object-contain"
            />
            <div>
              <h2 className="text-xl font-black text-zinc-950 leading-tight">Vendora POS Terminal</h2>
              <p className="text-xs text-zinc-500 font-medium">Merchant Shop Portal (Port 4001)</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-black text-zinc-950">Sign in</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Enter your shop credentials to access the billing counter
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-1.5">
              <WarningCircle weight="bold" className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">Customer / Shop ID</label>
              <input
                type="text"
                required
                value={shopId}
                onChange={(e) => setShopId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="srimurugan"
                className="w-full px-3 py-2 rounded-md border border-zinc-300 text-xs sm:text-sm font-mono focus:border-red-600 outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="srimurugan_admin"
                className="w-full px-3 py-2 rounded-md border border-zinc-300 text-xs sm:text-sm focus:border-red-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 rounded-md border border-zinc-300 text-xs sm:text-sm focus:border-red-600 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 rounded-md bg-red-600 hover:bg-red-700 disabled:bg-zinc-300 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>{isLoggingIn ? 'Verifying...' : 'Sign In to Terminal'}</span>
              <ArrowRight weight="bold" className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-400">
            <a href="http://localhost:4000" className="hover:text-red-600 transition-colors">
              ← Back to Marketing Site (Port 4000)
            </a>
            <span className="font-mono">v1.0.0</span>
          </div>
        </div>
      </div>
    );
  }

  // IF AUTHENTICATED: RENDER CORE POS BILLING COUNTER
  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col font-sans text-zinc-950 w-full">
      {/* Top Header */}
      <header className="bg-zinc-950 text-white px-4 sm:px-6 h-14 flex items-center justify-between shrink-0 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <img
            src="/assets/vendora_logo.png"
            alt="Vendora Logo"
            className="h-8 w-auto object-contain"
          />
          <div>
            <span className="font-bold text-sm tracking-tight text-white uppercase">
              {currentUser?.businessName || shopId || 'MAIN STORE'}
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-900 text-red-400 border border-zinc-800">
              Terminal: POS-01 • {currentUser?.shopId || shopId}.vendora.com
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 text-zinc-300">
            <ShieldCheck weight="bold" className="w-4 h-4 text-red-500" />
            <span>
              {currentUser?.fullName || username} (
              <strong className="text-red-400">{currentUser?.role || 'CASHIER'}</strong>
              )
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1.5 text-xs font-medium cursor-pointer border border-zinc-800"
          >
            <SignOut weight="bold" className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Counter Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Section: Product Search & Catalog Grid */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto flex flex-col">
          {/* Barcode Search Bar */}
          <div className="mb-3.5 flex items-center gap-2.5">
            <div className="relative flex-1">
              <MagnifyingGlass className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Scan Barcode or Search Item by Name / SKU (e.g. Atta, Tea, Handwash)..."
                className="w-full pl-9 pr-3 py-2 rounded-md border border-zinc-300 bg-white text-xs sm:text-sm focus:border-red-600 outline-none"
              />
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-md bg-white border border-zinc-200 text-zinc-700 text-xs font-mono">
              <Barcode weight="bold" className="w-4 h-4 text-red-600" />
              <span>Laser HID Ready</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3.5 scrollbar-none">
            {['ALL', 'Grocery', 'FMCG', 'Beverages', 'Spices', 'Confectionery'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors border ${
                  activeCategory === cat
                    ? 'bg-zinc-950 text-white border-zinc-950'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {sampleProducts
              .filter(
                (p) =>
                  (activeCategory === 'ALL' || p.category === activeCategory) &&
                  (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery)),
              )
              .map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleAddToCart(product)}
                  className="bg-white p-3 rounded-md border border-zinc-200 hover:border-zinc-400 transition-all cursor-pointer flex flex-col justify-between select-none"
                >
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-zinc-400 font-mono">{product.category}</span>
                      <span className="text-[10px] font-semibold text-zinc-700 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded-md">
                        GST {product.taxRatePercent}%
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-zinc-950 line-clamp-2 leading-snug">{product.name}</h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-100 flex items-baseline justify-between">
                    <div>
                      <span className="font-black text-sm text-zinc-950">₹{product.unitPrice}</span>
                      {product.mrp > product.unitPrice && (
                        <span className="text-[10px] text-zinc-400 line-through ml-1.5">₹{product.mrp}</span>
                      )}
                    </div>
                    <span className="w-6 h-6 rounded-md bg-red-50 text-red-600 border border-red-200 flex items-center justify-center font-bold text-xs">
                      +
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Right Section: Active Cart & Checkout */}
        <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-zinc-200 flex flex-col justify-between shrink-0">
          {/* Cart Header */}
          <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart weight="bold" className="w-4 h-4 text-red-600" />
              <span className="font-bold text-sm text-zinc-950">Current Cart</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 font-bold border border-zinc-200">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>

            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ArrowCounterClockwise weight="bold" className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-2.5 max-h-[45vh] lg:max-h-none">
            {cart.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-zinc-400">
                <Barcode weight="bold" className="w-8 h-8 mb-2 opacity-40 text-red-600" />
                <p className="text-xs font-semibold">Your cart is empty</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Click products or scan barcodes to begin</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="p-2.5 rounded-md border border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs">
                  <div className="flex-1 pr-2">
                    <p className="font-bold text-zinc-950 line-clamp-1">{item.name}</p>
                    <p className="text-[10px] text-zinc-500">₹{item.unitPrice} each</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center border border-zinc-300 rounded-md bg-white overflow-hidden">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="px-2 py-1 hover:bg-zinc-100 text-zinc-600 cursor-pointer"
                      >
                        <Minus weight="bold" className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-bold font-mono text-zinc-900">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="px-2 py-1 hover:bg-zinc-100 text-zinc-600 cursor-pointer"
                      >
                        <Plus weight="bold" className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-bold text-zinc-950 w-14 text-right">
                      ₹{item.unitPrice * item.quantity}
                    </span>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-zinc-400 hover:text-red-600 ml-1 cursor-pointer"
                    >
                      <Trash weight="bold" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bill Summary & Payment Trigger */}
          <div className="p-4 bg-zinc-50 border-t border-zinc-200 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span>₹{subTotal}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Tax (GST Included)</span>
              <span>₹{taxTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black text-base text-zinc-950 pt-2 border-t border-zinc-200">
              <span>Payable Amount</span>
              <span className="text-red-600">₹{grandTotal}</span>
            </div>

            <button
              onClick={() => {
                setCashTendered(grandTotal);
                setIsCheckoutOpen(true);
              }}
              disabled={cart.length === 0}
              className="w-full mt-2 py-2.5 rounded-md bg-red-600 hover:bg-red-700 disabled:bg-zinc-300 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CreditCard weight="bold" className="w-4 h-4" />
              <span>Checkout • ₹{grandTotal}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-md border border-zinc-300 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-200">
              <h3 className="font-bold text-base text-zinc-950">Complete Payment</h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="w-6 h-6 rounded-md bg-zinc-100 text-zinc-600 flex items-center justify-center cursor-pointer border border-zinc-200"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="text-center py-2 bg-zinc-50 rounded-md border border-zinc-200">
                <span className="text-xs text-zinc-500 font-medium">Total Bill Amount</span>
                <p className="text-3xl font-black text-red-600 mt-0.5">₹{grandTotal}</p>
              </div>

              {/* Tender Type Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">Select Payment Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'CASH', label: 'Cash', icon: Money },
                    { id: 'UPI', label: 'UPI QR', icon: DeviceMobile },
                    { id: 'CARD', label: 'Card / POS', icon: CreditCard },
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const isSel = paymentMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => setPaymentMode(mode.id as any)}
                        className={`p-2.5 rounded-md border flex flex-col items-center gap-1 font-bold text-xs cursor-pointer transition-all ${
                          isSel
                            ? 'border-2 border-red-600 bg-red-50 text-red-700'
                            : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                        }`}
                      >
                        <Icon weight="duotone" className="w-5 h-5" />
                        <span>{mode.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cash Tender Calculation */}
              {paymentMode === 'CASH' && (
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-bold text-zinc-800">Cash Received from Customer</label>
                  <input
                    type="number"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(Number(e.target.value))}
                    className="w-full text-center text-xl font-bold py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none"
                  />
                  <div className="flex justify-between text-xs font-bold pt-1">
                    <span className="text-zinc-500">Change Return:</span>
                    <span className={changeDue > 0 ? 'text-red-600 font-mono text-sm' : 'text-zinc-700'}>
                      ₹{changeDue}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleFinalizeBill}
              className="w-full py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Printer weight="bold" className="w-4 h-4" />
              <span>Finalize & Print Receipt</span>
            </button>
          </div>
        </div>
      )}

      {/* Completed Invoice Printable Receipt Modal */}
      {completedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-md border border-zinc-300 max-w-sm w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-200">
              <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                <CheckCircle weight="fill" className="w-4 h-4" /> Bill Finalized
              </span>
              <button
                onClick={() => setCompletedInvoice(null)}
                className="w-6 h-6 rounded-md bg-zinc-100 text-zinc-600 flex items-center justify-center cursor-pointer text-xs border border-zinc-200"
              >
                ✕
              </button>
            </div>

            <div className="my-4 p-4 rounded-md border border-zinc-200 font-mono text-[11px] bg-zinc-50 text-zinc-900 leading-tight">
              <div className="text-center pb-2 border-b border-dashed border-zinc-300">
                <p className="font-bold text-xs uppercase">{currentUser?.businessName || shopId || 'VENDORA RETAIL'}</p>
                <p className="text-[10px] text-zinc-500">{completedInvoice.invoiceNumber}</p>
                <p className="text-[10px] text-zinc-500">{completedInvoice.date} • {completedInvoice.billedAt}</p>
              </div>

              <div className="py-2.5 border-b border-dashed border-zinc-300 space-y-1.5">
                {completedInvoice.items.map((it: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span className="line-clamp-1 max-w-[170px]">{it.name} (x{it.quantity})</span>
                    <span className="font-bold">₹{it.unitPrice * it.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 space-y-1 text-zinc-700">
                <div className="flex justify-between font-bold text-xs text-zinc-950">
                  <span>TOTAL</span>
                  <span className="text-red-600">₹{completedInvoice.grandTotal}</span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Tender Mode</span>
                  <span>{completedInvoice.paymentMode}</span>
                </div>
                {completedInvoice.changeDue > 0 && (
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>Change Returned</span>
                    <span>₹{completedInvoice.changeDue}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer weight="bold" className="w-3.5 h-3.5" />
                <span>Thermal Print</span>
              </button>
              <button
                onClick={() => setCompletedInvoice(null)}
                className="px-4 py-2 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs cursor-pointer border border-zinc-200"
              >
                Next Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
