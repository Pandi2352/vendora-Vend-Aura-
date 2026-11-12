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
      className="fixed z-[100] min-w-[220px] bg-shell border border-shell-border rounded-md p-2 shadow-2xl animate-flyout-in"
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
                'group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold transition-colors',
                isActive ? 'bg-[#2563eb] text-white font-bold' : 'text-[#cbd5e6] hover:bg-[#1a2b4c] hover:text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'shrink-0 transition-colors ms-hover-fill',
                    isActive ? 'text-white ms-fill' : 'text-[#7b89a3] group-hover:text-white',
                  )}
                />
                <span>{item.label}</span>
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
          'group w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-bold transition-colors cursor-pointer',
          flyout.isOpen ? 'bg-[#1a2b4c] text-white' : 'text-[#cbd5e6] hover:bg-[#1a2b4c] hover:text-white',
        )}
      >
        <item.icon className="shrink-0 ms-hover-fill" />
        <span className="flex-1 text-left">{item.label}</span>
        <span className="ms text-[16px] text-shell-muted group-hover:text-white">chevron_right</span>
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
