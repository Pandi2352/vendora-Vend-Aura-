import { Truck, Users, Storefront, ShieldCheck, CheckSquareOffset } from '@phosphor-icons/react';

export function FeatureGrid() {
  const features = [
    {
      title: 'Purchase management',
      description: 'Raise purchase orders, receive goods (GRN) and keep vendor records, with stock updated automatically.',
      icon: Truck,
    },
    {
      title: 'Customers and credit',
      description: 'Save customer details, give credit, and track what each customer owes with full Khata statements.',
      icon: Users,
    },
    {
      title: 'Multiple outlets',
      description: 'Run several branches from one account, each with its own billing, staff, and localized stock.',
      icon: Storefront,
    },
    {
      title: 'Staff and permissions',
      description: 'Add cashiers and managers, and control exactly what each person can see, discount, and do.',
      icon: ShieldCheck,
    },
    {
      title: 'Guided setup',
      description: 'A step-by-step checklist walks you through company details, outlets, items, and your first bill.',
      icon: CheckSquareOffset,
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-zinc-200 w-full">
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 xl:gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-md border border-zinc-200 hover:border-zinc-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-md bg-red-50 border border-red-200 flex items-center justify-center mb-4 text-red-600">
                    <Icon weight="duotone" className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-950 mb-1.5">{item.title}</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
