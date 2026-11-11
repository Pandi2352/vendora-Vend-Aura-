import { useState, useEffect, useCallback } from 'react';
import {
  api,
  unwrap,
  getErrorMessage,
  clearSession,
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_KEY,
  MUST_CHANGE_PASSWORD_KEY,
  LOGOUT_EVENT,
} from '../lib/api';
import type { AuthUser } from '../types/pos.types';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  mustChangePassword: boolean;
  user: AuthUser;
}

export function useAuthSession() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const [shopId, setShopId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const resetState = useCallback(() => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setMustChangePassword(false);
    setPassword('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get('shopId');
    if (shop) {
      const clean = shop.toLowerCase().trim();
      setShopId(clean);
      setUsername(`${clean}_admin`);
    }

    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedToken && savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        if (localStorage.getItem(MUST_CHANGE_PASSWORD_KEY) === 'true') {
          setMustChangePassword(true);
        } else {
          setIsAuthenticated(true);
        }
      } catch {
        clearSession();
      }
    }

    const onForcedLogout = () => resetState();
    window.addEventListener(LOGOUT_EVENT, onForcedLogout);
    return () => window.removeEventListener(LOGOUT_EVENT, onForcedLogout);
  }, [resetState]);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!shopId.trim() || !username.trim() || !password.trim()) {
      setLoginError('Please enter Shop ID, Username, and Password');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await api.post('/auth/login', {
        shopId: shopId.trim(),
        username: username.trim(),
        password: password.trim(),
      });

      const data = unwrap<LoginResponse>(res);
      if (!data?.accessToken || !data?.user) {
        setLoginError('Unexpected response from server. Please try again.');
        return;
      }

      localStorage.setItem(TOKEN_KEY, data.accessToken);
      if (data.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setCurrentUser(data.user);

      if (data.mustChangePassword) {
        localStorage.setItem(MUST_CHANGE_PASSWORD_KEY, 'true');
        setCurrentPassword(password.trim());
        setMustChangePassword(true);
      } else {
        localStorage.removeItem(MUST_CHANGE_PASSWORD_KEY);
        setIsAuthenticated(true);
      }
      setPassword('');
    } catch (err) {
      setLoginError(getErrorMessage(err, 'Login failed. Please verify your Shop ID and credentials.'));
    } finally {
      setIsLoggingIn(false);
    }
  }, [shopId, username, password]);

  const handleChangePassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please enter your current (temporary) password');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      localStorage.removeItem(MUST_CHANGE_PASSWORD_KEY);
      setMustChangePassword(false);
      setIsAuthenticated(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(getErrorMessage(err, 'Failed to update password. Please try again.'));
    } finally {
      setIsUpdatingPassword(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  const handleSignOut = useCallback(() => {
    // Revoke the refresh token server-side (best effort), then clear locally.
    // The token is captured now because the request interceptor runs after clearSession().
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      api.post('/auth/logout', null, { headers: { Authorization: `Bearer ${token}` } }).catch(() => undefined);
    }
    clearSession();
    resetState();
  }, [resetState]);

  return {
    isAuthenticated,
    currentUser,
    shopId,
    setShopId,
    username,
    setUsername,
    password,
    setPassword,
    loginError,
    isLoggingIn,
    mustChangePassword,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordError,
    isUpdatingPassword,
    handleLogin,
    handleChangePassword,
    handleSignOut,
  };
}
