import { UserRole } from '../../shared';

/** Business timezone used when a tenant has none configured. */
export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

/** Role groups reused with @Roles(...). The owner can always do everything. */
export const ROLE_GROUPS = {
  /** Back-office management: suppliers, purchases, stock ledger, customer limits. */
  MANAGEMENT: [UserRole.OWNER, UserRole.STORE_MANAGER],
  /** Financial / analytical data: reports and ledgers. */
  FINANCE: [UserRole.OWNER, UserRole.STORE_MANAGER, UserRole.ACCOUNTANT],
} as const;

/** Upper bound for list endpoints that are not paginated by page number. */
export const MAX_PAGE_SIZE = 100;

/** Email OTP lifetime. Shown in the email and enforced on verify. */
export const OTP_TTL_MINUTES = 10;
