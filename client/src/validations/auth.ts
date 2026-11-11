import { z } from 'zod';
import { rules, withPasswordConfirmation } from './common';

export const SHOP_ID = /^[a-z0-9]{3,6}$/;

/** Shop IDs are typed lowercase letters and digits only. */
export const normalizeShopId = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

export const loginSchema = z.object({
  shopId: z
    .string({ error: 'Shop ID is required' })
    .trim()
    .min(1, 'Shop ID is required')
    .regex(SHOP_ID, 'Shop ID must be 3-6 lowercase letters or digits'),
  username: rules.text('Username', { max: 80 }),
  password: z.string({ error: 'Password is required' }).min(1, 'Password is required'),
});

export type LoginValues = z.output<typeof loginSchema>;

export const changePasswordSchema = withPasswordConfirmation(
  z.object({
    currentPassword: z.string({ error: 'Current password is required' }).min(1, 'Current password is required'),
    newPassword: rules.password('New password'),
    confirmPassword: z.string({ error: 'Confirm your new password' }).min(1, 'Confirm your new password'),
  }),
).refine((v) => v.newPassword !== v.currentPassword, {
  path: ['newPassword'],
  message: 'New password must be different from the current password',
});

export type ChangePasswordValues = z.output<typeof changePasswordSchema>;
