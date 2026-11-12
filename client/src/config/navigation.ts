import type { Icon } from '@phosphor-icons/react';
import {
  SquaresFour,
  ShoppingCart,
  Receipt,
  UsersThree,
  Truck,
  ChartLineUp,
  Gear,
  Presentation,
  Bank,
  Warehouse,
  Wallet,
  RocketLaunch,
} from '@phosphor-icons/react';
import { ROUTES } from './routes';
import { ROLE_GROUPS, hasRole, type UserRole } from '../lib/permissions';

export interface NavItem {
  label: string;
  /** Leaf items navigate; parents open a flyout with their children. */
  path?: string;
  icon: Icon;
  roles?: UserRole[];
  children?: NavItem[];
  /** Heading shown at the top of the flyout. */
  sectionTitle?: string;
}

/** Single source for the sidebar, flyout menus and breadcrumbs. */
export const NAVIGATION: NavItem[] = [
  { label: 'Setup Guide', path: ROUTES.SETUP, icon: RocketLaunch, roles: ROLE_GROUPS.MANAGEMENT },
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: SquaresFour },
  { label: 'POS Billing', path: ROUTES.POS, icon: ShoppingCart },
  { label: 'Bills & Returns', path: ROUTES.ORDERS, icon: Receipt },
  { label: 'Customers & Khata', path: ROUTES.CUSTOMERS, icon: UsersThree },
  { label: 'Suppliers & Purchase', path: ROUTES.SUPPLIERS, icon: Truck, roles: ROLE_GROUPS.MANAGEMENT },
  { label: 'Accounts & Expenses', path: ROUTES.FINANCE, icon: Wallet, roles: ROLE_GROUPS.MANAGEMENT },
  {
    label: 'Reports',
    icon: ChartLineUp,
    roles: ROLE_GROUPS.FINANCE,
    sectionTitle: 'Reports',
    children: [
      { label: 'Executive Overview', path: ROUTES.REPORTS_OVERVIEW, icon: Presentation },
      { label: 'GST Reports', path: ROUTES.REPORTS_GST, icon: Bank },
      { label: 'Inventory Analytics', path: ROUTES.REPORTS_INVENTORY, icon: Warehouse },
    ],
  },
  { label: 'Settings', path: ROUTES.SETTINGS, icon: Gear },
];

/** Removes items (and children) the role may not see; drops parents left empty. */
export function navigationForRole(role: string | undefined, items: NavItem[] = NAVIGATION): NavItem[] {
  return items
    .filter((item) => hasRole(role, item.roles))
    .map((item) => (item.children ? { ...item, children: navigationForRole(role, item.children) } : item))
    .filter((item) => !item.children || item.children.length > 0);
}

/** True when the item or any of its children matches the current path. */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.path && (pathname === item.path || pathname.startsWith(`${item.path}/`))) return true;
  return !!item.children?.some((child) => isNavItemActive(child, pathname));
}

/** Label trail for the current path, e.g. ['Reports', 'GST Reports']. */
export function breadcrumbTrail(pathname: string, items: NavItem[] = NAVIGATION): string[] {
  for (const item of items) {
    if (!isNavItemActive(item, pathname)) continue;
    const childTrail = item.children ? breadcrumbTrail(pathname, item.children) : [];
    return [item.label, ...childTrail];
  }
  return [];
}
