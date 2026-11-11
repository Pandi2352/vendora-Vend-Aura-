/** Mirrors the server's ROLE_GROUPS (server/src/common/constants/app.constant.ts). */
export type UserRole = 'OWNER' | 'STORE_MANAGER' | 'CASHIER' | 'ACCOUNTANT' | 'SUPER_ADMIN';

export const ROLE_GROUPS = {
  MANAGEMENT: ['OWNER', 'STORE_MANAGER'] as UserRole[],
  FINANCE: ['OWNER', 'STORE_MANAGER', 'ACCOUNTANT'] as UserRole[],
};

/** True when no roles are required or the role is in the allowed list. */
export const hasRole = (role: string | undefined, allowed?: readonly UserRole[]) =>
  !allowed || allowed.length === 0 || (!!role && allowed.includes(role as UserRole));

export const canManageSuppliers = (role?: string) => hasRole(role, ROLE_GROUPS.MANAGEMENT);
export const canViewReports = (role?: string) => hasRole(role, ROLE_GROUPS.FINANCE);

export const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Owner',
  STORE_MANAGER: 'Store Manager',
  CASHIER: 'Cashier',
  ACCOUNTANT: 'Accountant',
  SUPER_ADMIN: 'Administrator',
};
