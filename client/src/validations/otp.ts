import { z } from 'zod';

/** Exactly `length` digits. OtpInput keeps gaps as spaces, so a partly filled code fails too. */
export function otpRule(length = 6) {
  const message = `Enter the ${length}-digit code`;
  return z.string({ error: message }).regex(new RegExp(`^\\d{${length}}$`), message);
}
