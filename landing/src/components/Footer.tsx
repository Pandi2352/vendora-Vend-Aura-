import { Phone, EnvelopeSimple, MapPin } from '@phosphor-icons/react';
import { posLoginUrl } from '../lib/config';

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 pt-16 pb-12 border-t border-zinc-800 text-xs font-sans w-full">
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-zinc-800">
          {/* Brand Info with Two-Color Logo */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/vendora_logo.png"
                alt="Vendora Logo"
                className="h-9 w-auto object-contain"
              />
              <span className="text-xl font-black text-white tracking-tight">Vendora</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              Vendora – Cloud Point of Sale & ERP software for modern retail businesses. Billing, stock, purchases, accounts, and GST compliance in one unified platform.
            </p>
            <div className="pt-2">
              <p className="text-white font-semibold text-xs mb-1">Vendora Tech Solutions Pvt Ltd</p>
              <p className="flex items-start gap-2 text-zinc-400 text-[11px] leading-snug">
                <MapPin weight="fill" className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <span>
                  Vendora Tech Tower, Plot No: 23 & 35B, IT Corridor, Chennai – 600116, Tamil Nadu, India
                </span>
              </p>
            </div>
          </div>

          {/* Contact Support */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Support & Sales</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-zinc-300">
                <Phone weight="fill" className="w-3.5 h-3.5 text-red-500" />
                <span>044-421 421 40</span>
              </li>
              <li className="flex items-center gap-2 text-zinc-300">
                <Phone weight="fill" className="w-3.5 h-3.5 text-red-500" />
                <span>+91 95660 44300</span>
              </li>
              <li className="flex items-center gap-2 text-zinc-300">
                <EnvelopeSimple weight="fill" className="w-3.5 h-3.5 text-red-500" />
                <span>support@vendora.com</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Retail POS</h4>
            <ul className="space-y-2 text-zinc-400">
              <li><a href="#comparison" className="hover:text-white transition-colors">Why RetailPOS</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Fast Billing Counter</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">GST Invoices</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Stock & Inventory</a></li>
              <li><a href="#plans" className="hover:text-white transition-colors">Pricing Plans</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <a
                  href={posLoginUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Store Counter Login
                </a>
              </li>
              <li><a href="#comparison" className="hover:text-white transition-colors">Feature Comparison</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Common Questions</a></li>
              <li><a href="#plans" className="hover:text-white transition-colors">30-Day Free Trial</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px]">
          <p>© {new Date().getFullYear()} Vendora Technologies. Powered by Vendora. All rights reserved.</p>
          <a href="mailto:support@vendora.com" className="hover:text-zinc-300 transition-colors">
            Questions about privacy, terms or security? support@vendora.com
          </a>
        </div>
      </div>
    </footer>
  );
}
