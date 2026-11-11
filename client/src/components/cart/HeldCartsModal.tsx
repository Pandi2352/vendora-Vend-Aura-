import { Play, Trash, PauseCircle, Clock } from '@phosphor-icons/react';
import { useConfirm } from '@/hooks/useConfirm';
import { Badge, Button, Dialog } from '@/components/ui';
import { EmptyState } from '@/components/feedback';
import type { HeldCart } from '@/types/shift-return.types';
import { formatInr, formatTime } from '@/utils';

interface HeldCartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldCarts: HeldCart[];
  onResumeCart: (cart: HeldCart) => void;
  onDiscardCart: (cartId: string) => void;
}

export function HeldCartsModal({ isOpen, onClose, heldCarts, onResumeCart, onDiscardCart }: HeldCartsModalProps) {
  const confirm = useConfirm();

  const discard = async (cart: HeldCart, label: string) => {
    const ok = await confirm({
      title: `Discard ${label}?`,
      message: `${cart.items.length} ${cart.items.length === 1 ? 'line' : 'lines'} worth ${formatInr(cart.grandTotal)} will be removed. This cannot be undone.`,
      confirmLabel: 'Discard bill',
      danger: true,
    });
    if (ok) onDiscardCart(cart.id);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Held bills"
      description={`${heldCarts.length} ${heldCarts.length === 1 ? 'bill' : 'bills'} currently paused`}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {heldCarts.length === 0 ? (
        <EmptyState
          icon={<PauseCircle />}
          title="No held bills"
          description='Use the "Hold" button on the register when a customer steps aside.'
        />
      ) : (
        <ul className="space-y-3">
          {heldCarts.map((hc, idx) => {
            const label = `Cart #${idx + 1}`;
            return (
              <li key={hc.id} className="p-3.5 rounded-md border border-zinc-200 bg-zinc-50 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-zinc-900">{label}</span>
                    {hc.customerName && <Badge tone="primary">{hc.customerName}</Badge>}
                  </div>
                  <p className="text-[11px] text-zinc-600 truncate mt-1">
                    {hc.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-mono mt-1.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(hc.heldAt)}
                    </span>
                    <span>•</span>
                    <span>{hc.items.reduce((s, i) => s + i.quantity, 0)} items</span>
                    <span>•</span>
                    <span className="font-bold text-zinc-900">{formatInr(hc.grandTotal)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button size="sm" icon={<Play weight="fill" className="w-3 h-3" />} onClick={() => onResumeCart(hc)}>
                    Resume
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    aria-label={`Discard ${label}`}
                    title="Discard held bill"
                    icon={<Trash className="w-3.5 h-3.5" />}
                    onClick={() => discard(hc, label)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Dialog>
  );
}
