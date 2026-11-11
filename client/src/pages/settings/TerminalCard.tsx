import { IdentificationCard } from '@phosphor-icons/react';
import { Card, CardHeader, InfoRow } from '../../components/ui';
import type { AccountOverview } from '../../types/account.types';

export function TerminalCard({ data }: { data: AccountOverview }) {
  return (
    <Card>
      <CardHeader icon={<IdentificationCard />} title="Terminal" />
      <InfoRow label="Customer ID" value={data.store.shopId.toUpperCase()} />
      <InfoRow label="Location" value={data.terminal.outletName} />
      <InfoRow label="Store" value={data.store.businessName} />
      <InfoRow label="Terminal" value={data.terminal.outletCode} />
      <InfoRow label="Signed in as" value={data.terminal.username} />
    </Card>
  );
}
