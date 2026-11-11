import { SignOut } from '@phosphor-icons/react';
import { navigationForRole } from '../../config/navigation';
import { useAuth } from '../../hooks/useAuth';
import { SidebarNavItem } from './SidebarNavItem';
import { cn } from '../ui/cn';

interface SidebarProps {
  collapsed: boolean;
  /** Mobile drawer state; ignored on large screens. */
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

/** Left navigation: expanded (icons + labels) or collapsed (icons only); off-canvas drawer on small screens. */
export function Sidebar({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const { user, logout } = useAuth();
  const items = navigationForRole(user?.role);
  // The mobile drawer always shows labels.
  const showCollapsed = collapsed && !mobileOpen;

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}
      <aside
        aria-label="Main navigation"
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 lg:z-auto flex flex-col bg-shell border-r border-shell-border',
          'transition-[width,transform] duration-200 shrink-0',
          'top-14 lg:top-0',
          showCollapsed ? 'w-16' : 'w-60',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-2.5 py-3 space-y-1">
          {items.map((item) => (
            <SidebarNavItem key={item.label} item={item} collapsed={showCollapsed} onNavigate={onCloseMobile} />
          ))}
        </nav>

        <div className="border-t border-shell-border p-2.5">
          <button
            type="button"
            onClick={logout}
            title={showCollapsed ? 'Sign out' : undefined}
            aria-label="Sign out"
            className={cn(
              'w-full flex items-center gap-3 h-10 rounded-md text-sm font-semibold text-shell-text hover:bg-shell-hover transition-colors cursor-pointer',
              showCollapsed ? 'justify-center' : 'px-3',
            )}
          >
            <SignOut className="w-[18px] h-[18px] shrink-0" />
            {!showCollapsed && (
              <span className="truncate">Sign out · {user?.fullName || user?.username}</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
