export const API_BASE: string = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const POS_URL: string = import.meta.env.VITE_POS_URL || 'http://localhost:4001';

export function posLoginUrl(shopId?: string): string {
  return shopId ? `${POS_URL}/login?shopId=${encodeURIComponent(shopId)}` : `${POS_URL}/login`;
}

/** Swagger docs are served from the API origin, outside the /api/v1 prefix. */
export const API_DOCS_URL: string = `${API_BASE.replace(/\/api\/v\d+\/?$/, '')}/docs`;
