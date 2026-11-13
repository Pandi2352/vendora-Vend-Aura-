import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { findActiveSection, navigationForRole } from '../../config/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../ui/cn';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarUserCard } from './SidebarUserCard';
import { sidebarContainerClass } from './sidebarStyles';

interface SidebarProps {
  collapsed: boolean;
  /** Mobile drawer state; ignored on large screens. */
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

/**
 * Left navigation on the light shell: expanded (sections open inline) or
 * collapsed (icon rail with flyouts); off-canvas drawer on small screens.
 */
export function Sidebar({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const { user } = useAuth();
  const { config } = useTheme();
  const items = navigationForRole(user?.role);
  const { pathname, search } = useLocation();
  // Section holding the current page; it opens by default and on navigation.
  const currentSection = findActiveSection(items, pathname, search);
  // Accordion: at most one section open, opening one closes the other.
  const [openSection, setOpenSection] = useState<string | null>(currentSection);

  useEffect(() => {
    if (currentSection) setOpenSection(currentSection);
  }, [currentSection]);
  // The mobile drawer always shows labels.
  const showCollapsed = collapsed && !mobileOpen;

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}
      <aside
        aria-label="Main navigation"
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-40 flex flex-col border-r',
          'transition-[width,background-color] duration-200 shrink-0',
          'top-14 lg:top-0',
          sidebarContainerClass(config.sidebarStyle),
          showCollapsed ? 'w-16' : 'w-60',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <nav className="flex-1 overflow-y-auto scrollbar-shell p-2 space-y-0.5">
          {items.map((item) => (
            <SidebarNavItem
              key={item.label}
              item={item}
              collapsed={showCollapsed}
              onNavigate={onCloseMobile}
              open={openSection === item.label}
              onToggle={() => setOpenSection((current) => (current === item.label ? null : item.label))}
            />
          ))}
        </nav>

        <div className="border-t border-shell-border">
          <SidebarUserCard collapsed={showCollapsed} />
        </div>
      </aside>
    </>
  );
}
