import { capitalize, digitsOnly, maskEmail, maskPhone, slugify, titleCase, truncate } from './string';
import { formatInr, formatNumber, formatPercent, parseNumber, round, formatFileSize } from './number';
import { compact, groupBy, isEmpty, omit, pick, sortBy, unique, uniqueBy } from './collection';
import { formatDate, formatRelative, toDateInputValue } from './date';
import { validateFile } from './browser';

describe('string utils', () => {
  it('formats text', () => {
    expect(capitalize('hELLO')).toBe('Hello');
    expect(titleCase('STORE_MANAGER')).toBe('Store Manager');
    expect(slugify('Sri Murugan Stores!')).toBe('sri-murugan-stores');
    expect(truncate('Hello world', 8)).toBe('Hello w…');
    expect(digitsOnly('98-76 5abc', 4)).toBe('9876');
  });
  it('masks personal data', () => {
    expect(maskEmail('owner@shop.in')).toBe('o***r@shop.in');
    expect(maskPhone('9876543210')).toBe('******3210');
  });
});

describe('number utils', () => {
  it('formats Indian currency and numbers', () => {
    expect(formatInr(123456.5)).toBe('₹1,23,456.50');
    expect(formatNumber(1234567)).toBe('12,34,567');
    expect(formatPercent(12.345)).toBe('12.3%');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });
  it('parses and rounds safely', () => {
    expect(parseNumber('1,200.50')).toBe(1200.5);
    expect(parseNumber('abc', -1)).toBe(-1);
    expect(parseNumber('', 0)).toBe(0);
    expect(round(1.005, 2)).toBe(1.01);
  });
});

describe('collection utils', () => {
  it('dedupes, groups, sorts', () => {
    expect(unique([1, 1, 2])).toEqual([1, 2]);
    expect(uniqueBy([{ id: 1 }, { id: 1 }], (x) => x.id)).toHaveLength(1);
    expect(groupBy(['ab', 'ac', 'b'], (s) => s[0])).toEqual({ a: ['ab', 'ac'], b: ['b'] });
    expect(sortBy([{ n: 'b' }, { n: 'a' }], (x) => x.n).map((x) => x.n)).toEqual(['a', 'b']);
  });
  it('picks, omits and compacts objects', () => {
    expect(pick({ a: 1, b: 2 }, ['a'])).toEqual({ a: 1 });
    expect(omit({ a: 1, b: 2 }, ['a'])).toEqual({ b: 2 });
    expect(compact({ a: 1, b: '', c: undefined, d: null })).toEqual({ a: 1 });
    expect(isEmpty({})).toBe(true);
    expect(isEmpty([0])).toBe(false);
  });
});

describe('date utils', () => {
  it('formats in the business timezone', () => {
    expect(formatDate('2026-11-10T20:00:00Z')).toBe('11/11/2026'); // 01:30 IST next day
    expect(toDateInputValue('2026-11-10T20:00:00Z')).toBe('2026-11-11');
    expect(formatDate(null)).toBe('—');
  });
  it('formats relative time', () => {
    const now = new Date('2026-11-11T10:00:00Z');
    expect(formatRelative('2026-11-11T09:57:00Z', now)).toBe('3 minutes ago');
  });
});

describe('browser utils', () => {
  it('validates files by type and size', () => {
    const png = new File(['x'], 'logo.png', { type: 'image/png' });
    expect(validateFile(png, { accept: ['image/*'] })).toBeNull();
    expect(validateFile(png, { accept: ['.pdf'] })).toBe('This file type is not allowed.');
    expect(validateFile(png, { maxBytes: 0.5 })).toBe('File is too large.');
  });
});
