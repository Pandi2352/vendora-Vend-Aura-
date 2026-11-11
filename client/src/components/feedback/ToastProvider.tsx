import { createContext, useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, Info, Warning, WarningCircle, X } from '@phosphor-icons/react';
import { cn } from '../ui/cn';

export type ToastTone = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

export interface ToastApi {
  show: (toast: Omit<ToastItem, 'id'>, durationMs?: number) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

const TONES: Record<ToastTone, { icon: ReactNode; className: string }> = {
  success: { icon: <CheckCircle weight="fill" />, className: 'border-emerald-200 text-emerald-700' },
  error: { icon: <WarningCircle weight="fill" />, className: 'border-red-200 text-red-700' },
  warning: { icon: <Warning weight="fill" />, className: 'border-amber-200 text-amber-700' },
  info: { icon: <Info weight="fill" />, className: 'border-primary-200 text-primary-700' },
};

const DEFAULT_DURATION = 4000;
const MAX_TOASTS = 4;

/** Toast notifications, bottom-right, announced to screen readers (errors assertively). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback<ToastApi['show']>(
    (toast, durationMs = DEFAULT_DURATION) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-(MAX_TOASTS - 1)), { ...toast, id }]);
      if (durationMs > 0) window.setTimeout(() => dismiss(id), durationMs);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (title, description) => show({ tone: 'success', title, description }),
      error: (title, description) => show({ tone: 'error', title, description }, 6000),
      warning: (title, description) => show({ tone: 'warning', title, description }),
      info: (title, description) => show({ tone: 'info', title, description }),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[80] flex flex-col gap-2 w-[min(360px,calc(100vw-2rem))]">
          {toasts.map((t) => (
            <div
              key={t.id}
              role={t.tone === 'error' ? 'alert' : 'status'}
              aria-live={t.tone === 'error' ? 'assertive' : 'polite'}
              className={cn('flex items-start gap-3 bg-white border rounded-md px-3.5 py-3', TONES[t.tone].className)}
            >
              <span className="shrink-0 mt-0.5 [&>svg]:w-5 [&>svg]:h-5">{TONES[t.tone].icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900">{t.title}</p>
                {t.description && <p className="text-xs text-zinc-600 mt-0.5">{t.description}</p>}
              </div>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismiss(t.id)}
                className="w-6 h-6 inline-flex items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}
