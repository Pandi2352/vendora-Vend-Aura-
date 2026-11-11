import { 
  DuotoneRocket, 
  DuotoneBrowser, 
  DuotoneLink, 
  DuotoneShield,
  DuotoneCloud,
  DuotoneWifiSlash,
  DuotoneReceipt,
  DuotonePrinter,
  DuotoneBook,
  DuotoneKey,
  DuotoneGift
} from './DuotoneIcons';
import { CheckCircle, X, Cloud } from '@phosphor-icons/react';

export function WhyVendoraSection() {
  const pillars = [
    {
      title: 'Start billing on day one',
      description: 'Choose your business type at sign-up, and your account comes ready with categories, brands, units and sample items, so you can make your first bill right away.',
      icon: DuotoneRocket,
    },
    {
      title: 'Nothing to install',
      description: 'Open it in Chrome or any browser on your PC, laptop, tablet or POS terminal. Updates happen automatically.',
      icon: DuotoneBrowser,
    },
    {
      title: 'Your own login address',
      description: 'Every shop gets its own secure web address, like yourshop.vendora.com. Your team signs in with just a username and password.',
      icon: DuotoneLink,
    },
    {
      title: 'Safe in the cloud',
      description: 'Your data is stored securely online, protected with HTTPS, and available from anywhere.',
      icon: DuotoneShield,
    },
  ];

  const comparisonRows = [
    {
      feature: 'Getting started',
      icon: DuotoneRocket,
      vendora: 'Pick your business type and start with categories, brands and sample items, ready to bill on day one',
      others: 'Usually starts empty, so every item has to be added before the first bill',
    },
    {
      feature: 'Installation',
      icon: DuotoneBrowser,
      vendora: 'Nothing to install. Open it in Chrome or any browser',
      others: 'Often needs software installed on every billing PC',
    },
    {
      feature: 'Updates',
      icon: DuotoneCloud,
      vendora: 'Updates happen automatically',
      others: 'Updates are often manual or paid',
    },
    {
      feature: 'Internet goes down',
      icon: DuotoneWifiSlash,
      vendora: 'Billing carries on even if the connection drops',
      others: 'Many cloud POS tools stop billing when offline',
    },
    {
      feature: 'GST billing',
      icon: DuotoneReceipt,
      vendora: 'Automatic CGST/SGST/IGST calculation and clean printed or digital bills',
      others: 'GST setup is often an add-on or complex configuration',
    },
    {
      feature: 'Receipt printing',
      icon: DuotonePrinter,
      vendora: 'Direct thermal receipt printing to USB and network printers without print dialogs',
      others: 'Driver issues, Windows printer dialog pops up on every bill',
    },
    {
      feature: 'Accounts',
      icon: DuotoneBook,
      vendora: 'Day book, cash book, P&L, balance sheet and trial balance included',
      others: 'Need separate accounting software with manual entry',
    },
    {
      feature: 'Login',
      icon: DuotoneKey,
      vendora: "Sign in from any device with your store's secure URL",
      others: 'Tied to specific hardware or Windows dongles',
    },
    {
      feature: 'Free Trial',
      icon: DuotoneGift,
      vendora: '30 days free trial with all features enabled. No installation. No credit card required.',
      others: 'Limited trial or requires credit card upfront',
    },
  ];

  return (
    <section id="comparison" className="py-20 bg-slate-50/70 border-b border-zinc-200 w-full scroll-mt-20">
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16">
        
        {/* Top Section: Why Vendora RetailPOS */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950">
            Why <span className="text-red-600">Vendora RetailPOS</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 font-medium">
            Start billing on day one with zero software installation and preloaded catalog templates.
          </p>
        </div>

        {/* 4 Cards Grid - rounded-md, no shadows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 mb-24">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-7 rounded-md border border-zinc-200 hover:border-zinc-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="mb-5">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-950 mb-2 leading-snug">{item.title}</h3>
                  <p className="text-xs sm:text-[13px] text-zinc-600 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Elevated Centerpiece Comparison Section */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950">
            Vendora RetailPOS vs <span className="text-red-600">other retail POS systems</span>
          </h2>
        </div>

        {/* Comparison Table Container */}
        <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">
          
          {/* Desktop & Tablet Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr>
                  {/* Aspect Header */}
                  <th className="w-1/4 p-5 text-sm font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-200 bg-white">
                    Feature
                  </th>

                  {/* Vendora RetailPOS Elevated Dark Header */}
                  <th className="w-4/9 p-5 bg-[#09122e] text-white border-x border-[#09122e]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shrink-0">
                        <Cloud weight="fill" className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-base sm:text-lg font-bold tracking-tight text-white">
                        Vendora RetailPOS
                      </span>
                    </div>
                  </th>

                  {/* Other POS Header */}
                  <th className="w-1/3 p-5 text-base sm:text-lg font-bold text-zinc-900 border-b border-zinc-200 bg-white">
                    Other retail POS systems
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, idx) => {
                  const Icon = row.icon;
                  const isLast = idx === comparisonRows.length - 1;
                  return (
                    <tr key={idx} className="transition-colors">
                      {/* Left Column: Icon + Feature Name */}
                      <td className={`p-5 align-top border-b border-zinc-200 bg-white ${isLast ? 'border-b-0' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className="shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-bold text-zinc-950">
                            {row.feature}
                          </span>
                        </div>
                      </td>

                      {/* Center Column: Vendora RetailPOS (Dark Navy Elevated Column) */}
                      <td className={`p-5 align-top bg-[#09122e] text-white border-x border-[#09122e] border-b border-white/10 ${isLast ? 'border-b-0 rounded-b-md' : ''}`}>
                        <div className="flex items-start gap-3">
                          <CheckCircle weight="fill" className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm font-medium leading-relaxed text-zinc-100">
                            {row.vendora}
                          </span>
                        </div>
                      </td>

                      {/* Right Column: Other retail POS systems */}
                      <td className={`p-5 align-top border-b border-zinc-200 bg-white ${isLast ? 'border-b-0' : ''}`}>
                        <div className="flex items-start gap-3">
                          <X weight="bold" className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                            {row.others}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="md:hidden divide-y divide-zinc-200">
            {comparisonRows.map((row, idx) => {
              const Icon = row.icon;
              return (
                <div key={idx} className="p-5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-5 h-5 shrink-0" />
                    <h4 className="font-bold text-zinc-950 text-sm">{row.feature}</h4>
                  </div>

                  {/* Vendora Dark Box */}
                  <div className="p-4 rounded-md bg-[#09122e] text-white flex items-start gap-2.5">
                    <CheckCircle weight="fill" className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-0.5">Vendora RetailPOS</p>
                      <p className="text-xs text-zinc-200 leading-relaxed font-medium">{row.vendora}</p>
                    </div>
                  </div>

                  {/* Other POS Box */}
                  <div className="p-4 rounded-md bg-zinc-50 border border-zinc-200 flex items-start gap-2.5">
                    <X weight="bold" className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">Other POS Systems</p>
                      <p className="text-xs text-zinc-600 leading-relaxed">{row.others}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
