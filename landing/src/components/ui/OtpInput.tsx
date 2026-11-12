import { useRef, type ClipboardEvent, type FocusEvent, type KeyboardEvent, type Ref } from 'react';
import { digitsOnly } from '../../lib/string';
import { cn } from './cn';
import { controlStates } from './field-styles';

export interface OtpInputProps {
  /** Number of digits (default 6). */
  length?: number;
  /** The code typed so far; empty boxes in the middle are kept as spaces. */
  value: string;
  onChange: (value: string) => void;
  /** Called once every box holds a digit. */
  onComplete?: (code: string) => void;
  /** Called when focus leaves the whole group (not when moving between boxes). */
  onBlur?: () => void;
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  /** Id of the first box. */
  id?: string;
  /** Ref of the first box (RHF focuses it on error). */
  ref?: Ref<HTMLInputElement>;
  className?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
}

/** One-time code boxes: auto-advance, Backspace goes back, paste fills every box. */
export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  onBlur,
  invalid,
  disabled,
  readOnly,
  autoFocus,
  id,
  ref,
  className,
  ...aria
}: OtpInputProps) {
  const boxes = useRef<Array<HTMLInputElement | null>>([]);
  const chars = Array.from({ length }, (_, i) => (/\d/.test(value[i] ?? '') ? value[i] : ''));
  const locked = disabled || readOnly;

  const focusBox = (index: number) => {
    const box = boxes.current[Math.max(0, Math.min(index, length - 1))];
    box?.focus();
    box?.select();
  };

  const commit = (next: string[]) => {
    const code = next.map((c) => c || ' ').join('').trimEnd();
    if (code === value.trimEnd()) return;
    onChange(code);
    if (next.every(Boolean)) onComplete?.(next.join(''));
  };

  /** Writes digits starting at `start`; returns the index after the last written digit. */
  const fill = (digits: string, start: number) => {
    const next = [...chars];
    const slice = digits.slice(0, length - start);
    [...slice].forEach((d, k) => (next[start + k] = d));
    commit(next);
    return start + slice.length;
  };

  const handleChange = (index: number, raw: string) => {
    if (locked) return;
    const digits = digitsOnly(raw);
    if (digits.length === 0) {
      const next = [...chars];
      next[index] = '';
      commit(next);
      return;
    }
    // Typing into a filled box (caret not selecting it) gives old + new digit: keep the new one.
    const typed = chars[index] && digits.length === 2 ? digits.replace(chars[index], '') : digits;
    // Several digits at once = browser autofill; a full code always starts at box 1.
    focusBox(fill(typed, typed.length >= length ? 0 : index));
  };

  const handlePaste = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (locked) return;
    const digits = digitsOnly(e.clipboardData.getData('text'));
    if (!digits) return;
    const after = fill(digits, digits.length >= length ? 0 : index);
    focusBox(after);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    const move = (to: number) => {
      e.preventDefault();
      focusBox(to);
    };
    if (e.key === 'ArrowLeft') move(index - 1);
    else if (e.key === 'ArrowRight') move(index + 1);
    else if (e.key === 'Home') move(0);
    else if (e.key === 'End') move(length - 1);
    else if (e.key === 'Backspace' && !chars[index] && index > 0 && !locked) {
      e.preventDefault();
      const next = [...chars];
      next[index - 1] = '';
      commit(next);
      focusBox(index - 1);
    }
  };

  const handleGroupBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onBlur?.();
  };

  return (
    <div role="group" aria-labelledby={aria['aria-labelledby']} onBlur={handleGroupBlur} className={cn('flex flex-wrap gap-2', className)}>
      {chars.map((char, i) => (
        <input
          key={i}
          ref={(el) => {
            boxes.current[i] = el;
            if (i === 0 && ref) {
              if (typeof ref === 'function') ref(el);
              else ref.current = el;
            }
          }}
          id={i === 0 ? id : undefined}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          // Forwards the caller's explicit autoFocus opt-in to the first box.
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus && i === 0}
          aria-label={`Digit ${i + 1} of ${length}`}
          aria-describedby={aria['aria-describedby']}
          aria-invalid={invalid || undefined}
          aria-required={aria['aria-required'] || undefined}
          value={char}
          disabled={disabled}
          readOnly={readOnly}
          onChange={(e) => handleChange(i, e.target.value)}
          onPaste={(e) => handlePaste(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className={cn(
            'h-10 w-10 rounded-md border bg-white text-center text-base font-semibold tabular-nums text-zinc-900 outline-none transition-colors',
            'disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 read-only:bg-zinc-50',
            invalid ? controlStates.invalid : controlStates.normal,
          )}
        />
      ))}
    </div>
  );
}
