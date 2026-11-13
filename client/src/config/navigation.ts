import type { ComponentType } from 'react';
import { ROUTES } from './routes';
import { ROLE_GROUPS, hasRole, type UserRole } from '../lib/permissions';
import { ms } from '../components/ui/ms';

export interface NavItem {
  label: string;
  /** Leaf items navigate; parents open a flyout with their children. */
  path?: string;
  icon: ComponentType<{ className?: string }>;
  roles?: UserRole[];
  children?: NavItem[];
  /** Heading shown at the top of the flyout. */
  sectionTitle?: string;
  badgeDot?: boolean;
}

/** Single source for the sidebar, flyout menus and breadcrumbs matching reference UI. */
export const NAVIGATION: NavItem[] = [
  { label: 'Setup', path: ROUTES.SETUP, icon: ms('rocket_launch'), roles: ROLE_GROUPS.MANAGEMENT, badgeDot: true },
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: ms('grid_view') },
  {
    label: 'General Master',
    icon: ms('folder_special'),
    roles: ROLE_GROUPS.MANAGEMENT,
    sectionTitle: 'GENERAL MASTER',
    children: [
      { label: 'Master', path: ROUTES.MASTER, icon: ms('folder_special') },
      { label: 'Inventory', path: ROUTES.INVENTORY, icon: ms('category') },
      { label: 'Customer', path: ROUTES.CUSTOMERS, icon: ms('group') },
      { label: 'Sales', path: ROUTES.ORDERS, icon: ms('sell') },
      { label: 'Purchase', path: ROUTES.SUPPLIERS, icon: ms('receipt_long') },
    ],
  },
  {
    label: 'Inventory Master',
    icon: ms('dashboard_customize'),
    roles: ROLE_GROUPS.MANAGEMENT,
    sectionTitle: 'Inventory Master',
    children: [
      { label: 'Item Catalog', path: ROUTES.INVENTORY, icon: ms('inventory_2') },
      { label: 'Categories & Brands', path: `${ROUTES.INVENTORY}?tab=categories`, icon: ms('category') },
      { label: 'Opening Stock', path: `${ROUTES.INVENTORY}?tab=stock`, icon: ms('assignment') },
      { label: 'Barcode Generator', path: `${ROUTES.INVENTORY}?tab=barcodes`, icon: ms('qr_code_2') },
    ],
  },
  {
    label: 'Merchandising',
    icon: ms('sell'),
    roles: ROLE_GROUPS.MANAGEMENT,
    sectionTitle: 'Merchandising',
    children: [
      { label: 'Discounts & Offers', path: `${ROUTES.ORDERS}?tab=discounts`, icon: ms('sell') },
      { label: 'Customer Khata', path: `${ROUTES.CUSTOMERS}?tab=khata`, icon: ms('group') },
    ],
  },
  {
    label: 'Purchase',
    icon: ms('shopping_bag'),
    roles: ROLE_GROUPS.MANAGEMENT,
    sectionTitle: 'Purchase & Inward',
    children: [
      { label: 'Suppliers Directory', path: ROUTES.SUPPLIERS, icon: ms('group') },
      { label: 'Inward Stock (GRN)', path: `${ROUTES.SUPPLIERS}?tab=inwards&action=inward`, icon: ms('local_shipping') },
    ],
  },
  {
    label: 'Management',
    icon: ms('trending_up'),
    roles: ROLE_GROUPS.MANAGEMENT,
    sectionTitle: 'Store Management',
    children: [
      { label: 'Daily Shifts & Drawer', path: `${ROUTES.DASHBOARD}?tab=shifts`, icon: ms('point_of_sale') },
      { label: 'Accounts & Expenses', path: ROUTES.FINANCE, icon: ms('account_balance') },
    ],
  },
  {
    label: 'Reports',
    icon: ms('bar_chart'),
    roles: ROLE_GROUPS.FINANCE,
    sectionTitle: 'Reports & Analytics',
    children: [
      { label: 'Executive Overview', path: ROUTES.REPORTS_OVERVIEW, icon: ms('insights') },
      { label: 'GST Tax Reports', path: ROUTES.REPORTS_GST, icon: ms('account_balance') },
      { label: 'Inventory Valuation', path: ROUTES.REPORTS_INVENTORY, icon: ms('inventory') },
    ],
  },
  {
    label: 'Stock',
    icon: ms('assignment'),
    roles: ROLE_GROUPS.MANAGEMENT,
    sectionTitle: 'Stock Control',
    children: [
      { label: 'Stock Ledger', path: `${ROUTES.REPORTS_INVENTORY}?tab=ledger`, icon: ms('assignment') },
      { label: 'Physical Inventory', path: `${ROUTES.REPORTS_INVENTORY}?tab=physical`, icon: ms('inventory_2') },
    ],
  },
  {
    label: 'Transfers',
    icon: ms('sync_alt'),
    roles: ROLE_GROUPS.MANAGEMENT,
    sectionTitle: 'Outlet Stock Transfers',
    children: [{ label: 'Inter-Branch Transfers', path: `${ROUTES.INVENTORY}?tab=transfers`, icon: ms('sync_alt') }],
  },
  {
    label: 'Users & Roles',
    icon: ms('group'),
    roles: ROLE_GROUPS.MANAGEMENT,
    sectionTitle: 'Access Control',
    children: [{ label: 'Staff & Cashiers', path: `${ROUTES.SETTINGS}?tab=users`, icon: ms('group') }],
  },
  {
    label: 'Administrator',
    path: `${ROUTES.SETTINGS}?tab=general`,
    icon: ms('admin_panel_settings'),
    roles: ROLE_GROUPS.MANAGEMENT,
  },
  {
    label: 'Theme & Appearance',
    path: `${ROUTES.SETTINGS}?tab=appearance`,
    icon: ms('palette'),
    roles: ROLE_GROUPS.MANAGEMENT,
  },
  { label: 'POS', path: ROUTES.POS, icon: ms('storefront'), badgeDot: true },
  { label: 'Home Delivery', path: `${ROUTES.ORDERS}?tab=delivery`, icon: ms('local_shipping') },
  { label: 'POS Utilities', path: `${ROUTES.ORDERS}?tab=utilities`, icon: ms('receipt_long') },
  { label: 'Settings', path: ROUTES.SETTINGS, icon: ms('settings') },
];

