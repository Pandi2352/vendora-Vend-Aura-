import { cn } from './cn';

/**
 * Single source for form-control styling, so Input, Dropdown, Textarea,
 * Password, Amount and Phone fields all have the same height, border,
 * focus and error look. Focus uses an outline (not box-shadow): no shadows.
 */
export const CONTROL_HEIGHT = 'h-10';

export const controlBase =
  'w-full rounded-md border text-sm placeholder:text-zinc-400 transition-colors ' +
  'outline-none disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400';

export const controlStates = {
  normal:
    'bg-white text-zinc-900 border-zinc-300 hover:border-zinc-400 focus:border-red-600 focus:outline-2 focus:outline-offset-0 focus:outline-red-100',
  invalid:
    'bg-white text-zinc-900 border-red-500 hover:border-red-600 focus:border-red-600 focus:outline-2 focus:outline-offset-0 focus:outline-red-100',
  /** Tinted look for a control holding a non-default value (e.g. an active table filter). */
  highlighted:
    'border-red-300 bg-red-50 text-red-700 font-semibold hover:border-red-400 focus:border-red-600 focus:outline-2 focus:outline-offset-0 focus:outline-red-100',
} as const;

/** Classes for a single-line control (input, dropdown trigger). */
export const controlClass = (invalid?: boolean, extra?: string, highlighted?: boolean) =>
  cn(
    controlBase,
    CONTROL_HEIGHT,
    'px-3',
    invalid ? controlStates.invalid : highlighted ? controlStates.highlighted : controlStates.normal,
    extra,
  );

/**
 * Wrapper look for controls with addons (₹ prefix, eye button): the wrapper
 * carries border + focus, the inner <input> is borderless.
 */
export const controlShellClass = (invalid?: boolean, disabled?: boolean) =>
  cn(
    'flex items-stretch w-full rounded-md border bg-white transition-colors overflow-hidden',
    CONTROL_HEIGHT,
    invalid
      ? 'border-red-500 focus-within:border-red-600 focus-within:outline-2 focus-within:outline-red-100'
      : 'border-zinc-300 hover:border-zinc-400 focus-within:border-red-600 focus-within:outline-2 focus-within:outline-red-100',
    disabled && 'bg-zinc-100 cursor-not-allowed',
  );

export const addonClass = 'flex items-center px-3 text-sm text-zinc-500 bg-zinc-50 shrink-0';
