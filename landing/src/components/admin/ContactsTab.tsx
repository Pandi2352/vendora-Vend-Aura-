import { useMemo, useState } from 'react';
import { EnvelopeSimple, Phone, IdentificationBadge, Storefront, Sparkle } from '@phosphor-icons/react';
import type { ContactItem } from './types';
import { KpiCard } from './ui/KpiCard';
import { DataTable, type Column } from './ui/DataTable';
import { IconAction } from './ui/IconAction';
import { FilterSelect } from './ui/FilterSelect';
import { BUSINESS_TYPE_LABELS } from '../../shared';

const SOURCE_OPTIONS = [
  { value: 'REGISTERED_TENANT', label: 'Store owners' },
  { value: 'ONBOARDING_INQUIRY', label: 'Inquiries / leads' },
];

const SourcePill = ({ source }: { source: ContactItem['source'] }) =>
  source === 'REGISTERED_TENANT' ? (
    <span className="inline-flex px-2 py-0.5 rounded-md border bg-emerald-50 border-emerald-200 text-emerald-700 text-[11px] font-bold">
      Store owner
    </span>
  ) : (
    <span className="inline-flex px-2 py-0.5 rounded-md border bg-amber-50 border-amber-200 text-amber-800 text-[11px] font-bold">
      Inquiry / lead
    </span>
  );

const hasPhone = (phone: string) => !!phone && phone !== 'Pending';

export function ContactsTab({ contacts }: { contacts: ContactItem[] }) {
  const [source, setSource] = useState('ALL');
  const rows = useMemo(() => contacts.filter((c) => source === 'ALL' || c.source === source), [contacts, source]);
  const registered = contacts.filter((c) => c.source === 'REGISTERED_TENANT').length;

  const columns: Column<ContactItem>[] = [
    { key: 'name', header: 'Contact', render: (c) => <span className="font-bold text-zinc-900">{c.ownerName}</span> },
    {
      key: 'business',
      header: 'Business',
      render: (c) => (
        <>
          <span className="block font-semibold text-zinc-900">{c.businessName}</span>
          <span className="block text-[11px] text-zinc-500">{BUSINESS_TYPE_LABELS[c.businessType] ?? c.businessType}</span>
        </>
      ),
    },
    { key: 'source', header: 'Type', align: 'center', render: (c) => <SourcePill source={c.source} /> },
    { key: 'email', header: 'Email', render: (c) => <span className="font-mono text-xs">{c.email}</span> },
    { key: 'phone', header: 'Phone', render: (c) => <span className="font-mono text-xs">{hasPhone(c.phone) ? c.phone : '—'}</span> },
    { key: 'city', header: 'City', render: (c) => c.city || '—' },
    { key: 'date', header: 'Date', render: (c) => <span className="tabular-nums text-zinc-500">{c.createdAt || '—'}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (c) => (
        <div className="inline-flex items-center gap-1.5">
          <IconAction
            label={`Email ${c.ownerName}`}
            tone="brand"
            icon={<EnvelopeSimple />}
            href={`mailto:${c.email}?subject=${encodeURIComponent('Vendora RetailPOS Support')}`}
          />
          {hasPhone(c.phone) && <IconAction label={`Call ${c.ownerName}`} tone="success" icon={<Phone />} href={`tel:${c.phone}`} />}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard tone="blue" label="Total contacts & leads" value={contacts.length} icon={<IdentificationBadge />} />
        <KpiCard tone="emerald" label="Store owners" value={registered} hint="Registered tenants" icon={<Storefront />} />
        <KpiCard tone="amber" label="Inquiries in progress" value={contacts.length - registered} hint="Not yet registered" icon={<Sparkle />} />
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(c) => c.id}
        searchText={(c) => `${c.ownerName} ${c.businessName} ${c.email} ${c.phone} ${c.city}`}
        searchPlaceholder="Search name, business, email, phone or city"
        emptyMessage="No contacts match the current filters."
        filters={<FilterSelect label="Contact type" value={source} onChange={setSource} options={SOURCE_OPTIONS} allLabel="All contacts" />}
      />
    </div>
  );
}
