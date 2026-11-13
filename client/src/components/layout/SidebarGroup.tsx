import { useId } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CaretDown } from '@phosphor-icons/react';
import { isNavItemActive, isPathActive, type NavItem } from '../../config/navigation';
import { useTheme } from '../../hooks/useTheme';
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
  const { pathname, search } = useLocation();
  const { config } = useTheme();
  const containsActive = isNavItemActive(item, pathname, search);
  const listId = useId();
  const Icon = item.icon;

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={onToggle}
        className={cn(
          navRowClass(false, false, config.sidebarStyle),
          containsActive && !open && (config.sidebarStyle === 'dark' || config.sidebarStyle === 'brand' ? 'text-primary-400 font-semibold' : 'text-primary-700 font-semibold'),
        )}
      >
        <Icon className={navIconClass(containsActive && !open, config.sidebarStyle)} />
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
          {item.children!.map((child) => {
            const active = isPathActive(child.path!, pathname, search);
            return (
              <li key={child.label}>
                <Link
                  to={child.path!}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={navChildClass(active, config.sidebarStyle)}
                >
                  <span className="truncate">{child.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
