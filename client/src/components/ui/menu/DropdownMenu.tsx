import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { DotsThree } from '@phosphor-icons/react';
import { cn } from '../cn';
import { positionStyle, useAnchoredPosition, type Placement } from '../overlay/useAnchoredPosition';
import { buildMenu, firstEnabledItem, lastEnabledItem, typeAheadItem, wrapEnabledIndex, type MenuActionItem, type MenuEntry } from './menu-utils';

const TYPEAHEAD_RESET_MS = 600;

export interface MenuTriggerProps {
  ref: RefObject<HTMLButtonElement | null>;
  id: string;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
  'aria-haspopup': 'menu';
  'aria-expanded': boolean;
  'aria-controls': string | undefined;
}

export interface DropdownMenuProps {
  items: MenuEntry[];
  /** Render a custom trigger; spread `props` on a <button>. */
  trigger?: (props: MenuTriggerProps, state: { open: boolean }) => ReactNode;
  /** Accessible name of the default icon button (and of the menu). */
  label?: string;
  /** Icon of the default trigger (default: three dots). */
  icon?: ReactNode;
  placement?: Placement;
  className?: string;
}

/**
 * Actions menu following the WAI-ARIA APG Menu Button pattern: Enter / Space /
 * ArrowDown open on the first item, ArrowUp on the last; arrows (wrapping),
 * Home / End and type-ahead move focus; Enter / Space activate; Esc closes and
 * returns focus; Tab and outside click close.
 */
