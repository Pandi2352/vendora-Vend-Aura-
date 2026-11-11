import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is Vendora, and do I need to install anything?',
      a: "It's cloud-based billing and inventory software for retail shops. It runs right in your web browser (Google Chrome, Edge, etc.), so there's nothing to install. Just open your shop's dedicated web address and log in. For direct thermal receipt printing, a small lightweight print helper connects automatically.",
    },
    {
      q: 'What is a cloud point of sale system, and is it right for my retail store?',
      a: 'A cloud POS keeps your items, pricing, transactions, and customer credits safely stored online. You can view sales from your phone, add products from home, or run multiple counters at once without needing a local server computer in your shop.',
    },
    {
      q: 'Is the free trial really free, and what do I get?',
      a: 'Yes, 100% free for 30 days or up to 1,000 bills. No credit card is required. You get access to the billing counter, product catalog, barcode generator, inventory ledger, and daily sales reports.',
    },
    {
      q: 'How quickly can I start, and will my items be set up?',
      a: 'You can start billing within 2 minutes! When you select your business type (such as Grocery or Bakery), your account is automatically created with standard categories, units, and starter items so you can print your first test bill immediately.',
    },
    {
      q: 'Is Vendora GST billing software?',
      a: 'Yes, full India GST compliance is built in: automatic CGST, SGST, IGST calculations, HSN/SAC codes, tax-inclusive and tax-exclusive pricing, and one-click GSTR-1 outward supply summaries.',
    },
    {
      q: 'What is the Shop ID / Customer ID, and do I need a GSTIN?',
      a: 'Your Shop ID is your unique store handle (e.g. "srimurugan"), which gives you your own web login address: srimurugan.vendora.com. A GSTIN is optional during registration; you can add it anytime later in store settings.',
    },
    {
      q: 'Which devices and printers does it work with?',
      a: 'Vendora works on any Windows PC, Mac, laptop, Android tablet, iPad, or all-in-one POS touch terminal. It works seamlessly with standard 2-inch (58mm) and 3-inch (80mm) USB, Bluetooth, and Ethernet thermal receipt printers.',
    },
    {
      q: 'Can I use it for more than one shop, and can my staff use it?',
      a: 'Yes! The Growth and Business plans allow you to create cashiers, store managers, and accountants with individual logins and permission controls. The Business plan supports multiple branches with inter-branch stock transfers.',
    },
  ];

  return (
    <section id="faq" className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Everything you need to know about getting started with Vendora Cloud POS.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-slate-50/50 hover:border-slate-300"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full py-4 px-6 text-left font-bold text-sm sm:text-base text-slate-900 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-brand-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

