import { Link, useLocation } from 'react-router-dom';
import { isNavItemActive, isPathActive, type NavItem } from '../../config/navigation';
import { useFlyout } from '../../hooks/useFlyout';
import { cn } from '../ui/cn';
import { SidebarFlyout } from './SidebarFlyout';
import { SidebarGroup } from './SidebarGroup';
import { navIconClass, navRowClass } from './sidebarStyles';

interface SidebarNavItemProps {
  item: NavItem;
  collapsed: boolean;
  onNavigate: () => void;
  /** Expanded sidebar only: whether this section is the open one. */
  open?: boolean;
  onToggle?: () => void;
}

/**
 * Sidebar entry: a link; or a section that expands inline (expanded sidebar)
 * or opens a flyout beside the icon rail (collapsed sidebar).
 */
export function SidebarNavItem({ item, collapsed, onNavigate, open = false, onToggle }: SidebarNavItemProps) {
  if (!item.children) return <SidebarLink item={item} collapsed={collapsed} onNavigate={onNavigate} />;
  if (!collapsed)
    return <SidebarGroup item={item} open={open} onToggle={onToggle ?? (() => {})} onNavigate={onNavigate} />;
  return <CollapsedSection item={item} onNavigate={onNavigate} />;
}

function BadgeDot({ collapsed }: { collapsed: boolean }) {
  return collapsed ? (
    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-orange-500" aria-hidden />
  ) : (
    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" aria-hidden />
  );
}

function SidebarLink({ item, collapsed, onNavigate }: Pick<SidebarNavItemProps, 'item' | 'collapsed' | 'onNavigate'>) {
  const { pathname, search } = useLocation();
  const active = isPathActive(item.path!, pathname, search);
  const Icon = item.icon;
  return (
    <Link
      to={item.path!}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-label={collapsed ? item.label : undefined}
      aria-current={active ? 'page' : undefined}
      className={navRowClass(active, collapsed)}
    >
      <Icon className={navIconClass(active)} />
      {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
      {item.badgeDot && <BadgeDot collapsed={collapsed} />}
    </Link>
  );
}

function CollapsedSection({ item, onNavigate }: Pick<SidebarNavItemProps, 'item' | 'onNavigate'>) {
  const { pathname, search } = useLocation();
  const flyout = useFlyout<HTMLButtonElement>();
  const active = isNavItemActive(item, pathname, search);
  const Icon = item.icon;

  return (
    <>
      <button
        ref={flyout.triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={flyout.isOpen}
        aria-label={item.label}
        title={item.label}
        onPointerEnter={flyout.open}
        onPointerLeave={flyout.scheduleClose}
        onClick={flyout.toggle}
        className={cn(navRowClass(active, true), flyout.isOpen && !active && 'bg-shell-hover')}
      >
        <Icon className={navIconClass(active)} />
        {item.badgeDot && <BadgeDot collapsed />}
      </button>
      {flyout.position && (
        <SidebarFlyout
          title={item.sectionTitle || item.label}
          items={item.children!}
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
