import { NavLink, useLocation } from 'react-router-dom';
import { isNavItemActive, type NavItem } from '../../config/navigation';
import { useFlyout } from '../../hooks/useFlyout';
import { SidebarFlyout } from './SidebarFlyout';
import { cn } from '../ui/cn';

interface SidebarNavItemProps {
  item: NavItem;
  collapsed: boolean;
  onNavigate: () => void;
}

const baseClass =
  'group relative w-full flex items-center gap-3 rounded-lg text-xs font-bold transition-colors cursor-pointer h-9';

function itemClass(active: boolean, collapsed: boolean) {
  return cn(
    baseClass,
    collapsed ? 'justify-center px-0' : 'px-3',
    active
      ? 'bg-[#2563eb] text-white font-bold'
      : 'text-[#cbd5e6] hover:bg-[#1a2b4c] hover:text-white',
  );
}

/** Sidebar entry: a link, or a parent that opens a flyout of its children. */
export function SidebarNavItem({ item, collapsed, onNavigate }: SidebarNavItemProps) {
  const { pathname } = useLocation();
  const flyout = useFlyout<HTMLButtonElement>();
  const Icon = item.icon;

  if (!item.children) {
    return (
      <NavLink
        to={item.path!}
        onClick={onNavigate}
        title={collapsed ? item.label : undefined}
        aria-label={collapsed ? item.label : undefined}
        className={({ isActive }) => itemClass(isActive, collapsed)}
      >
        {({ isActive }) => (
          <>
            <Icon
              className={cn(
                'shrink-0 transition-colors ms-hover-fill',
                isActive ? 'text-white ms-fill' : 'text-[#7b89a3] group-hover:text-white',
              )}
            />
            {!collapsed && (
              <>
                <span className="flex-1 text-left truncate">{item.label}</span>
                {item.badgeDot && (
                  <span className="w-2 h-2 rounded-full bg-[#f97316] shrink-0" />
                )}
              </>
            )}
            {collapsed && item.badgeDot && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#f97316]" />
            )}
          </>
        )}
      </NavLink>
    );
  }

  const active = isNavItemActive(item, pathname);

  return (
    <>
      <button
        ref={flyout.triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={flyout.isOpen}
        aria-label={collapsed ? item.label : undefined}
        title={collapsed ? item.label : undefined}
        onPointerEnter={flyout.open}
        onPointerLeave={flyout.scheduleClose}
        onClick={flyout.toggle}
        className={cn(itemClass(active, collapsed), flyout.isOpen && !active && 'bg-[#1a2b4c]')}
      >
        <Icon
          className={cn(
            'shrink-0 transition-colors ms-hover-fill',
            active ? 'text-white ms-fill' : 'text-[#7b89a3] group-hover:text-white',
          )}
        />
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{item.label}</span>
            {item.badgeDot && (
              <span className="w-2 h-2 rounded-full bg-[#f97316] shrink-0" />
            )}
            <span
              className={cn(
                'ms text-[16px] shrink-0 transition-colors',
                active ? 'text-white' : 'text-[#6f7a8d] group-hover:text-white',
              )}
            >
              chevron_right
            </span>
          </>
        )}
        {collapsed && item.badgeDot && (
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#f97316]" />
        )}
      </button>
      {flyout.position && (
        <SidebarFlyout
          title={item.sectionTitle || item.label}
          items={item.children}
          position={flyout.position}
          panelRef={flyout.panelRef}
          onPointerEnter={flyout.cancelClose}
          onPointerLeave={flyout.scheduleClose}
          onNavigate={() => {
            flyout.close();
            onNavigate();
          }}
        />
      )}
    </>
  );
}
