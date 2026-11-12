import { z } from 'zod';

/**
 * Array of chosen option values for CheckboxGroupField. `label` is a plural noun
 * ("payment methods") so messages read "Choose at least 2 payment methods".
 * `min` defaults to 1 (required); pass { min: 0 } for an optional group.
 */
export function checkboxGroupRule<V extends string | number = string>(
  label: string,
  { min = 1, max }: { min?: number; max?: number } = {},
) {
  const lower = label.toLowerCase();
  let schema = z.array(z.custom<V>((v) => typeof v === 'string' || typeof v === 'number'), { error: `Choose ${lower}` });
  if (min > 0) schema = schema.min(min, min === 1 ? `Choose at least one ${lower}` : `Choose at least ${min} ${lower}`);
  if (max !== undefined) schema = schema.max(max, `Choose at most ${max} ${lower}`);
  return schema;
}
