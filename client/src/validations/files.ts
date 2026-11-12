import { z } from 'zod';

interface FileRuleOptions {
  label?: string;
  required?: boolean;
  /** Most files allowed (multiple only). */
  maxFiles?: number;
}

const isFile = (value: unknown): value is File => typeof File !== 'undefined' && value instanceof File;

/**
 * Rule for FileField. Type / size limits are checked by the field when files are
 * picked, so the schema only checks presence and count.
 * - fileRule({ required }) → File[] (FileField multiple)
 * - fileRule.single({ required }) → File | null (FileField without multiple)
 */
export function fileRule({ label = 'a file', required = false, maxFiles }: FileRuleOptions = {}) {
  let schema = z.array(z.custom<File>(isFile, 'Choose a valid file'), { error: `Add ${label.toLowerCase()}` });
  if (required) schema = schema.min(1, `Add ${label.toLowerCase()}`);
  if (maxFiles) schema = schema.max(maxFiles, `Add at most ${maxFiles} files`);
  return schema;
}

fileRule.single = function single({ label = 'a file', required = false }: Omit<FileRuleOptions, 'maxFiles'> = {}) {
  const schema = z.custom<File | null>((v) => v === null || v === undefined || isFile(v), 'Choose a valid file');
  return required ? schema.refine((v) => isFile(v), `Add ${label.toLowerCase()}`) : schema;
};
