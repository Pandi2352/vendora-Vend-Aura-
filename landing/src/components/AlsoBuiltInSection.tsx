import { 
  WifiSlash, 
  Keyboard, 
  FileText, 
  ArrowsLeftRight, 
  Gift, 
  Bicycle, 
  BookOpen, 
  DownloadSimple, 
  LockKey, 
  Moon 
} from '@phosphor-icons/react';

export function AlsoBuiltInSection() {
  const items = [
    {
      title: 'Billing carries on even if the internet connection drops',
      icon: WifiSlash,
    },
    {
      title: 'Keyboard shortcuts for every counter action (F1 to F10)',
      icon: Keyboard,
    },
    {
      title: 'Quotations, estimates and sales orders',
      icon: FileText,
    },
    {
      title: 'Exchanges, refunds, held bills and day-end closing',
      icon: ArrowsLeftRight,
    },
    {
      title: 'Gift voucher and credit payments',
      icon: Gift,
    },
    {
      title: 'Home delivery orders and dispatch tracking',
      icon: Bicycle,
    },
    {
      title: 'Built-in accounts: day book, cash book, P&L, balance sheet and trial balance',
      icon: BookOpen,
    },
    {
      title: 'Export any report to CSV, Excel or PDF',
      icon: DownloadSimple,
    },
    {
      title: 'Only admin-approved billing terminals can bill',
      icon: LockKey,
    },
    {
      title: 'Light and dark theme, with adjustable screen size',
      icon: Moon,
    },
  ];

  return (
    <section className="py-20 bg-zinc-50 border-b border-zinc-200 w-full">
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 tracking-tight">
            Also <span className="text-red-600">built in</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 max-w-6xl mx-auto">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-md bg-white border border-zinc-200 hover:border-zinc-400 transition-all"
              >
                <div className="w-10 h-10 rounded-md bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
                  <Icon weight="duotone" className="w-5 h-5" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-zinc-800 leading-snug">{item.title}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
