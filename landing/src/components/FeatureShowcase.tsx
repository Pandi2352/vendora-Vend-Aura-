import { useState } from 'react';
import { ShoppingCart, FileText, Printer, Package, BarChart3 } from 'lucide-react';

export function FeatureShowcase() {
  const [activeTab, setActiveTab] = useState<'billing' | 'gst' | 'print' | 'inventory' | 'reports'>('gst');

  const tabs = [
    { id: 'billing', label: 'Fast billing counter', icon: ShoppingCart },
    { id: 'gst', label: 'GST-ready invoices', icon: FileText },
    { id: 'print', label: 'Direct receipt printing', icon: Printer },
    { id: 'inventory', label: 'Inventory and stock', icon: Package },
    { id: 'reports', label: 'Reports that matter', icon: BarChart3 },
  ] as const;

  const contentMap = {
    billing: {
      title: 'Fast billing counter',
      description: 'Scan barcodes or search by name. Hold and recall bills, apply discounts, and take cash, card, UPI or split payments, all from one retail shop POS system.',
      badge: '5-Second Turnaround',
    },
    gst: {
      title: 'GST-ready invoices',
      description: 'GST billing software built in: automatic CGST/SGST/IGST calculation, HSN codes, and clean printed or digital bills.',
      badge: 'Statutory GST Compliance',
    },
    print: {
      title: 'Direct receipt printing',
      description: 'Print bills straight to your thermal printer, with no print pop-ups slowing down the counter.',
      badge: '58mm & 80mm ESC/POS',
    },
    inventory: {
      title: 'Inventory and stock',
      description: 'Track stock item by item and batch by batch, with MRP and selling price. Get low-stock alerts and move stock between outlets.',
      badge: 'Double-Entry Stock Ledger',
    },
    reports: {
      title: 'Reports that matter',
      description: 'Daily sales, item-wise and category-wise sales, stock valuation and purchase reports.',
      badge: 'Instant Business Visibility',
    },
  };

  const current = contentMap[activeTab];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything a growing retail shop needs,{' '}
            <span className="text-brand-600">in one place</span>
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Switch between core workflows engineered for seamless retail counter performance.
          </p>
        </div>

        {/* Tab Pills matching screenshot #4 */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-brand-400' : 'border border-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Display Area with Mockup Receipt */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-pink-50 via-rose-50 to-indigo-50 border border-rose-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left Text Card */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg max-w-md w-full">
            <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider mb-4 inline-block">
              {current.badge}
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">{current.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{current.description}</p>
          </div>

          {/* Right Receipt Mockup matching screenshot #4 */}
          <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-xl border border-slate-200 font-mono text-[11px] text-slate-800 leading-tight">
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <p className="font-bold text-xs uppercase tracking-wider">UNIPRO RETAIL</p>
              <p className="text-[10px] text-slate-500">BR01 - BR01</p>
              <p className="text-[10px] text-slate-500 mt-1">====================================</p>
              <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                <span>Bill: BR01-000019</span>
                <span>Cashier: Administrator</span>
              </div>
              <p className="text-[10px] text-slate-600 text-left">Terminal: POS-1</p>
            </div>

            {/* Line Items */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
              <div>
                <p className="font-semibold text-slate-900">AAMBAL HANDWASH 2 X 300 ML COMBO</p>
                <div className="flex justify-between text-slate-600">
                  <span>1 x 115.00 (MRP 115.00)</span>
                  <span className="font-semibold text-slate-900">115.00</span>
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-900">ADITI CHAKKI ATTA 1KG</p>
                <div className="flex justify-between text-slate-600">
                  <span>1 x 55.00 (MRP 73.00)</span>
                  <span className="font-semibold text-slate-900">55.00</span>
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-900">BAKERS AL FAHAM MASALA 80GM</p>
                <div className="flex justify-between text-slate-600">
                  <span>1 x 75.00 (MRP 80.00)</span>
                  <span className="font-semibold text-slate-900">75.00</span>
                </div>
              </div>
            </div>

            {/* Calculations */}
            <div className="py-2.5 space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>245.00</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>GST (CGST/SGST Included)</span>
                <span>0.00</span>
              </div>
              <p className="text-[10px] text-slate-400">====================================</p>
              <div className="flex justify-between text-xs font-bold text-slate-900 pt-0.5">
                <span>TOTAL</span>
                <span>INR 245.00</span>
              </div>
              <p className="text-[10px] text-slate-400">====================================</p>
              <div className="flex justify-between text-slate-600 pt-0.5">
                <span>Cash Tendered</span>
                <span>245.00</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-500">
              <p>Thank you! Please visit again.</p>
              <p className="text-[9px] text-slate-400 mt-0.5">01a1119d-8228-7397-9f12-f94f0c8211b9</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

