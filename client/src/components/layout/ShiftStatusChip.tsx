import { Vault } from '@phosphor-icons/react';
import { usePosSession } from '../../hooks/usePosSession';
import { formatInr } from '@/utils';
import { cn } from '../ui/cn';

/** Cash drawer status in the top bar; opens the drawer dialog. */
export function ShiftStatusChip() {
  const { activeShift, isShiftOpen, setOpenModal } = usePosSession();

  return (
    <button
      type="button"
      onClick={() => setOpenModal('drawer')}
      title="Cash drawer shift"
      className={cn(
        'hidden md:inline-flex items-center gap-2 h-9 px-3 rounded-md border text-xs font-bold transition-colors cursor-pointer',
        isShiftOpen
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
      )}
    >
      <Vault className="w-4 h-4" />
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden />
      <span>{isShiftOpen ? `Drawer ${formatInr(activeShift?.expectedCash ?? 0)}` : 'Open drawer'}</span>
    </button>
  );
}
