import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { AuthUser } from '../types/pos.types';

const API_BASE = 'http://localhost:5000/api/v1';

export function useAuthSession() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const [shopId, setShopId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get('shopId');
    if (shop) {
      const clean = shop.toLowerCase().trim();
      setShopId(clean);
      setUsername(`${clean}_admin`);
    }

    const savedToken = localStorage.getItem('vendora_token');
    const savedUser = localStorage.getItem('vendora_user');
    if (savedToken && savedUser) {
      try {
        const userObj = JSON.parse(savedUser);
        setAuthToken(savedToken);
        setCurrentUser(userObj);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('vendora_token');
        localStorage.removeItem('vendora_user');
      }
    }
  }, []);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    if (!shopId.trim() || !username.trim() || !password.trim()) {
      setLoginError('Please enter Shop ID, Username, and Password');
      setIsLoggingIn(false);
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        shopId: shopId.trim(),
        username: username.trim(),
        password: password.trim(),
      });

      const data = res.data?.data;
      if (data?.accessToken && data?.user) {
        setAuthToken(data.accessToken);
        setCurrentUser(data.user);
        localStorage.setItem('vendora_token', data.accessToken);
        localStorage.setItem('vendora_user', JSON.stringify(data.user));

        if (data.mustChangePassword) {
          setMustChangePassword(true);
        } else {
          setIsAuthenticated(true);
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please verify your Shop ID and credentials.';
      setLoginError(msg);
    } finally {
      setIsLoggingIn(false);
    }
  }, [shopId, username, password]);

  const handleChangePassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

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
      if (authToken) {
        await axios.post(
          `${API_BASE}/auth/change-password`,
          { currentPassword: password, newPassword },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
      }
      setMustChangePassword(false);
      setIsAuthenticated(true);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
    }
  }, [authToken, password, newPassword, confirmPassword]);

  const handleSignOut = useCallback(() => {
    localStorage.removeItem('vendora_token');
    localStorage.removeItem('vendora_user');
    setAuthToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setPassword('');
  }, []);

  return {
    isAuthenticated,
    authToken,
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

