/**
 * Every store has its own address. `{shopId}` in VITE_TENANT_APP_URL becomes
 * the Shop ID:
 *   production: https://{shopId}.vendora.com    -> https://kmart.vendora.com
 *   local dev:  http://{shopId}.localhost:4001  -> http://kmart.localhost:4001
 * Browsers resolve any *.localhost name to this machine, so no hosts file is needed.
 * The same app without a store subdomain (VITE_APP_URL) is the "find your store" page.
 */
export const TENANT_APP_URL: string = (import.meta.env.VITE_TENANT_APP_URL || 'http://{shopId}.localhost:4001').replace(/\/+$/, '');
export const ROOT_APP_URL: string = (import.meta.env.VITE_APP_URL || 'http://localhost:4001').replace(/\/+$/, '');

const PLACEHOLDER = '{shopId}';
const SHOP_ID = '[a-z0-9]{3,6}';

/** Kept in step with RESERVED_SHOP_IDS on the server: never a store. */
const RESERVED = new Set([
  'admin', 'api', 'app', 'www', 'mail', 'smtp', 'imap', 'pop', 'ftp', 'billing', 'pos', 'vendora', 'root',
  'support', 'help', 'docs', 'status', 'blog', 'cdn', 'static', 'assets', 'media', 'img', 'auth', 'login',
  'signup', 'account', 'dev', 'test', 'stage', 'demo', 'beta', 'local', 'ns1', 'ns2', 'mx',
]);

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Full URL of a page in a store's app: tenantUrl('kmart', '/login'). */
export function tenantUrl(shopId: string, path = '/', template = TENANT_APP_URL): string {
  return `${template.replace(PLACEHOLDER, encodeURIComponent(shopId.toLowerCase()))}${path.startsWith('/') ? path : `/${path}`}`;
}

/** "kmart.vendora.com" — the store address to show people (no protocol). */
export function tenantHost(shopId: string, template = TENANT_APP_URL): string {
  return new URL(tenantUrl(shopId, '/', template)).host;
}

/** ".vendora.com" — what follows the Shop ID in a store address. */
export function tenantHostSuffix(template = TENANT_APP_URL): string {
  return tenantHost('x', template).slice(1);
}

/** Shop ID of the store whose address this page is on, or null (store finder, other hosts). */
export function shopIdFromOrigin(origin: string, template = TENANT_APP_URL): string | null {
  const base = new URL(template.replace(PLACEHOLDER, 'shopidplaceholder')).origin;
  const pattern = new RegExp(`^${escapeRegex(base).replace('shopidplaceholder', `(${SHOP_ID})`)}$`, 'i');
  const shopId = pattern.exec(origin)?.[1]?.toLowerCase() ?? null;
  return shopId && !RESERVED.has(shopId) ? shopId : null;
}

/** The store this browser tab belongs to (from the address bar). */
export const currentShopId = (): string | null =>
  typeof window === 'undefined' ? null : shopIdFromOrigin(window.location.origin);

/** Sends the browser to a page on a store's own address. */
export function goToStore(shopId: string, path = '/login') {
  window.location.assign(tenantUrl(shopId, path));
}
