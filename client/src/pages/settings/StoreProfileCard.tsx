import { Storefront } from '@phosphor-icons/react';
import { Card, CardHeader, InfoRow } from '../../components/ui';
import type { AccountOverview } from '../../types/account.types';

const formatAddress = (a: AccountOverview['store']['address']) =>
  a ? [a.street, a.city, a.state, a.pincode].filter(Boolean).join(', ') || '—' : '—';

/** Read-only business profile captured at registration. */
export function StoreProfileCard({ data }: { data: AccountOverview }) {
  const { store } = data;
  return (
    <Card>
      <CardHeader icon={<Storefront />} title="Store profile" description="Details captured when the shop was registered." />
      <InfoRow label="Business name" value={store.businessName} />
      <InfoRow label="Owner" value={store.ownerName} />
      <InfoRow label="Business type" value={store.businessType.replaceAll('_', ' ')} />
      <InfoRow label="Email" value={store.email} />
      <InfoRow label="Phone" value={store.phone} />
      <InfoRow label="GSTIN" value={store.gstin || 'Not registered'} />
      <InfoRow label="Address" value={formatAddress(store.address)} />
      <InfoRow label="Status" value={store.status} />
    </Card>
  );
}
