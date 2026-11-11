/** Browser helpers. All are safe to call when the API is unavailable. */

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Saves a Blob (or text) as a file download. */
export function downloadFile(data: Blob | string, filename: string, mimeType = 'text/plain;charset=utf-8') {
  const blob = typeof data === 'string' ? new Blob([data], { type: mimeType }) : data;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Opens an external http(s) link in a new tab without giving it access to this window. */
export function openExternal(url: string) {
  try {
    const parsed = new URL(url, window.location.href);
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) return false;
    window.open(parsed.href, '_blank', 'noopener,noreferrer');
    return true;
  } catch {
    return false;
  }
}

function storage(kind: 'local' | 'session'): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null; // private mode / blocked storage
  }
}

/** JSON get/set/remove that never throws. */
export function createStore(kind: 'local' | 'session') {
  return {
    get<T>(key: string, fallback: T): T {
      try {
        const raw = storage(kind)?.getItem(key);
        return raw === null || raw === undefined ? fallback : (JSON.parse(raw) as T);
      } catch {
        return fallback;
      }
    },
    set<T>(key: string, value: T) {
      try {
        storage(kind)?.setItem(key, JSON.stringify(value));
      } catch {
        /* quota exceeded / unavailable */
      }
    },
    remove(key: string) {
      try {
        storage(kind)?.removeItem(key);
      } catch {
        /* unavailable */
      }
    },
  };
}

export const localStore = createStore('local');
export const sessionStore = createStore('session');

/** Checks a File against allowed extensions / MIME types and a size limit (bytes). */
export function validateFile(
  file: File,
  { accept = [], maxBytes }: { accept?: string[]; maxBytes?: number },
): string | null {
  if (maxBytes && file.size > maxBytes) return 'File is too large.';
  if (accept.length === 0) return null;
  const name = file.name.toLowerCase();
  const ok = accept.some((rule) =>
    rule.startsWith('.') ? name.endsWith(rule.toLowerCase()) : rule.endsWith('/*') ? file.type.startsWith(rule.slice(0, -1)) : file.type === rule,
  );
  return ok ? null : 'This file type is not allowed.';
}
