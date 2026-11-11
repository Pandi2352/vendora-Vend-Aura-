import { Store, ShoppingBag, Utensils, Pill, Laptop, BookOpen, Wrench, Sparkles, Gem, Shirt, Apple } from 'lucide-react';

export function IndustryMarquee() {
  const industries = [
    { label: 'Grocery / Kirana', icon: Store },
    { label: 'Supermarket', icon: ShoppingBag },
    { label: 'Textile & Garments', icon: Shirt },
    { label: 'Fruits & Vegetables', icon: Apple },
    { label: 'Bakery & Sweets', icon: Utensils },
    { label: 'Restaurant / Café', icon: Utensils },
    { label: 'Pharmacy / Medical', icon: Pill },
    { label: 'Footwear', icon: ShoppingBag },
    { label: 'Electronics & Mobiles', icon: Laptop },
    { label: 'Stationery & Books', icon: BookOpen },
    { label: 'Hardware & Paints', icon: Wrench },
    { label: 'Cosmetics & Beauty', icon: Sparkles },
    { label: 'Jewellery', icon: Gem },
    { label: 'General Retail', icon: Store },
  ];

  return (
    <section className="py-8 bg-slate-900 border-y border-slate-800 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-4 text-center">
        <p className="text-xs font-semibold text-brand-300 uppercase tracking-widest">
          Ready-Made Setup for 14+ Retail Business Types
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none px-4 max-w-7xl mx-auto justify-start lg:justify-center flex-nowrap">
        {industries.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-200 shrink-0 hover:border-brand-400 hover:text-white transition-all cursor-default"
            >
              <Icon className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

