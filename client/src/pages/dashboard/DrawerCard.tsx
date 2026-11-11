import { Vault } from '@phosphor-icons/react';
import { Button, Card, CardHeader, InfoRow } from '../../components/ui';
import { usePosSession } from '../../hooks/usePosSession';
import { formatDateTime, formatInr } from '@/utils';

/** Cash drawer status with open / close action. */
export function DrawerCard() {
  const { activeShift, isShiftOpen, setOpenModal } = usePosSession();

  return (
    <Card>
      <CardHeader
        icon={<Vault />}
        title="Cash drawer"
        description={isShiftOpen ? `Shift ${activeShift?.shiftNumber}` : 'No shift open. Billing needs an open drawer.'}
        action={
          <Button size="sm" variant={isShiftOpen ? 'secondary' : 'primary'} onClick={() => setOpenModal('drawer')}>
            {isShiftOpen ? 'Manage' : 'Open drawer'}
          </Button>
        }
      />
      {isShiftOpen && activeShift && (
        <>
          <InfoRow label="Opened" value={formatDateTime(activeShift.openedAt)} />
          <InfoRow label="Opening float" value={formatInr(activeShift.openingFloat)} />
          <InfoRow label="Expected cash" value={formatInr(activeShift.expectedCash)} />
          <InfoRow label="Refunds" value={formatInr(activeShift.refundsTotal)} />
        </>
      )}
    </Card>
  );
}
