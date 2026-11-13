import { useId } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { CaretDown } from '@phosphor-icons/react';
import { isNavItemActive, type NavItem } from '../../config/navigation';
import { cn } from '../ui/cn';
import { navChildClass, navIconClass, navRowClass } from './sidebarStyles';

interface SidebarGroupProps {
  item: NavItem;
  /** Controlled by the sidebar so only one section is open at a time. */
  open: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}

/**
 * Expandable sidebar section (expanded sidebar): heading with a chevron, and
 * its pages as an indented list with a thin guide line. The sidebar decides
 * which section is open (one at a time; the current page's section by default).
 */
export function SidebarGroup({ item, open, onToggle, onNavigate }: SidebarGroupProps) {
  const { pathname } = useLocation();
  const containsActive = isNavItemActive(item, pathname);
  const listId = useId();
  const Icon = item.icon;

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={onToggle}
        className={cn(navRowClass(false), containsActive && !open && 'text-primary-700')}
      >
        <Icon className={navIconClass(containsActive && !open)} />
        <span className="flex-1 text-left truncate">{item.label}</span>
        {item.badgeDot && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" aria-hidden />}
        <CaretDown
          aria-hidden
          className={cn(
            'w-3.5 h-3.5 shrink-0 text-shell-muted transition-transform duration-200',
            !open && '-rotate-90',
          )}
        />
      </button>

      {open && (
        <ul id={listId} className="relative mt-0.5 mb-1 ml-[1.1875rem] pl-3 border-l border-shell-border space-y-0.5">
          {item.children!.map((child) => (
            <li key={child.label}>
              <NavLink to={child.path!} onClick={onNavigate} className={({ isActive }) => navChildClass(isActive)}>
                <span className="truncate">{child.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
