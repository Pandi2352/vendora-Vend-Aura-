import { NavLink, useLocation } from 'react-router-dom';
import { CaretRight } from '@phosphor-icons/react';
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
  'group w-full flex items-center gap-3 rounded-md text-sm font-semibold transition-colors cursor-pointer h-10';

function itemClass(active: boolean, collapsed: boolean) {
  return cn(
    baseClass,
    collapsed ? 'justify-center px-0' : 'px-3',
    active ? 'bg-primary-600 text-white' : 'text-shell-text hover:bg-shell-hover',
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
        <Icon className="w-[18px] h-[18px] shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
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
        className={cn(itemClass(active, collapsed), flyout.isOpen && !active && 'bg-shell-hover')}
      >
        <Icon className="w-[18px] h-[18px] shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{item.label}</span>
            <CaretRight className="w-3.5 h-3.5 opacity-60" />
          </>
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
