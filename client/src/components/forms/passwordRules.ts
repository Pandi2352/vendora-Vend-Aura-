export interface PasswordRule {
  label: string;
  test: (value: string) => boolean;
}

export const DEFAULT_PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'A letter', test: (v) => /[A-Za-z]/.test(v) },
  { label: 'A number', test: (v) => /\d/.test(v) },
  { label: 'A symbol (stronger)', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

/** 0–4 score from length and character variety. */
export function passwordScore(value: string) {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  return Math.min(4, score);
}
