import { z } from 'zod';
import { rules } from './common';

export const DISCOUNT_TYPES = ['PERCENTAGE', 'FLAT', 'BUY_X_GET_Y', 'HAPPY_HOUR'] as const;

export const discountSchema = z.object({
  code: rules.text('Offer code', { min: 2, max: 30 }),
  name: rules.text('Offer title', { min: 2, max: 100 }),
  type: rules.selectOneOf('Discount type', DISCOUNT_TYPES),
  value: rules.amount('Discount value', { min: 0 }),
  minOrderValue: rules.amount('Minimum order amount', { min: 0 }),
  maxDiscountCap: rules.amount('Max discount cap', { min: 0 }),
  happyHourStart: rules.optionalText('Happy hour start', { max: 10 }),
  happyHourEnd: rules.optionalText('Happy hour end', { max: 10 }),
  usageLimit: rules.number('Usage limit', { min: 1, integer: true }),
});

export type DiscountFormValues = z.infer<typeof discountSchema>;

