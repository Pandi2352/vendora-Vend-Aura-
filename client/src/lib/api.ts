import axios from 'axios';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from './config';

export const TOKEN_KEY = 'vendora_token';
export const REFRESH_TOKEN_KEY = 'vendora_refresh_token';
export const USER_KEY = 'vendora_user';
export const MUST_CHANGE_PASSWORD_KEY = 'vendora_must_change_password';
export const LOGOUT_EVENT = 'vendora:logout';

export const api = axios.create({ baseURL: API_URL });

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(MUST_CHANGE_PASSWORD_KEY);
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

let refreshInFlight: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (!refreshInFlight) {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    refreshInFlight = (
      refreshToken
        ? axios.post(`${API_URL}/auth/refresh`, { refreshToken }).then((res) => {
            const data = res.data?.data;
            if (!data?.accessToken) throw new Error('Refresh response missing access token');
            localStorage.setItem(TOKEN_KEY, data.accessToken);
            if (data.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
            return data.accessToken as string;
          })
        : Promise.reject(new Error('No refresh token'))
    ).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const url = config?.url || '';
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/refresh');

    if (error.response?.status !== 401 || !config || isAuthCall || config._retried) {
      return Promise.reject(error);
    }

    config._retried = true;
    try {
      const token = await refreshAccessToken();
      config.headers.set('Authorization', `Bearer ${token}`);
      return api(config);
    } catch {
      clearSession();
      window.dispatchEvent(new Event(LOGOUT_EVENT));
      return Promise.reject(error);
    }
  }
);

/** Returns the payload of the server envelope (`res.data.data`). */
export function unwrap<T>(res: AxiosResponse): T {
  return res.data?.data as T;
}

export function getErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(err)) {
    const message = (err.response?.data as { message?: unknown } | undefined)?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string' && message.trim()) return message;
    if (!err.response) return 'Cannot reach the server. Check your connection.';
  } else if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}
