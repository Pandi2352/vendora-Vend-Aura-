import { useCallback, useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../cn';
import { positionStyle, useAnchoredPosition, type Placement } from './useAnchoredPosition';

export interface PopoverTriggerProps {
  ref: RefObject<HTMLButtonElement | null>;
  onClick: () => void;
  'aria-expanded': boolean;
  'aria-controls': string | undefined;
  'aria-haspopup': 'dialog';
}

interface PopoverProps {
  /** Render the trigger and spread `props` on a button. */
  trigger: (props: PopoverTriggerProps, state: { open: boolean }) => ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  placement?: Placement;
  /** Accessible name of the floating panel. */
  label: string;
  className?: string;
  /** Controlled mode. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Return focus to the trigger on close (default true). */
  restoreFocus?: boolean;
}

/**
 * Click-triggered floating panel (role="dialog", non-modal): portal, flip and
 * clamp, focus moved inside on open, Escape / outside click close, focus returned.
 */
export function Popover({
  trigger,
  children,
  placement = 'bottom-start',
  label,
  className,
  open: controlledOpen,
  onOpenChange,
  restoreFocus = true,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const panelId = useId();
  const position = useAnchoredPosition(triggerRef, open, { placement, panelRef, gap: 6, preferredHeight: 480 });

  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  const close = useCallback(() => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, [setOpen, restoreFocus]);

  useEffect(() => {
    if (!open || !position) return;
    const first = panelRef.current?.querySelector<HTMLElement>(
      '[data-autofocus], button:not([disabled]), input:not([disabled]), [tabindex="0"]',
    );
    (first ?? panelRef.current)?.focus();
    // Focus only when the panel first appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, position === null]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !triggerRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open, close, setOpen]);

  return (
    <>
      {trigger(
        {
          ref: triggerRef,
          onClick: () => setOpen(!open),
          'aria-expanded': open,
          'aria-controls': open ? panelId : undefined,
          'aria-haspopup': 'dialog',
        },
        { open },
      )}
      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label={label}
            tabIndex={-1}
            style={position ? positionStyle(position) : { visibility: 'hidden', left: 0, top: 0 }}
            className={cn('fixed z-[75] bg-white border border-zinc-200 rounded-md outline-none', className)}
          >
            {typeof children === 'function' ? children(close) : children}
          </div>,
          document.body,
        )}
    </>
  );
}
