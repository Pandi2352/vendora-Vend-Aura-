import { useState } from 'react';
import { ShoppingCart, FileText, Printer, Package, ChartBar } from '@phosphor-icons/react';

export function FeatureShowcase() {
  const [activeTab, setActiveTab] = useState<'billing' | 'gst' | 'print' | 'inventory' | 'reports'>('gst');

  const tabs = [
    { id: 'billing', label: 'Fast billing counter', icon: ShoppingCart },
    { id: 'gst', label: 'GST-ready invoices', icon: FileText },
    { id: 'print', label: 'Direct receipt printing', icon: Printer },
    { id: 'inventory', label: 'Inventory and stock', icon: Package },
    { id: 'reports', label: 'Reports that matter', icon: ChartBar },
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
    <section id="features" className="py-20 bg-white border-b border-zinc-200 w-full">
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 tracking-tight">
            Everything a growing retail shop needs,{' '}
            <span className="text-red-600">in one place</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-600">
            Switch between core workflows engineered for seamless retail counter performance.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-md text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
                  isActive
                    ? 'bg-zinc-950 text-white border-zinc-950'
                    : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500' : 'bg-zinc-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Display Area with Mockup Receipt */}
        <div className="p-8 sm:p-12 lg:p-16 rounded-md bg-zinc-50 border border-zinc-200 flex flex-col lg:flex-row items-center justify-around gap-12">
          {/* Left Text Card */}
          <div className="bg-white p-8 sm:p-10 rounded-md border border-zinc-200 max-w-lg w-full">
            <span className="px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider mb-3 inline-block border border-red-200">
              {current.badge}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 mb-3">{current.title}</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">{current.description}</p>
          </div>

          {/* Right Receipt Mockup matching screenshot #4 */}
          <div className="w-full max-w-sm bg-white p-6 rounded-md border border-zinc-200 font-mono text-[11px] text-zinc-800 leading-tight">
            <div className="text-center pb-3 border-b border-dashed border-zinc-300">
              <p className="font-bold text-xs uppercase tracking-wider text-zinc-950">VENDORA RETAIL</p>
              <p className="text-[10px] text-zinc-500">BR01 - MAIN STORE</p>
              <p className="text-[10px] text-zinc-400 mt-1">====================================</p>
              <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                <span>Bill: BR01-000019</span>
                <span>Cashier: Admin</span>
              </div>
              <p className="text-[10px] text-zinc-600 text-left">Terminal: POS-1</p>
            </div>

            <div className="py-3 border-b border-dashed border-zinc-300 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-zinc-900">AAMBAL HANDWASH 300ML</p>
                  <p className="text-[10px] text-zinc-500">1 x ₹115.00 (MRP 115)</p>
                </div>
                <span className="font-semibold">₹115.00</span>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-zinc-900">AASHIRVAAD ATTA 1KG</p>
                  <p className="text-[10px] text-zinc-500">1 x ₹55.00 (MRP 73)</p>
                </div>
                <span className="font-semibold">₹55.00</span>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-zinc-900">CHEF SPECIAL MASALA 80G</p>
                  <p className="text-[10px] text-zinc-500">1 x ₹75.00 (MRP 80)</p>
                </div>
                <span className="font-semibold">₹75.00</span>
              </div>
            </div>

            <div className="py-3 border-b border-dashed border-zinc-300 space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-600">
                <span>Subtotal</span>
                <span>₹245.00</span>
              </div>
              <div className="flex justify-between text-[10px] text-zinc-600">
                <span>CGST 2.5%</span>
                <span>₹6.13</span>
              </div>
              <div className="flex justify-between text-[10px] text-zinc-600">
                <span>SGST 2.5%</span>
                <span>₹6.12</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-zinc-950 pt-1 border-t border-zinc-200">
                <span>TOTAL AMOUNT</span>
                <span className="text-red-600">₹245.00</span>
              </div>
              <div className="flex justify-between text-[10px] text-zinc-700">
                <span>Paid via UPI</span>
                <span>₹245.00</span>
              </div>
            </div>

            <div className="text-center pt-3 text-[10px] text-zinc-500">
              <p>Thank you! Please visit again.</p>
              <p className="text-[9px] text-zinc-400 mt-1 font-mono">HASH: 81a1119d-b228-7397-9f12-f94fc8211b0</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
