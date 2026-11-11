const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });

/** ₹1,23,456.50 */
export const formatInr = (amount: number) => inr.format(amount || 0);

/** 09/02/2027 (Indian day-first format) */
export const formatDate = (value?: string | Date | null) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

/** "09 Feb, 4:05 pm" */
export const formatDateTime = (value?: string | Date | null) =>
  value
    ? new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' })
    : '—';

/** First letter of the name, for avatars. */
export const initialOf = (name?: string) => (name?.trim()?.[0] || '?').toUpperCase();
