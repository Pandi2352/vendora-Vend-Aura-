import { useContext } from 'react';
import { PosSessionContext } from '../app/providers/PosSessionContext';

export function usePosSession() {
  const ctx = useContext(PosSessionContext);
  if (!ctx) throw new Error('usePosSession must be used inside <PosSessionProvider>');
  return ctx;
}
