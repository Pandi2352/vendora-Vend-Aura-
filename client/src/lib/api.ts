import axios from 'axios';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from './config';
import type { ApiEnvelope, ApiErrorBody, Paginated } from '../types/api.types';

export const TOKEN_KEY = 'vendora_token';
export const REFRESH_TOKEN_KEY = 'vendora_refresh_token';
export const USER_KEY = 'vendora_user';
export const MUST_CHANGE_PASSWORD_KEY = 'vendora_must_change_password';
export const LOGOUT_EVENT = 'vendora:logout';

/** Requests slower than this fail with a clear message instead of hanging the till. */
export const REQUEST_TIMEOUT_MS = 30_000;

export const api = axios.create({ baseURL: API_URL, timeout: REQUEST_TIMEOUT_MS });

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(MUST_CHANGE_PASSWORD_KEY);
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  // Correlates browser requests with server logs (server echoes it back as x-request-id).
  if (!config.headers.has('X-Request-Id') && typeof crypto?.randomUUID === 'function') {
    config.headers.set('X-Request-Id', crypto.randomUUID());
  }
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
  return (res.data as ApiEnvelope<T> | undefined)?.data as T;
}

/** Payload + pagination meta for list endpoints. */
export function unwrapPage<T>(res: AxiosResponse): Paginated<T> {
  const body = res.data as ApiEnvelope<T[]> | undefined;
  return { data: Array.isArray(body?.data) ? body.data : [], meta: body?.meta ?? null };
}

/** True when the request was cancelled with an AbortController (ignore, don't show an error). */
export const isCancelled = (err: unknown) => axios.isCancel(err) || (err as { name?: string })?.name === 'CanceledError';

const STATUS_MESSAGES: Record<number, string> = {
  403: 'You do not have permission to do this.',
  404: 'The requested record was not found.',
  413: 'The upload is too large.',
  429: 'Too many attempts. Please wait a minute and try again.',
  500: 'The server hit an error. Please try again.',
  502: 'The server is unavailable right now. Please try again shortly.',
  503: 'The server is unavailable right now. Please try again shortly.',
  504: 'The server took too long to respond. Please try again.',
};

/** Human-readable message for any error thrown by an API call. */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as Partial<ApiErrorBody> | undefined;
    const message = body?.message as unknown;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string' && message.trim()) return message;
    if (err.code === 'ECONNABORTED') return 'The request timed out. Check the connection and try again.';
    if (!err.response) return 'Cannot reach the server. Check your connection.';
    return STATUS_MESSAGES[err.response.status] ?? fallback;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
