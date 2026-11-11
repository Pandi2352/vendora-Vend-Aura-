import axios from 'axios';
import { API_BASE } from './config';

export const ADMIN_TOKEN_KEY = 'vendora_platform_admin_token';
export const ADMIN_USER_KEY = 'vendora_platform_admin_user';

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function saveAdminSession(token: string, admin: unknown): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(admin ?? null));
}

export function clearAdminSession(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}

let onUnauthorized: (() => void) | null = null;

/** Registers the callback run when any /saas-admin call returns 401/403 (session already cleared). */
export function setAdminUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

/** Axios instance for every /saas-admin/* call. Paths are relative, e.g. `adminApi.get('/tenants')`. */
export const adminApi = axios.create({ baseURL: `${API_BASE}/saas-admin` });

adminApi.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

adminApi.interceptors.response.use(undefined, (error) => {
  const status = error?.response?.status;
  const isLoginCall = String(error?.config?.url ?? '').includes('/login');
  if ((status === 401 || status === 403) && !isLoginCall) {
    clearAdminSession();
    onUnauthorized?.();
  }
  return Promise.reject(error);
});
