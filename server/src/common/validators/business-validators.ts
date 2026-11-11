import { applyDecorators } from '@nestjs/common';
import { Matches, ValidationOptions } from 'class-validator';
import { Transform } from 'class-transformer';

const trim = Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
const trimUpper = Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value));

/** Indian mobile: 10 digits starting 6-9, optional +91 / 0 prefix. */
export const INDIAN_MOBILE_REGEX = /^(?:\+91[\s-]?|0)?[6-9]\d{9}$/;
/** GSTIN: 2-digit state code + PAN + entity + Z + checksum. */
export const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
/** Indian PIN code: 6 digits, not starting with 0. */
export const PINCODE_REGEX = /^[1-9]\d{5}$/;

export const IsIndianMobile = (options?: ValidationOptions) =>
  applyDecorators(trim, Matches(INDIAN_MOBILE_REGEX, { message: '$property must be a valid 10-digit Indian mobile number', ...options }));

export const IsGstin = (options?: ValidationOptions) =>
  applyDecorators(trimUpper, Matches(GSTIN_REGEX, { message: '$property must be a valid 15-character GSTIN', ...options }));

export const IsPincode = (options?: ValidationOptions) =>
  applyDecorators(trim, Matches(PINCODE_REGEX, { message: '$property must be a valid 6-digit PIN code', ...options }));
