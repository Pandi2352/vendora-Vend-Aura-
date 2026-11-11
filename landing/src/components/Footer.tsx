import { Store, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/20">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Vendora</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Retail POS Nova – Cloud Point of Sale & ERP software for modern retail businesses. Billing, stock, purchases, accounts, and GST compliance in one unified platform.
            </p>
            <div className="pt-2">
              <p className="text-white font-semibold text-xs mb-1">Unipro Tech Solutions Pvt Ltd</p>
              <p className="flex items-start gap-2 text-slate-400 text-[11px] leading-snug">
                <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                <span>
                  KNR Building, Plot No: 23 & 35B, Sriram Nagar, 2nd Street, Mugalivakkam Road, Porur, Chennai – 600116, Tamil Nadu, India
                </span>
              </p>
            </div>
          </div>

          {/* Contact Support */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Support & Sales</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-brand-400" />
                <span>044-421 421 40</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-brand-400" />
                <span>+91 95660 44300</span>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-brand-400" />
                <span>salesenquiry@uniprotech.co.in</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Retail POS</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#features" className="hover:text-white transition-colors">Fast Billing Counter</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">GST Invoices</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Stock & Inventory</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Thermal Printing</a></li>
              <li><a href="#plans" className="hover:text-white transition-colors">Pricing Plans</a></li>
            </ul>
          </div>

          {/* Administration & Portals */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Portals</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to="/admin" className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1">
                  <span>Platform Super Admin</span>
                </Link>
              </li>
              <li>
                <a href="http://localhost:4001" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white">
                  Shop Terminal (Port 4001)
                </a>
              </li>
              <li>
                <a href="http://localhost:5000/docs" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white">
                  Swagger API Docs (Port 5000)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 Vendora Technologies / Unipro Tech Solutions Pvt Ltd. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Cancellation & Refund</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

