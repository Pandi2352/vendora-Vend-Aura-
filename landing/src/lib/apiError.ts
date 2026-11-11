import { isAxiosError } from 'axios';

/** Extracts the server's `message` (string or string[]) from an API error, or returns the fallback. */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const message = (err.response?.data as { message?: unknown } | undefined)?.message;
    if (Array.isArray(message) && message.length > 0) return message.join(', ');
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}
