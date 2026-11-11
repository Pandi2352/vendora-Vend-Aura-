/** Mirrors the server's ROLE_GROUPS (server/src/common/constants/app.constant.ts). */
const MANAGEMENT_ROLES = ['OWNER', 'STORE_MANAGER'];
const FINANCE_ROLES = ['OWNER', 'STORE_MANAGER', 'ACCOUNTANT'];

export const canManageSuppliers = (role?: string) => !!role && MANAGEMENT_ROLES.includes(role);
export const canViewReports = (role?: string) => !!role && FINANCE_ROLES.includes(role);
