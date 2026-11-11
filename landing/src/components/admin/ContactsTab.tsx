import { useState } from 'react';
import {
  MagnifyingGlass,
  EnvelopeSimple,
  Phone,
  Storefront,
  IdentificationBadge,
  Sparkle,
} from '@phosphor-icons/react';
import type { ContactItem } from './types';
import { BUSINESS_TYPE_LABELS } from '../../shared';

interface ContactsTabProps {
  contacts: ContactItem[];
}

export function ContactsTab({ contacts }: ContactsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'REGISTERED_TENANT' | 'ONBOARDING_INQUIRY'>('ALL');

  const filtered = contacts.filter((c) => {
    const matchesSearch =
      c.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSource = sourceFilter === 'ALL' || c.source === sourceFilter;

    return matchesSearch && matchesSource;
  });

  const registeredCount = contacts.filter((c) => c.source === 'REGISTERED_TENANT').length;
  const inquiryCount = contacts.filter((c) => c.source === 'ONBOARDING_INQUIRY').length;

  return (
    <div className="space-y-4">
      {/* Top Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-md border border-zinc-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase">Total Contacts & Leads</p>
            <p className="text-xl font-black text-zinc-950 mt-0.5">{contacts.length}</p>
          </div>
          <IdentificationBadge className="w-6 h-6 text-red-600" />
        </div>

        <div className="bg-white p-4 rounded-md border border-zinc-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase">Active Store Owners</p>
            <p className="text-xl font-black text-zinc-950 mt-0.5">{registeredCount}</p>
          </div>
          <Storefront className="w-6 h-6 text-emerald-600" />
        </div>

        <div className="bg-white p-4 rounded-md border border-zinc-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase">Inquiries in Progress</p>
            <p className="text-xl font-black text-zinc-950 mt-0.5">{inquiryCount}</p>
          </div>
          <Sparkle className="w-6 h-6 text-amber-500" />
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-md border border-zinc-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <MagnifyingGlass className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts by name, shop, city, phone..."
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-zinc-300 text-xs sm:text-sm focus:border-red-600 outline-none"
          />
        </div>

        <div className="flex items-center rounded-md border border-zinc-300 overflow-hidden bg-zinc-50 p-0.5 text-xs">
          <button
            onClick={() => setSourceFilter('ALL')}
            className={`px-3 py-1 rounded-sm text-[11px] font-bold cursor-pointer transition-colors ${
              sourceFilter === 'ALL' ? 'bg-zinc-950 text-white' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            All ({contacts.length})
          </button>
          <button
            onClick={() => setSourceFilter('REGISTERED_TENANT')}
            className={`px-3 py-1 rounded-sm text-[11px] font-bold cursor-pointer transition-colors ${
              sourceFilter === 'REGISTERED_TENANT' ? 'bg-zinc-950 text-white' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Store Owners ({registeredCount})
          </button>
          <button
            onClick={() => setSourceFilter('ONBOARDING_INQUIRY')}
            className={`px-3 py-1 rounded-sm text-[11px] font-bold cursor-pointer transition-colors ${
              sourceFilter === 'ONBOARDING_INQUIRY' ? 'bg-zinc-950 text-white' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Inquiries ({inquiryCount})
          </button>
        </div>
      </div>

      {/* Contacts Data Table */}
      <div className="bg-white rounded-md border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Contact Name</th>
                <th className="py-3 px-4">Business / Shop</th>
                <th className="py-3 px-4">Type / Source</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-zinc-950">{c.ownerName}</td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-zinc-900">{c.businessName}</div>
                      <span className="text-[11px] text-zinc-500">
                        {BUSINESS_TYPE_LABELS[c.businessType] || c.businessType}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {c.source === 'REGISTERED_TENANT' ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          Store Owner
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                          Inquiry / Lead
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-zinc-700">{c.email}</td>

                    <td className="py-3 px-4 font-mono text-zinc-700">{c.phone}</td>

                    <td className="py-3 px-4 text-zinc-700">{c.city}</td>

                    <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">
                      {c.createdAt || 'Recent'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <a
                          href={`mailto:${c.email}?subject=Vendora%20RetailPOS%20Support`}
                          className="px-2 py-1 rounded-md bg-zinc-100 hover:bg-zinc-900 hover:text-white border border-zinc-200 font-semibold text-[11px] text-zinc-800 transition-colors inline-flex items-center gap-1"
                          title="Send Email"
                        >
                          <EnvelopeSimple className="w-3 h-3" />
                          <span>Email</span>
                        </a>

                        {c.phone && c.phone !== 'Pending' && (
                          <a
                            href={`tel:${c.phone}`}
                            className="p-1 rounded-md bg-zinc-100 hover:bg-zinc-900 hover:text-white border border-zinc-200 text-zinc-800 transition-colors inline-flex items-center"
                            title="Call Phone"
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500">
                    No contacts match your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
