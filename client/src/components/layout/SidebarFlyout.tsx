import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
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

/** Floating sub-menu panel rendered with rounded-md and portal stacking above outlet cards. */
export function SidebarFlyout({
  title,
  items,
  position,
  panelRef,
  onPointerEnter,
  onPointerLeave,
  onNavigate,
}: SidebarFlyoutProps) {
  return createPortal(
    <div
      ref={panelRef}
      role="menu"
      aria-label={title}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={{ top: position.top, left: position.left }}
      className="fixed z-[100] w-max min-w-[9.6875rem] max-w-[15rem] bg-shell-raised border border-shell-border rounded-md p-1.5 animate-flyout-in"
    >
      <p className="px-3 pt-1 pb-2 text-[0.625rem] font-bold uppercase tracking-wider text-shell-muted whitespace-nowrap">
        {title}
      </p>
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
                'group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[0.8125rem] transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-shell-text font-medium hover:bg-shell-hover',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'shrink-0 transition-colors ms-hover-fill',
                    isActive ? 'text-primary-600 ms-fill' : 'text-shell-muted group-hover:text-shell-text',
                  )}
                />
                <span className="whitespace-nowrap">{item.label}</span>
              </>
            )}
          </NavLink>
        ),
      )}
    </div>,
    document.body,
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
          'group w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[0.8125rem] font-medium transition-colors cursor-pointer whitespace-nowrap',
          flyout.isOpen ? 'bg-shell-hover text-shell-text' : 'text-shell-text hover:bg-shell-hover',
        )}
      >
        <item.icon className="shrink-0 text-shell-muted ms-hover-fill" />
        <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
        <span className="ms text-[1rem] text-shell-muted group-hover:text-shell-text">chevron_right</span>
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
