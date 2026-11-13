export type StaffRole = 'OWNER' | 'STORE_MANAGER' | 'CASHIER' | 'ACCOUNTANT';

export interface StaffOutlet {
  _id: string;
  name: string;
  code: string;
  isPrimary?: boolean;
}

export interface StaffUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  role: StaffRole;
  outletIds?: StaffOutlet[];
  isTemporaryPassword?: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface CreateStaffPayload {
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  role: StaffRole;
  password: string;
  outletIds?: string[];
}

