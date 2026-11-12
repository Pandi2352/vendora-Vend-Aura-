import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, SidebarSimple, SignOut, Sun } from '@phosphor-icons/react';
import { navigationForRole, type NavItem } from '../../config/navigation';
import { useAuth } from '../../hooks/useAuth';
import { usePreferences } from '../../hooks/usePreferences';
import { CommandPalette } from '../ui/command/CommandPalette';
import type { CommandGroup, CommandItem } from '../ui/command/command-utils';

interface AppCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Leaf nav items (children flattened) as palette commands; the parent label becomes a keyword. */
function navCommands(items: NavItem[], navigate: (path: string) => void, parent?: string): CommandItem[] {
  return items.flatMap((item) => {
    if (item.children) return navCommands(item.children, navigate, item.label);
    if (!item.path) return [];
    const path = item.path;
    const Icon = item.icon;
    return [
      {
        id: `nav:${path}`,
        label: item.label,
        description: parent,
        keywords: parent ? [parent] : undefined,
        icon: <Icon />,
        onSelect: () => navigate(path),
      },
    ];
  });
}

/** Signed-in palette: every page the sidebar shows for the user's role, plus shell actions. */
export function AppCommandPalette({ open, onOpenChange }: AppCommandPaletteProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, sidebarCollapsed, toggleSidebar } = usePreferences();

  const groups = useMemo<CommandGroup[]>(
    () => [
      { heading: 'Go to', items: navCommands(navigationForRole(user?.role), navigate) },
      {
        heading: 'Actions',
        items: [
          {
            id: 'action:sidebar',
            label: sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar',
            keywords: ['sidebar', 'menu', 'navigation'],
            icon: <SidebarSimple />,
            onSelect: toggleSidebar,
          },
          {
            id: 'action:theme',
            label: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
            keywords: ['theme', 'dark', 'light', 'appearance'],
            icon: theme === 'dark' ? <Sun /> : <Moon />,
            onSelect: toggleTheme,
          },
          { id: 'action:logout', label: 'Sign out', keywords: ['log out', 'logout'], icon: <SignOut />, onSelect: logout },
        ],
      },
    ],
    [user?.role, navigate, sidebarCollapsed, toggleSidebar, theme, toggleTheme, logout],
  );

  return <CommandPalette open={open} onOpenChange={onOpenChange} groups={groups} placeholder="Search pages and actions…" />;
}
