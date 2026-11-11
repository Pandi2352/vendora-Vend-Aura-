import { useContext } from 'react';
import { ConfirmContext } from '@/components/feedback/ConfirmProvider';

/** `if (await confirm({ title: 'Discard bill?', danger: true })) …` */
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return ctx;
}
