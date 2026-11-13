import { createContext } from 'react';
import type { AuthUser } from '../../types/pos.types';

export type AuthStatus = 'anonymous' | 'password-change' | 'authenticated';

export interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  /** Temporary password kept in memory right after login, to prefill the change-password form. */
  temporaryPassword: string;
  login: (shopId: string, username: string, password: string) => Promise<AuthStatus>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
