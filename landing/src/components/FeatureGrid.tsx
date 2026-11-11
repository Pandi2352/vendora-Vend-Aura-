import { Truck, Users, Store, ShieldCheck, CheckSquare } from 'lucide-react';

export function FeatureGrid() {
  const features = [
    {
      title: 'Purchase management',
      description: 'Raise purchase orders, receive goods (GRN) and keep vendor records, with stock updated automatically.',
      icon: Truck,
      color: 'text-red-600',
    },
    {
      title: 'Customers and credit',
      description: 'Save customer details, give credit, and track what each customer owes with full Khata statements.',
      icon: Users,
      color: 'text-indigo-600',
    },
    {
      title: 'Multiple outlets',
      description: 'Run several branches from one account, each with its own billing, staff, and localized stock.',
      icon: Store,
      color: 'text-blue-600',
    },
    {
      title: 'Staff and permissions',
      description: 'Add cashiers and managers, and control exactly what each person can see, discount, and do.',
      icon: ShieldCheck,
      color: 'text-rose-600',
    },
    {
      title: 'Guided setup',
      description: 'A step-by-step checklist walks you through company details, outlets, items, and your first bill.',
      icon: CheckSquare,
      color: 'text-red-500',
    },
  ];

  return (
    <section className="py-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-5">
                    <Icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

