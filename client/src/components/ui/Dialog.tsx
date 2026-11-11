import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from '@phosphor-icons/react';
import { cn } from './cn';

const SIZES = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' } as const;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Open dialogs, newest last. Only the topmost one reacts to Escape / Tab. */
const openDialogs: symbol[] = [];

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof SIZES;
  /** Prevent closing by Escape / backdrop (e.g. while saving). */
  dismissible?: boolean;
}

/**
 * Modal dialog: portal, aria-modal, focus moved inside and trapped, Escape and
 * backdrop close, focus returned to the opener, page scroll locked.
 */
export function Dialog({ open, onClose, title, description, children, footer, size = 'md', dismissible = true }: DialogProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // Latest onClose without re-running the open effect (inline handlers change every render).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    // Focus the first field, else the panel itself.
    const first = panel?.querySelector<HTMLElement>('[data-autofocus], input:not([disabled]), textarea, button[role="combobox"]');
    (first ?? panel)?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const token = Symbol('dialog');
    openDialogs.push(token);

    const onKeyDown = (e: KeyboardEvent) => {
      if (openDialogs[openDialogs.length - 1] !== token) return; // a dialog opened on top handles keys
      if (e.key === 'Escape' && dismissible) {
        e.stopPropagation();
        onCloseRef.current();
      }
      if (e.key !== 'Tab' || !panel) return;
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (focusables.length === 0) return;
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      openDialogs.splice(openDialogs.indexOf(token), 1);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open, dismissible]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" aria-hidden onClick={() => dismissible && onClose()} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn('relative w-full bg-white border border-zinc-200 rounded-md flex flex-col max-h-[90vh] outline-none', SIZES[size])}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-zinc-100">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-bold text-zinc-900">
              {title}
            </h2>
            {description && (
              <p id={descId} className="text-xs text-zinc-500 mt-0.5">
                {description}
              </p>
            )}
          </div>
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="w-8 h-8 inline-flex items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-zinc-100 bg-zinc-50">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