export function DropdownMenu({ items, trigger, label = 'More actions', icon, placement = 'bottom-end', className }: DropdownMenuProps) {
  const baseId = useId();
  const triggerId = `menu-trigger-${baseId}`;
  const menuId = `menu-${baseId}`;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const typeAhead = useRef({ text: '', timer: 0 });

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { sections, items: actions } = useMemo(() => buildMenu(items), [items]);
  const position = useAnchoredPosition(triggerRef, open, { placement, panelRef, preferredHeight: 360 });

  const openMenu = (focus: 'first' | 'last') => {
    setActiveIndex(focus === 'first' ? firstEnabledItem(actions) : lastEnabledItem(actions));
    setOpen(true);
  };
  // Focus returns to the trigger after the close has rendered; focusing inside the
  // key handler lets the roving-focus effect run once more and steal it back.
  const refocusOnClose = useRef(false);
  const close = (refocus = true) => {
    refocusOnClose.current = refocus;
    setOpen(false);
    setActiveIndex(-1);
    typeAhead.current.text = '';
  };

  useEffect(() => {
    if (!open && refocusOnClose.current) {
      refocusOnClose.current = false;
      triggerRef.current?.focus();
    }
  }, [open]);

  // Roving focus: the active item holds DOM focus once the panel is positioned.
  useEffect(() => {
    if (!open || !position) return;
    (activeIndex >= 0 ? itemRefs.current[activeIndex] : panelRef.current)?.focus();
  }, [open, position, activeIndex]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const activate = (index: number) => {
    const item = actions[index];
    if (!item || item.disabled) return;
    close();
    item.onSelect?.();
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      openMenu('first');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openMenu('last');
    }
  };

  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const move = (index: number) => {
      e.preventDefault();
      if (index >= 0) setActiveIndex(index);
    };
    switch (e.key) {
      case 'ArrowDown':
        return move(wrapEnabledIndex(actions, activeIndex, 1));
      case 'ArrowUp':
        return move(wrapEnabledIndex(actions, activeIndex < 0 ? actions.length : activeIndex, -1));
      case 'Home':
      case 'PageUp':
        return move(firstEnabledItem(actions));
      case 'End':
      case 'PageDown':
        return move(lastEnabledItem(actions));
      case 'Enter':
      case ' ': {
        e.preventDefault();
        const item = actions[activeIndex];
        if (item?.href && !item.disabled) itemRefs.current[activeIndex]?.click();
        else activate(activeIndex);
        return;
      }
      case 'Escape':
        e.preventDefault();
        e.stopPropagation(); // don't also close a surrounding dialog
        return close();
      case 'Tab':
        // Focus the trigger so the browser's Tab continues from there.
        return close();
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const ta = typeAhead.current;
          window.clearTimeout(ta.timer);
          ta.text += e.key;
          ta.timer = window.setTimeout(() => (ta.text = ''), TYPEAHEAD_RESET_MS);
          move(typeAheadItem(actions, ta.text, ta.text.length > 1 ? activeIndex - 1 : activeIndex));
        }
    }
  };

  const triggerProps: MenuTriggerProps = {
    ref: triggerRef,
    id: triggerId,
    onClick: () => (open ? close() : openMenu('first')),
    onKeyDown: onTriggerKeyDown,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': open ? menuId : undefined,
  };

  return (
    <>
      {trigger ? (
        trigger(triggerProps, { open })
      ) : (
        <button
          type="button"
          {...triggerProps}
          aria-label={label}
          title={label}
          className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 cursor-pointer [&>svg]:w-5 [&>svg]:h-5"
        >
          {icon ?? <DotsThree weight="bold" />}
        </button>
      )}
      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={menuId}
            role="menu"
            aria-labelledby={triggerId}
            tabIndex={-1}
            onKeyDown={onMenuKeyDown}
            style={position ? { ...positionStyle(position), maxHeight: position.maxHeight } : { visibility: 'hidden', left: 0, top: 0 }}
            className={cn('fixed z-[75] min-w-48 max-w-xs overflow-y-auto p-1 bg-white border border-zinc-200 rounded-md outline-none', className)}
          >
            {sections.map((section, s) => (
              <MenuGroup key={s} label={section.label} id={`${menuId}-g${s}`} divided={s > 0}>
                {section.entries.map(({ entry, itemIndex }, i) =>
                  entry.type === 'separator' ? (
                    <div key={`sep-${i}`} role="separator" className="my-1 h-px bg-zinc-100" />
                  ) : (
                    <MenuItemView
                      key={`${entry.label}-${i}`}
                      item={entry}
                      active={itemIndex === activeIndex}
                      itemRef={(node) => (itemRefs.current[itemIndex] = node)}
                      onHover={() => !entry.disabled && setActiveIndex(itemIndex)}
                      onActivate={() => activate(itemIndex)}
                    />
                  ),
                )}
              </MenuGroup>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

function MenuGroup({ label, id, divided, children }: { label?: string; id: string; divided: boolean; children: ReactNode }) {
  if (!label) return <>{children}</>;
  return (
    <div role="group" aria-labelledby={id} className={cn(divided && 'mt-1 pt-1 border-t border-zinc-100')}>
      <div id={id} role="presentation" className="px-2.5 pt-1.5 pb-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </div>
      {children}
    </div>
  );
}

interface MenuItemViewProps {
  item: MenuActionItem;
  active: boolean;
  itemRef: (node: HTMLElement | null) => void;
  onHover: () => void;
  onActivate: () => void;
}

function MenuItemView({ item, active, itemRef, onHover, onActivate }: MenuItemViewProps) {
  const className = cn(
    'flex w-full items-center gap-2.5 px-2.5 py-2 rounded-md text-left text-sm select-none outline-none',
    item.disabled ? 'text-zinc-300 cursor-not-allowed' : 'cursor-pointer',
    !item.disabled && (item.danger ? 'text-red-600' : 'text-zinc-800'),
    active && !item.disabled && (item.danger ? 'bg-red-50' : 'bg-primary-50 text-primary-700'),
  );
  const content = (
    <>
      {item.icon && <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{item.icon}</span>}
      <span className="flex-1 min-w-0">
        <span className="block truncate">{item.label}</span>
        {item.description && <span className="block text-xs text-zinc-500 truncate">{item.description}</span>}
      </span>
      {item.shortcut && <kbd aria-hidden className="shrink-0 font-sans text-xs text-zinc-400">{item.shortcut}</kbd>}
    </>
  );
  const common = {
    ref: itemRef,
    role: 'menuitem',
    tabIndex: -1,
    'aria-disabled': item.disabled || undefined,
    'aria-keyshortcuts': item.shortcut,
    onMouseEnter: onHover,
    className,
  };
  return item.href && !item.disabled ? (
    <a {...common} href={item.href} onClick={onActivate}>
      {content}
    </a>
  ) : (
    <button {...common} type="button" onClick={item.disabled ? undefined : onActivate}>
      {content}
    </button>
  );
}
