/** "hello world" -> "Hello world" */
export const capitalize = (text = '') => (text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : '');

/** "STORE_MANAGER" / "store manager" -> "Store Manager" */
export const titleCase = (text = '') =>
  text
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

/** "Sri Murugan Stores!" -> "sri-murugan-stores" */
export const slugify = (text = '') =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Collapses inner whitespace and trims. */
export const squish = (text = '') => text.replace(/\s+/g, ' ').trim();

/** Shortens with an ellipsis: truncate('Hello world', 8) -> 'Hello w…' */
export const truncate = (text = '', max = 40) => (text.length > max ? `${text.slice(0, Math.max(0, max - 1))}…` : text);

/** owner@shop.in -> o***r@shop.in */
export function maskEmail(email = '') {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const masked = local.length <= 2 ? `${local[0] ?? ''}*` : `${local[0]}***${local[local.length - 1]}`;
  return `${masked}@${domain}`;
}

/** 9876543210 -> ******3210 */
export function maskPhone(phone = '') {
  const digits = phone.replace(/\D/g, '');
  return digits.length < 4 ? phone : `******${digits.slice(-4)}`;
}

/** Keeps only digits, optionally capped: digitsOnly('98-76 5', 10) -> '98765' */
export const digitsOnly = (value = '', maxLength?: number) => {
  const digits = value.replace(/\D/g, '');
  return maxLength ? digits.slice(0, maxLength) : digits;
};

/** First letter for avatars. */
export const initialOf = (name?: string) => (name?.trim()?.[0] || '?').toUpperCase();

/** Keeps the 10-digit national number: strips spaces/dashes and a pasted +91 / 0 prefix. */
export function normalizeIndianMobile(value: string) {
  const digits = digitsOnly(value);
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits.slice(0, 10);
}
