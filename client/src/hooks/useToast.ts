import { useContext } from 'react';
import { ToastContext } from '@/components/feedback/ToastContext';

/** toast.success('Customer saved') / toast.error('Could not save', reason) */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
