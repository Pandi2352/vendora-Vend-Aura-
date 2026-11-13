import { z } from 'zod';
import { rules } from './common';

export const productSchema = z.object({
  name: rules.text('Product name', { min: 2, max: 200 }),
  category: rules.text('Category', { min: 1, max: 100 }),
  barcode: rules.text('Barcode', { min: 2, max: 50 }),
  unitPrice: rules.amount('Selling price', { min: 0 }),
  mrp: rules.amount('MRP', { min: 0 }),
  costPrice: rules.amount('Cost price', { min: 0 }),
  taxRatePercent: rules.number('Tax rate %', { min: 0, max: 100 }),
  stock: rules.number('Stock quantity', { min: 0 }),
  unit: rules.optionalText('Unit', { max: 20 }),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: rules.text('Category name', { min: 2, max: 100 }),
  slug: rules.optionalText('Slug', { max: 100 }),
  displayOrder: rules.number('Display order', { min: 0, integer: true }),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

