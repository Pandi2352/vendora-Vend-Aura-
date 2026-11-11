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
    <section className="py-6 bg-zinc-950 border-y border-zinc-800 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-3 text-center">
        <p className="text-xs font-semibold text-red-500 uppercase tracking-widest">
          Ready-Made Setup for 14+ Retail Business Types
        </p>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none px-4 max-w-7xl mx-auto justify-start lg:justify-center flex-nowrap">
        {industries.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 shrink-0 hover:border-red-600 hover:text-white transition-all cursor-default"
            >
              <Icon className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
