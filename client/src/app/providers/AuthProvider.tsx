import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  api,
  unwrap,
  clearSession,
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_KEY,
  MUST_CHANGE_PASSWORD_KEY,
  LOGOUT_EVENT,
} from '../../lib/api';
import type { AuthUser } from '../../types/pos.types';

export type AuthStatus = 'anonymous' | 'password-change' | 'authenticated';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  mustChangePassword: boolean;
  user: AuthUser;
}

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

function readStoredSession(): { status: AuthStatus; user: AuthUser | null } {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const rawUser = localStorage.getItem(USER_KEY);
    if (!token || !rawUser) return { status: 'anonymous', user: null };
    const user = JSON.parse(rawUser) as AuthUser;
    const mustChange = localStorage.getItem(MUST_CHANGE_PASSWORD_KEY) === 'true';
    return { status: mustChange ? 'password-change' : 'authenticated', user };
  } catch {
    clearSession();
    return { status: 'anonymous', user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Read synchronously so a reload never flashes the login page.
  const [session, setSession] = useState(readStoredSession);
  const [temporaryPassword, setTemporaryPassword] = useState('');

  const resetSession = useCallback(() => {
    setSession({ status: 'anonymous', user: null });
    setTemporaryPassword('');
  }, []);

  // The api module fires this when a refresh fails (session expired / revoked).
  useEffect(() => {
    window.addEventListener(LOGOUT_EVENT, resetSession);
    return () => window.removeEventListener(LOGOUT_EVENT, resetSession);
  }, [resetSession]);

  const login = useCallback(async (shopId: string, username: string, password: string) => {
    const data = unwrap<LoginResponse>(
      await api.post('/auth/login', { shopId: shopId.trim(), username: username.trim(), password }),
    );
    if (!data?.accessToken || !data.user) {
      throw new Error('Unexpected response from server. Please try again.');
    }

    localStorage.setItem(TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    const status: AuthStatus = data.mustChangePassword ? 'password-change' : 'authenticated';
    if (data.mustChangePassword) {
      localStorage.setItem(MUST_CHANGE_PASSWORD_KEY, 'true');
      setTemporaryPassword(password);
    } else {
      localStorage.removeItem(MUST_CHANGE_PASSWORD_KEY);
    }
    setSession({ status, user: data.user });
    return status;
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await api.post('/auth/change-password', { currentPassword, newPassword });
    localStorage.removeItem(MUST_CHANGE_PASSWORD_KEY);
    setTemporaryPassword('');
    setSession((prev) => ({ ...prev, status: 'authenticated' }));
  }, []);

  const logout = useCallback(() => {
    // Revoke the refresh token server-side (best effort). The token is read now
    // because the request interceptor would run after clearSession().
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      api.post('/auth/logout', null, { headers: { Authorization: `Bearer ${token}` } }).catch(() => undefined);
    }
    clearSession();
    resetSession();
  }, [resetSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ ...session, temporaryPassword, login, changePassword, logout }),
    [session, temporaryPassword, login, changePassword, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
