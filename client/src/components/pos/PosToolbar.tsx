import { ArrowUDownLeft, PauseCircle, Vault } from '@phosphor-icons/react';
import { usePosSession } from '../../hooks/usePosSession';
import { Button } from '../ui';

/** Register actions above the POS: returns, held bills, cash drawer. */
export function PosToolbar() {
  const { heldCarts, isShiftOpen, setOpenModal } = usePosSession();

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 px-4 py-2 bg-white border-b border-zinc-200 shrink-0">
      <Button size="sm" variant="secondary" icon={<ArrowUDownLeft className="w-4 h-4" />} onClick={() => setOpenModal('returns')}>
        Sales return
      </Button>
      <Button
        size="sm"
        variant="secondary"
        icon={<PauseCircle className="w-4 h-4" />}
        onClick={() => setOpenModal('heldCarts')}
        disabled={heldCarts.length === 0}
      >
        Held bills ({heldCarts.length}) <span className="text-[0.625rem] opacity-60 ml-1">F3</span>
      </Button>
      <Button
        size="sm"
        variant={isShiftOpen ? 'secondary' : 'primary'}
        icon={<Vault className="w-4 h-4" />}
        onClick={() => setOpenModal('drawer')}
      >
        {isShiftOpen ? 'Cash drawer' : 'Open drawer'} <span className="text-[0.625rem] opacity-60 ml-1">F4</span>
      </Button>
    </div>
  );
}
