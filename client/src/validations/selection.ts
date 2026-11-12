import { z } from 'zod';

/** Naive English plural for a field label ("category" → "categories", "tax" → "taxes"). */
export function pluralize(word: string) {
  if (/[^aeiou]y$/i.test(word)) return `${word.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh)$/i.test(word)) return `${word}es`;
  return `${word}s`;
}

interface MultiSelectRuleOptions<T extends z.ZodType> {
  /** At least this many must be selected (makes the field required when ≥ 1). */
  min?: number;
  /** At most this many may be selected. */
  max?: number;
  /** Plural form of the label when the naive rule is wrong ("Staff" → "staff"). */
  plural?: string;
  /** Schema of one value (default: string). */
  item?: T;
}

/**
 * Array rule for MultiSelectField / CheckboxGroupField, with messages like
 * "Select at least 1 category" and "Select up to 3 categories".
 */
export function multiSelectRule<T extends z.ZodType = z.ZodString>(
  label: string,
  { min, max, plural, item }: MultiSelectRuleOptions<T> = {},
) {
  const singular = label.toLowerCase();
  const many = (plural ?? pluralize(label)).toLowerCase();
  const noun = (n: number) => (n === 1 ? singular : many);
  const minMessage = `Select at least ${min ?? 1} ${noun(min ?? 1)}`;

  let schema = z.array((item ?? z.string()) as T, { error: minMessage });
  if (min !== undefined && min > 0) schema = schema.min(min, minMessage);
  if (max !== undefined) schema = schema.max(max, `Select up to ${max} ${noun(max)}`);
  return schema;
}
