/**
 * Every store has its own address: `{shopId}` in TENANT_APP_URL is replaced by
 * the store's Shop ID.
 *   production: https://{shopId}.vendora.com      -> https://kmart.vendora.com
 *   local dev:  http://{shopId}.localhost:4001    -> http://kmart.localhost:4001
 * Browsers resolve any *.localhost name to this machine, so subdomains work
 * locally without editing the hosts file.
 */
export const DEFAULT_TENANT_APP_URL = 'http://{shopId}.localhost:4001';
export const SHOP_ID_PLACEHOLDER = '{shopId}';

/** Shop ID format: 3-6 lower-case letters or digits (one DNS label). */
export const SHOP_ID_PATTERN = '[a-z0-9]{3,6}';

/** Subdomains the platform keeps for itself; no store may take them. */
export const RESERVED_SHOP_IDS = [
  'admin', 'api', 'app', 'www', 'mail', 'smtp', 'imap', 'pop', 'ftp', 'billing', 'pos', 'vendora', 'root',
  'support', 'help', 'docs', 'status', 'blog', 'cdn', 'static', 'assets', 'media', 'img', 'auth', 'login',
  'signup', 'account', 'dev', 'test', 'stage', 'demo', 'beta', 'local', 'ns1', 'ns2', 'mx',
];

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class TenantUrlUtil {
  /** The configured template (falls back to the local-dev default). */
  static template(): string {
    return (process.env.TENANT_APP_URL || DEFAULT_TENANT_APP_URL).trim().replace(/\/+$/, '');
  }

  /** Problem with a template, or null when usable. Used by env validation. */
  static templateProblem(template: string): string | null {
    if (!template.includes(SHOP_ID_PLACEHOLDER)) return `TENANT_APP_URL must contain ${SHOP_ID_PLACEHOLDER}.`;
    try {
      const url = new URL(template.replace(SHOP_ID_PLACEHOLDER, 'abc'));
      if (!url.hostname.startsWith('abc.')) return `TENANT_APP_URL must put ${SHOP_ID_PLACEHOLDER} as the first part of the host name.`;
    } catch {
      return 'TENANT_APP_URL is not a valid URL.';
    }
    return null;
  }

  /** Full URL of a page in a store's app, e.g. build('kmart', '/login'). */
  static build(shopId: string, path = '/', template = TenantUrlUtil.template()): string {
    const base = template.replace(SHOP_ID_PLACEHOLDER, encodeURIComponent(shopId.toLowerCase()));
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
  }

  /** Matches a store origin ("https://kmart.vendora.com") and captures the Shop ID. */
  static originRegex(template = TenantUrlUtil.template()): RegExp {
    const origin = new URL(template.replace(SHOP_ID_PLACEHOLDER, 'shopidplaceholder')).origin;
    const pattern = escapeRegex(origin).replace('shopidplaceholder', `(${SHOP_ID_PATTERN})`);
    return new RegExp(`^${pattern}$`, 'i');
  }

  /** Shop ID of the store a request came from, or null for any other origin. */
  static shopIdFromOrigin(origin: string | undefined | null, template = TenantUrlUtil.template()): string | null {
    if (!origin) return null;
    const match = TenantUrlUtil.originRegex(template).exec(origin.trim());
    const shopId = match?.[1]?.toLowerCase() ?? null;
    return shopId && !RESERVED_SHOP_IDS.includes(shopId) ? shopId : null;
  }
}
