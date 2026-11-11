import { CheckCircle2, XCircle, Zap, Globe, Shield, RefreshCw } from 'lucide-react';

export function WhyVendoraSection() {
  const pillars = [
    {
      title: 'Start billing on day one',
      description: 'Choose your business type at sign-up, and your account comes ready with categories, brands, units and sample items, so you can make your first bill right away.',
      icon: Zap,
    },
    {
      title: 'Nothing to install',
      description: 'Open it in Chrome or any browser on your PC, laptop, tablet or POS terminal. Updates happen automatically in the background.',
      icon: RefreshCw,
    },
    {
      title: 'Your own login address',
      description: 'Every shop gets its own secure web address, like yourshop.vendora.com. Your cashiers and managers sign in with their unique credentials.',
      icon: Globe,
    },
    {
      title: 'Safe in the cloud',
      description: 'Your stock, customer ledgers, and transactions are stored securely online, protected with HTTPS, and accessible from anywhere.',
      icon: Shield,
    },
  ];

  const comparisonRows = [
    {
      feature: 'Getting started',
      vendora: 'Pick your business type and start with preloaded categories, brands and items, ready to bill on day one',
      others: 'Usually starts completely empty, so every item has to be added manually before the first bill',
    },
    {
      feature: 'Installation',
      vendora: 'Nothing to install. Open it in Chrome or any modern browser on any terminal',
      others: 'Often needs heavy proprietary software installed on every billing PC',
    },
    {
      feature: 'Updates',
      vendora: 'Updates happen automatically without downtime or extra fees',
      others: 'Updates are often manual, complicated, or charged as paid upgrades',
    },
    {
      feature: 'Internet goes down',
      vendora: 'Billing carries on seamlessly offline; queued bills sync automatically when connection returns',
      others: 'Many cloud POS tools completely halt counter checkout when offline',
    },
    {
      feature: 'GST billing',
      vendora: 'Automatic CGST, SGST, IGST calculations, HSN codes, and instant GSTR summaries',
      others: 'GST setup is often an expensive add-on or requires manual calculations',
    },
    {
      feature: 'Receipt printing',
      vendora: 'Prints straight to your 58mm/80mm thermal printer with zero browser print pop-up delays',
      others: 'Browser print dialog pop-ups interrupt and slow down counter queues',
    },
    {
      feature: 'Accounts & Finance',
      vendora: 'Built-in day book, cash book, P&L, balance sheet and customer credit ledger (Khata)',
      others: 'Usually requires separate expensive third-party accounting software like Tally',
    },
    {
      feature: 'Login Security',
      vendora: 'Your own dedicated shop address (e.g., yourshop.vendora.com)',
      others: 'A generic shared login page where multiple shop credentials mix',
    },
    {
      feature: 'Free Trial',
      vendora: '30-day free trial. No installation. No credit card required.',
      others: 'Requires a sales call, upfront card details, or setup deposit before you can try',
    },
  ];

  return (
    <section id="comparison" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Why Vendora Grid */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Why Vendora is Different
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Engineered specifically to remove retail bottlenecks and counter friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Vendora vs Traditional POS Systems</h3>
              <p className="text-xs text-slate-300 mt-1">See how modern cloud architecture outperforms legacy counter software.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/40 text-brand-300 text-xs font-semibold">
              Feature Comparison
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6 w-1/4">Aspect</th>
                  <th className="py-4 px-6 w-3/8 text-brand-700 bg-brand-50/50">Vendora Cloud POS</th>
                  <th className="py-4 px-6 w-3/8 text-slate-600">Other Retail POS Systems</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">{row.feature}</td>
                    <td className="py-4 px-6 font-medium text-slate-800 bg-brand-50/30">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{row.vendora}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{row.others}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

