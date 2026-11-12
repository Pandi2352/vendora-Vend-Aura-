import { useEffect, useRef, type KeyboardEvent, type PointerEvent, type ReactNode, type Ref } from 'react';
import { clamp } from '@/utils/number';
import { cn } from './cn';

export interface SliderMark {
  value: number;
  label?: ReactNode;
}

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Ticks under the track; `true` = one per step (use for few steps only). */
  marks?: SliderMark[] | boolean;
  /** Show the formatted value beside the track. */
  showValue?: boolean;
  /** Formats the value label and aria-valuetext, e.g. (v) => `${v}%`. */
  formatValue?: (value: number) => string;
  onBlur?: () => void;
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  id?: string;
  ref?: Ref<HTMLDivElement>;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
}

const decimals = (n: number) => (String(n).split('.')[1] ?? '').length;

/** Single-thumb slider (WAI-ARIA APG): arrows ±step, PageUp/Down ±10 steps, Home/End, pointer drag. */
export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  marks,
  showValue,
  formatValue = String,
  onBlur,
  invalid,
  disabled,
  readOnly,
  autoFocus,
  id,
  ref,
  className,
  ...aria
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (autoFocus) thumbRef.current?.focus(); // React only auto-focuses form elements
  }, [autoFocus]);
  const locked = disabled || readOnly;
  const current = clamp(Number.isFinite(value) ? value : min, min, max);
  const percent = max > min ? ((current - min) / (max - min)) * 100 : 0;

  const snap = (raw: number) => {
    const stepped = Math.round((raw - min) / step) * step + min;
    return clamp(Number(stepped.toFixed(Math.max(decimals(step), decimals(min)))), min, max);
  };

  const set = (next: number) => {
    const snapped = snap(next);
    if (snapped !== current) onChange(snapped);
  };

  const fromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    set(min + clamp((clientX - rect.left) / rect.width, 0, 1) * (max - min));
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (locked) return;
    const keys: Record<string, number> = {
      ArrowRight: current + step,
      ArrowUp: current + step,
      ArrowLeft: current - step,
      ArrowDown: current - step,
      PageUp: current + step * 10,
      PageDown: current - step * 10,
      Home: min,
      End: max,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    set(keys[e.key]);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (locked || e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    thumbRef.current?.focus();
    fromPointer(e.clientX);
  };

  const markList: SliderMark[] =
    marks === true
      ? Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => ({ value: snap(min + i * step) }))
      : marks || [];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative flex-1 min-w-0">
        <div
          ref={trackRef}
          className={cn('relative flex h-10 items-center touch-none select-none', locked ? 'cursor-not-allowed' : 'cursor-pointer')}
          onPointerDown={onPointerDown}
          onPointerMove={(e) => !locked && e.currentTarget.hasPointerCapture?.(e.pointerId) && fromPointer(e.clientX)}
        >
          <div className="relative h-1.5 w-full rounded-md bg-zinc-200">
            <div
              className={cn('absolute inset-y-0 left-0 rounded-md', disabled ? 'bg-zinc-400' : invalid ? 'bg-red-500' : 'bg-primary-600')}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div
            ref={(el) => {
              thumbRef.current = el;
              if (typeof ref === 'function') ref(el);
              else if (ref) ref.current = el;
            }}
            id={id}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={current}
            aria-valuetext={formatValue(current)}
            aria-orientation="horizontal"
            aria-disabled={disabled || undefined}
            aria-readonly={readOnly || undefined}
            aria-invalid={invalid || undefined}
            aria-label={aria['aria-label']}
            aria-labelledby={aria['aria-labelledby']}
            aria-describedby={aria['aria-describedby']}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            style={{ left: `${percent}%` }}
            className={cn(
              'absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white transition-colors outline-none',
              'focus-visible:outline-2 focus-visible:outline-offset-2',
              disabled
                ? 'border-zinc-400'
                : invalid
                  ? 'border-red-500 focus-visible:outline-red-500'
                  : 'border-primary-600 hover:bg-primary-50 focus-visible:outline-primary-600',
            )}
          />
        </div>
        {markList.length > 0 && (
          <div aria-hidden className="relative -mt-2 h-5 text-xs text-zinc-500">
            {markList.map((mark) => {
              const left = ((mark.value - min) / (max - min)) * 100;
              return (
                <span key={mark.value} className="absolute top-0 -translate-x-1/2 flex flex-col items-center" style={{ left: `${left}%` }}>
                  <span className={cn('h-1.5 w-px', mark.value <= current ? 'bg-primary-600' : 'bg-zinc-300')} />
                  {mark.label !== undefined && <span className="whitespace-nowrap">{mark.label}</span>}
                </span>
              );
            })}
          </div>
        )}
      </div>
      {showValue && (
        <output aria-hidden className="min-w-12 text-right text-sm font-medium tabular-nums text-zinc-800">
          {formatValue(current)}
        </output>
      )}
    </div>
  );
}
