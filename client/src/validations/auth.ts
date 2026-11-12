import { z } from 'zod';
import { passwordsMatchRule, rules, withCrossFieldRules, withPasswordConfirmation } from './common';

export const SHOP_ID = /^[a-z0-9]{3,6}$/;

/** Shop IDs are typed lowercase letters and digits only. */
export const normalizeShopId = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const shopIdRule = z
  .string({ error: 'Shop ID is required' })
  .trim()
  .min(1, 'Shop ID is required')
  .regex(SHOP_ID, 'Shop ID must be 3-6 lowercase letters or digits');

export const loginSchema = z.object({
  shopId: shopIdRule,
  username: rules.text('Username', { max: 80 }),
  password: z.string({ error: 'Password is required' }).min(1, 'Password is required'),
});

export type LoginValues = z.output<typeof loginSchema>;

/** "Find your store" on the POS address without a store subdomain. */
export const storeFinderSchema = z.object({ shopId: shopIdRule });

export type StoreFinderValues = z.output<typeof storeFinderSchema>;

export const changePasswordSchema = withCrossFieldRules(
  z.object({
    currentPassword: z.string({ error: 'Current password is required' }).min(1, 'Current password is required'),
    newPassword: rules.password('New password'),
    confirmPassword: z.string({ error: 'Confirm your new password' }).min(1, 'Confirm your new password'),
  }),
  [
    passwordsMatchRule(),
    {
      fields: ['currentPassword', 'newPassword'],
      check: (v, ctx) => {
        if (v.newPassword === v.currentPassword) {
          ctx.addIssue({
            code: 'custom',
            path: ['newPassword'],
            message: 'New password must be different from the current password',
          });
        }
      },
    },
  ],
);

export type ChangePasswordValues = z.output<typeof changePasswordSchema>;

/** Forgot password: Shop ID + username or email (the server never says whether it exists). */
export const forgotPasswordSchema = z.object({
  shopId: shopIdRule,
  identifier: rules.text('Username or email', { max: 254 }),
});

export type ForgotPasswordValues = z.output<typeof forgotPasswordSchema>;

/** Reset password from the emailed link. Same rules as the server: 8+ chars, a letter and a number. */
export const resetPasswordSchema = withPasswordConfirmation(
  z.object({
    newPassword: rules.password('New password').max(128, 'New password must be at most 128 characters'),
    confirmPassword: z.string({ error: 'Confirm your new password' }).min(1, 'Confirm your new password'),
  }),
);

export type ResetPasswordValues = z.output<typeof resetPasswordSchema>;
