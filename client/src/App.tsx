import { useState, useEffect } from 'react';
import { 
  Store, 
  ShoppingCart, 
  Barcode, 
  Trash2, 
  Printer, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  LogOut, 
  Search, 
  CheckCircle2, 
  Plus, 
  Minus,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  barcode: string;
  unitPrice: number;
  quantity: number;
  taxRatePercent: number;
}

export default function App() {
  // Authentication & session state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [shopId, setShopId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // POS State
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
  }, []);

  // Demo products catalog tailored for quick retail billing
  const sampleProducts = [
    { id: '1', name: 'Aambal Handwash 2 x 300ml Combo', category: 'FMCG', barcode: '890103001', unitPrice: 115, mrp: 115, taxRatePercent: 0 },
    { id: '2', name: 'Aditi Chakki Fresh Atta 1kg', category: 'Grocery', barcode: '890172518', unitPrice: 55, mrp: 73, taxRatePercent: 0 },
    { id: '3', name: 'Bakers Al Faham Masala 80g', category: 'Spices', barcode: '890123456', unitPrice: 75, mrp: 80, taxRatePercent: 0 },
    { id: '4', name: 'Tata Tea Gold Premium 500g', category: 'Beverages', barcode: '890105200', unitPrice: 290, mrp: 310, taxRatePercent: 5 },
    { id: '5', name: 'Fortune Sunlite Refined Oil 1L', category: 'Grocery', barcode: '890600728', unitPrice: 145, mrp: 165, taxRatePercent: 5 },
    { id: '6', name: 'Aashirvaad Superior Sharbati Atta 5kg', category: 'Grocery', barcode: '890172519', unitPrice: 315, mrp: 340, taxRatePercent: 5 },
    { id: '7', name: 'Cadbury Dairy Milk Silk 150g', category: 'Confectionery', barcode: '762220144', unitPrice: 175, mrp: 185, taxRatePercent: 18 },
    { id: '8', name: 'Surf Excel Quick Wash Detergent 1kg', category: 'FMCG', barcode: '890103002', unitPrice: 220, mrp: 235, taxRatePercent: 18 },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!shopId.trim() || !username.trim() || !password.trim()) {
      setLoginError('Please enter your Shop ID, username, and password.');
      return;
    }
    // Authenticate session
    setIsAuthenticated(true);
  };

  const handleAddToCart = (product: typeof sampleProducts[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
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
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculations
  const subTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const taxTotal = cart.reduce((sum, item) => {
    const itemTotal = item.unitPrice * item.quantity;
    return sum + (itemTotal * item.taxRatePercent) / 100;
  }, 0);
  const grandTotal = Math.round(subTotal + taxTotal);
  const changeDue = Math.max(0, cashTendered - grandTotal);

  const handleFinalizeBill = () => {
    const inv = {
      invoiceNumber: 'INV-2026-' + Math.floor(1000 + Math.random() * 9000),
      billedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(),
      items: [...cart],
      subTotal,
      taxTotal,
      grandTotal,
      paymentMode,
      cashTendered: paymentMode === 'CASH' ? cashTendered : grandTotal,
      changeDue: paymentMode === 'CASH' ? changeDue : 0,
    };
    setCompletedInvoice(inv);
    setIsCheckoutOpen(false);
    setCart([]);
  };

  // IF NOT AUTHENTICATED: RENDER SIGN IN (MATCHING SCREENSHOT #3)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-slate-100 via-rose-50/30 to-indigo-50/40 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/20">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">Vendora POS Terminal</h2>
              <p className="text-xs text-slate-500 font-medium">Merchant Shop Portal (Port 4001)</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-black text-slate-900">Sign in</h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter your shop credentials to access the billing counter
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Customer / Shop ID</label>
              <input
                type="text"
                required
                value={shopId}
                onChange={(e) => setShopId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="srimurugan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:border-brand-500 outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-brand-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-brand-600/30 transition-all cursor-pointer"
            >
              <span>Sign In to Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <a href="http://localhost:4000" className="hover:text-brand-600 transition-colors">
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
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Top Header */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 h-15 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white uppercase">{shopId || 'MAIN STORE'}</span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-brand-300 border border-slate-700">
              Terminal: POS-01 (Main Branch)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cashier: <strong>{username}</strong></span>
          </div>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Counter Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Section: Product Search & Catalog Grid */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col">
          {/* Barcode Search Bar */}
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Scan Barcode or Search Item by Name / SKU (e.g. Atta, Tea, Handwash)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
              />
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-mono">
              <Barcode className="w-4 h-4 text-brand-600" />
              <span>Laser HID Ready</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
            {['ALL', 'Grocery', 'FMCG', 'Beverages', 'Spices', 'Confectionery'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
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
                  className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs hover:border-brand-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between select-none"
                >
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">{product.category}</span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        GST {product.taxRatePercent}%
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">{product.name}</h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                    <div>
                      <span className="font-black text-sm text-slate-900">₹{product.unitPrice}</span>
                      {product.mrp > product.unitPrice && (
                        <span className="text-[10px] text-slate-400 line-through ml-1.5">₹{product.mrp}</span>
                      )}
                    </div>
                    <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                      +
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Right Section: Active Cart & Checkout */}
        <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between shrink-0 shadow-lg">
          {/* Cart Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-brand-600" />
              <span className="font-bold text-sm text-slate-900">Current Cart</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>

            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[45vh] lg:max-h-none">
            {cart.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400">
                <Barcode className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs font-semibold">Your cart is empty</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click products or scan barcodes to begin</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                  <div className="flex-1 pr-2">
                    <p className="font-bold text-slate-900 line-clamp-1">{item.name}</p>
                    <p className="text-[10px] text-slate-500">₹{item.unitPrice} each</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="px-2 py-1 hover:bg-slate-100 text-slate-600 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-bold font-mono text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="px-2 py-1 hover:bg-slate-100 text-slate-600 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-bold text-slate-900 w-14 text-right">
                      ₹{item.unitPrice * item.quantity}
                    </span>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bill Summary & Payment Trigger */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>₹{subTotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax (GST Included)</span>
              <span>₹{taxTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black text-base text-slate-900 pt-2 border-t border-slate-200">
              <span>Payable Amount</span>
              <span>₹{grandTotal}</span>
            </div>

            <button
              onClick={() => {
                setCashTendered(grandTotal);
                setIsCheckoutOpen(true);
              }}
              disabled={cart.length === 0}
              className="w-full mt-3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Checkout • ₹{grandTotal}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Complete Payment</h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="text-center py-2 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Total Bill Amount</span>
                <p className="text-3xl font-black text-slate-900 mt-0.5">₹{grandTotal}</p>
              </div>

              {/* Tender Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Select Payment Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'CASH', label: 'Cash', icon: Banknote },
                    { id: 'UPI', label: 'UPI QR', icon: Smartphone },
                    { id: 'CARD', label: 'Card / POS', icon: CreditCard },
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const isSel = paymentMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => setPaymentMode(mode.id as any)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold text-xs cursor-pointer transition-all ${
                          isSel
                            ? 'border-2 border-brand-600 bg-brand-50 text-brand-700 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{mode.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cash Tender Calculation */}
              {paymentMode === 'CASH' && (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700">Cash Received from Customer</label>
                  <input
                    type="number"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(Number(e.target.value))}
                    className="w-full text-center text-xl font-bold py-2 rounded-xl border border-slate-300 focus:border-brand-500 outline-none"
                  />
                  <div className="flex justify-between text-xs font-bold pt-1">
                    <span className="text-slate-500">Change Return:</span>
                    <span className={changeDue > 0 ? 'text-rose-600 font-mono text-sm' : 'text-slate-700'}>
                      ₹{changeDue}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleFinalizeBill}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Finalize & Print Receipt</span>
            </button>
          </div>
        </div>
      )}

      {/* Completed Invoice Printable Receipt Modal */}
      {completedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Bill Finalized
              </span>
              <button
                onClick={() => setCompletedInvoice(null)}
                className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            {/* Receipt Preview Body (ESC/POS style) */}
            <div className="my-4 p-4 rounded-xl border border-slate-200 font-mono text-[11px] bg-slate-50 text-slate-800 leading-tight">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <p className="font-bold text-xs uppercase">{shopId || 'VENDORA RETAIL'}</p>
                <p className="text-[10px] text-slate-500">{completedInvoice.invoiceNumber}</p>
                <p className="text-[10px] text-slate-500">{completedInvoice.date} • {completedInvoice.billedAt}</p>
              </div>

              <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1.5">
                {completedInvoice.items.map((it: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span className="line-clamp-1 max-w-[170px]">{it.name} (x{it.quantity})</span>
                    <span className="font-bold">₹{it.unitPrice * it.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 space-y-1 text-slate-700">
                <div className="flex justify-between font-bold text-xs text-slate-900">
                  <span>TOTAL</span>
                  <span>₹{completedInvoice.grandTotal}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Tender Mode</span>
                  <span>{completedInvoice.paymentMode}</span>
                </div>
                {completedInvoice.changeDue > 0 && (
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Change Returned</span>
                    <span>₹{completedInvoice.changeDue}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-600/20 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Thermal Print</span>
              </button>
              <button
                onClick={() => setCompletedInvoice(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
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
