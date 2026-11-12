import { cloneElement, useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { positionStyle, useAnchoredPosition, type Placement } from './useAnchoredPosition';

interface TooltipProps {
  content: ReactNode;
  /** One focusable element (button, link, input). Its props are merged. */
  children: ReactElement<Record<string, unknown>>;
  placement?: Extract<Placement, 'top' | 'bottom'>;
  /** Hover delay before showing (ms). Focus shows immediately. */
  delay?: number;
}

/**
 * Short help text on hover and keyboard focus (WCAG 1.4.13: dismissible with
 * Escape, hoverable, persistent while hovered). Linked with aria-describedby,
 * so screen readers read it with the control. Never put essential info only here.
 */
export function Tooltip({ content, children, placement = 'top', delay = 300 }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const position = useAnchoredPosition(anchorRef, open, { placement, panelRef, gap: 6, preferredHeight: 120 });

  const show = (immediate = false) => {
    window.clearTimeout(timer.current);
    if (immediate) setOpen(true);
    else timer.current = window.setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), 80);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const childProps = children.props;
  const merge =
    (name: string, fn: () => void) =>
    (...args: unknown[]) => {
      (childProps[name] as ((...a: unknown[]) => void) | undefined)?.(...args);
      fn();
    };

  const trigger = cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      anchorRef.current = node;
    },
    'aria-describedby': [childProps['aria-describedby'], id].filter(Boolean).join(' '),
    onPointerEnter: merge('onPointerEnter', () => show()),
    onPointerLeave: merge('onPointerLeave', hide),
    onFocus: merge('onFocus', () => show(true)),
    onBlur: merge('onBlur', () => setOpen(false)),
  });

  return (
    <>
      {trigger}
      {/* Always in the DOM so aria-describedby resolves; visible only when open. */}
      {createPortal(
        <div
          ref={panelRef}
          id={id}
          role="tooltip"
          onPointerEnter={() => show(true)}
          onPointerLeave={hide}
          style={open && position ? positionStyle(position) : undefined}
          className={
            open && position
              ? 'fixed z-[90] max-w-64 rounded-md bg-ink px-2.5 py-1.5 text-xs font-medium text-white'
              : 'sr-only'
          }
        >
          {content}
        </div>,
        document.body,
      )}
    </>
  );
}
