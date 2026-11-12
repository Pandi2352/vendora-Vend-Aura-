export const API_BASE: string = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/** POS address without a store: the "find your store" sign-in page. */
export const POS_URL: string = import.meta.env.VITE_POS_URL || 'http://localhost:4001';

/**
 * Each store's own address; {shopId} becomes the Shop ID.
 * Production https://{shopId}.vendora.com, local http://{shopId}.localhost:4001.
 */
export const TENANT_APP_URL: string = (import.meta.env.VITE_TENANT_APP_URL || 'http://{shopId}.localhost:4001').replace(/\/+$/, '');

/** Sign-in page of a store (kmart.vendora.com/login), or the store finder without a Shop ID. */
export function posLoginUrl(shopId?: string): string {
  return shopId ? `${TENANT_APP_URL.replace('{shopId}', encodeURIComponent(shopId))}/login` : `${POS_URL}/login`;
}

/** "kmart.vendora.com" — a store's address to show people. */
export const storeHost = (shopId: string) => new URL(TENANT_APP_URL.replace('{shopId}', shopId || 'x')).host;

/** ".vendora.com" — what follows the Shop ID in a store address. */
export const storeHostSuffix = () => storeHost('x').slice(1);

/** Swagger docs are served from the API origin, outside the /api/v1 prefix. */
export const API_DOCS_URL: string = `${API_BASE.replace(/\/api\/v\d+\/?$/, '')}/docs`;