/** Removes items (and children) the role may not see; drops parents left empty. */
export function navigationForRole(role: string | undefined, items: NavItem[] = NAVIGATION): NavItem[] {
  return items
    .filter((item) => hasRole(role, item.roles))
    .map((item) => (item.children ? { ...item, children: navigationForRole(role, item.children) } : item))
    .filter((item) => !item.children || item.children.length > 0);
}

/**
 * Default tab identifiers for pages where the base path has no ?tab= query.
 * If the current URL has a tab other than the default, the base path is NOT active.
 */
const DEFAULT_PAGE_TABS: Record<string, string> = {
  [ROUTES.INVENTORY]: 'catalog',
  [ROUTES.ORDERS]: 'bills',
  [ROUTES.CUSTOMERS]: 'all',
  [ROUTES.SUPPLIERS]: 'suppliers',
  [ROUTES.DASHBOARD]: 'overview',
  [ROUTES.REPORTS_INVENTORY]: 'valuation',
  [ROUTES.SETTINGS]: 'general',
};

/**
 * Checks if a specific target navigation path is active given the current pathname and search query.
 * Accurately handles multi-tab pages so only the exact matching menu/sub-menu item is active.
 */
export function isPathActive(targetPath: string, currentPathname: string, currentSearch = ''): boolean {
  if (!targetPath) return false;
  const [targetBase, targetQuery] = targetPath.split('?');
  if (!targetBase) return false;

  // Pathname must match (exact match, or sub-path)
  if (currentPathname !== targetBase && !currentPathname.startsWith(`${targetBase}/`)) {
    return false;
  }

  const currentParams = new URLSearchParams(currentSearch || '');

  // 1. Target specifies query parameters (e.g. ?tab=categories or ?tab=inwards&action=inward)
  if (targetQuery) {
    const pairs = targetQuery.split('&');
    for (const pair of pairs) {
      if (!pair) continue;
      const [rawKey, rawVal] = pair.split('=');
      const key = decodeURIComponent(rawKey);
      const val = decodeURIComponent(rawVal || '');
      if (currentParams.get(key) !== val) {
        return false;
      }
    }
    return true;
  }

  // 2. Target has NO query parameters (base route like /inventory, /orders, /customers, /suppliers, /dashboard).
  // If current URL has a ?tab= parameter, the base target is only active if the tab is its explicit default.
  const currentTab = currentParams.get('tab');
  if (currentTab) {
    const defaultTab = DEFAULT_PAGE_TABS[targetBase];
    if (defaultTab) {
      return currentTab === defaultTab;
    }
    // Specialized route tab (e.g. ?tab=users on /settings) should not activate the root target
    return false;
  }

  return true;
}

/** True when the item itself or any of its children matches the current path & search query. */
export function isNavItemActive(item: NavItem, pathname: string, search = ''): boolean {
  if (item.path && isPathActive(item.path, pathname, search)) {
    return true;
  }
  return !!item.children?.some((child) => isNavItemActive(child, pathname, search));
}

/** Determines the active parent accordion section in the sidebar. */
export function findActiveSection(items: NavItem[], pathname: string, search = ''): string | null {
  const sections = items.filter((item) => item.children && isNavItemActive(item, pathname, search));
  if (sections.length === 0) return null;
  if (sections.length === 1) return sections[0].label;

  // When both General Master (index of masters) and a specialized group (e.g. Inventory Master, Purchase) match,
  // prefer the dedicated group.
  const specific = sections.find((s) => s.label !== 'General Master');
  return (specific || sections[0]).label;
}

/** Label trail for the current path, e.g. ['Reports', 'GST Reports']. */
export function breadcrumbTrail(pathname: string, search = '', items: NavItem[] = NAVIGATION): string[] {
  for (const item of items) {
    if (!isNavItemActive(item, pathname, search)) continue;
    const childTrail = item.children ? breadcrumbTrail(pathname, search, item.children) : [];
    return [item.label, ...childTrail];
  }
  return [];
}
