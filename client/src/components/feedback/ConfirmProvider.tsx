import { createContext, useCallback, useRef, useState, type ReactNode } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';

export interface ConfirmOptions {
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button for destructive actions (delete, suspend, discard). */
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * App-wide confirmation dialog. `const confirm = useConfirm();
 * if (await confirm({ title: 'Delete customer?', danger: true })) …`
 * Replaces window.confirm with an accessible, on-brand dialog.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<(value: boolean) => void>(() => {});

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = (value: boolean) => {
    resolver.current(value);
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        open={!!options}
        onClose={() => settle(false)}
        title={options?.title ?? ''}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => settle(false)}>
              {options?.cancelLabel ?? 'Cancel'}
            </Button>
            <Button variant={options?.danger ? 'danger' : 'primary'} onClick={() => settle(true)} data-autofocus>
              {options?.confirmLabel ?? 'Confirm'}
            </Button>
          </>
        }
      >
        {options?.message && <div className="text-sm text-zinc-600">{options.message}</div>}
      </Dialog>
    </ConfirmContext.Provider>
  );
}
