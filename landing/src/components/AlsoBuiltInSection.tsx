import { WifiOff, Keyboard, FileText, ArrowLeftRight, Gift, Bike, BookOpen, Download, Lock, Moon } from 'lucide-react';

export function AlsoBuiltInSection() {
  const items = [
    {
      title: 'Billing carries on even if the internet connection drops',
      icon: WifiOff,
      color: 'bg-rose-50 text-rose-600',
    },
    {
      title: 'Keyboard shortcuts for every counter action (F1 to F10)',
      icon: Keyboard,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Quotations, estimates and sales orders',
      icon: FileText,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Exchanges, refunds, held bills and day-end closing',
      icon: ArrowLeftRight,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Gift voucher and credit payments',
      icon: Gift,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Home delivery orders and dispatch tracking',
      icon: Bike,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Built-in accounts: day book, cash book, P&L, balance sheet and trial balance',
      icon: BookOpen,
      color: 'bg-rose-50 text-rose-600',
    },
    {
      title: 'Export any report to CSV, Excel or PDF',
      icon: Download,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Only admin-approved billing terminals can bill',
      icon: Lock,
      color: 'bg-violet-50 text-violet-600',
    },
    {
      title: 'Light and dark theme, with adjustable screen size',
      icon: Moon,
      color: 'bg-slate-100 text-slate-700',
    },
  ];

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Also <span className="text-red-600">built in</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-5xl mx-auto">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-800 leading-snug">{item.title}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

