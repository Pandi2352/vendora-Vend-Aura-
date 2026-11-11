import { NavLink } from 'react-router-dom';
import { CaretRight } from '@phosphor-icons/react';
import type { NavItem } from '../../config/navigation';
import { useFlyout } from '../../hooks/useFlyout';
import { cn } from '../ui/cn';

interface SidebarFlyoutProps {
  title: string;
  items: NavItem[];
  position: { top: number; left: number };
  panelRef: React.RefObject<HTMLDivElement | null>;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onNavigate: () => void;
}

/** Floating sub-menu panel. Children with their own children open a nested flyout. */
export function SidebarFlyout({
  title,
  items,
  position,
  panelRef,
  onPointerEnter,
  onPointerLeave,
  onNavigate,
}: SidebarFlyoutProps) {
  return (
    <div
      ref={panelRef}
      role="menu"
      aria-label={title}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={{ top: position.top, left: position.left }}
      className="fixed z-50 min-w-[220px] bg-shell-raised border border-shell-border rounded-md p-2"
    >
      <p className="px-2.5 pt-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-shell-muted">{title}</p>
      {items.map((item) =>
        item.children ? (
          <NestedFlyoutItem key={item.label} item={item} onNavigate={onNavigate} />
        ) : (
          <NavLink
            key={item.label}
            to={item.path!}
            role="menuitem"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-semibold transition-colors',
                isActive ? 'bg-primary-600 text-white' : 'text-shell-text hover:bg-shell-hover',
              )
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ),
      )}
    </div>
  );
}

function NestedFlyoutItem({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const flyout = useFlyout<HTMLButtonElement>();

  return (
    <>
      <button
        ref={flyout.triggerRef}
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={flyout.isOpen}
        onPointerEnter={flyout.open}
        onPointerLeave={flyout.scheduleClose}
        onClick={flyout.toggle}
        className={cn(
          'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer',
          flyout.isOpen ? 'bg-shell-hover text-white' : 'text-shell-text hover:bg-shell-hover',
        )}
      >
        <item.icon className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        <CaretRight className="w-3 h-3 text-shell-muted" />
      </button>
      {flyout.position && (
        <SidebarFlyout
          title={item.sectionTitle || item.label}
          items={item.children!}
          position={flyout.position}
          panelRef={flyout.panelRef}
          onPointerEnter={flyout.cancelClose}
          onPointerLeave={flyout.scheduleClose}
          onNavigate={onNavigate}
        />
      )}
    </>
  );
}
