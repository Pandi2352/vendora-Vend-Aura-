import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '../cn';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import {
  addDays,
  addMonths,
  addYears,
  clampDate,
  compareDays,
  endOfMonth,
  endOfWeek,
  isOutOfBounds,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  todayDate,
  toIsoDate,
  type DateRange,
  type WeekDay,
} from './calendar-utils';

export interface CalendarProps {
  /** Selected day (single mode). */
  value?: Date | null;
  onSelect?: (date: Date) => void;
  /** Range mode: pass `range` + `onSelectRange` (first click = start, second = end). */
  range?: DateRange;
  onSelectRange?: (range: DateRange) => void;
  min?: Date | null;
  max?: Date | null;
  isDateDisabled?: (date: Date) => boolean;
  /** Shown month (first day). Optional controlled mode. */
  month?: Date;
  onMonthChange?: (month: Date) => void;
  /** 1 = Monday (India). */
  weekStartsOn?: WeekDay;
  locale?: string;
  /** "Today" button under the grid (single mode). */
  showToday?: boolean;
  /** Focus the selected day (or today) when the calendar appears. */
  autoFocus?: boolean;
  'aria-label'?: string;
  className?: string;
}

/**
 * Month calendar following the WAI-ARIA APG date picker dialog: role="grid",
 * roving focus, arrows / Home / End / PageUp / PageDown (+Shift for years),
 * Enter / Space to choose. Disabled days stay focusable but cannot be chosen.
 */
export function Calendar({
  value = null,
  onSelect,
  range,
  onSelectRange,
  min = null,
  max = null,
  isDateDisabled,
  month: controlledMonth,
  onMonthChange,
  weekStartsOn = 1,
  locale = 'en-IN',
  showToday = false,
  autoFocus = false,
  'aria-label': ariaLabel,
  className,
}: CalendarProps) {
  const headingId = useId();
  const gridRef = useRef<HTMLTableElement | null>(null);
  const isRange = range !== undefined;
  const initial = clampDate((isRange ? range.start : value) ?? todayDate(), min, max);

  const [focused, setFocused] = useState(initial);
  const [ownMonth, setOwnMonth] = useState(() => startOfMonth(initial));
  const [hovered, setHovered] = useState<Date | null>(null);
  const pendingFocus = useRef(false);
  const visibleMonth = controlledMonth ? startOfMonth(controlledMonth) : ownMonth;

  // The day with tabindex=0: the focused day when it is in the shown month, else the same day there.
  const sameDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), Math.min(focused.getDate(), endOfMonth(visibleMonth).getDate()));
  const clamped = clampDate(isSameMonth(focused, visibleMonth) ? focused : sameDay, min, max);
  const active = isSameMonth(clamped, visibleMonth) ? clamped : visibleMonth;

  const setMonth = (next: Date) => {
    const m = startOfMonth(next);
    if (!controlledMonth) setOwnMonth(m);
    if (!isSameMonth(m, visibleMonth)) onMonthChange?.(m);
  };

  const focusCell = (d: Date) => gridRef.current?.querySelector<HTMLElement>(`[data-date="${toIsoDate(d)}"]`)?.focus();

  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    focusCell(active);
  });

  useEffect(() => {
    if (!autoFocus) return;
    // After the surrounding popover has placed its own initial focus.
    const timer = window.setTimeout(() => focusCell(active), 0);
    return () => window.clearTimeout(timer);
    // Only when the calendar first appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveTo = (target: Date) => {
    const next = clampDate(target, min, max);
    setFocused(next);
    if (!isSameMonth(next, visibleMonth)) setMonth(next);
    if (isRange) setHovered(next);
    pendingFocus.current = true;
  };

  const isDisabled = (d: Date) => isOutOfBounds(d, min, max) || !!isDateDisabled?.(d);

  const choose = (d: Date) => {
    if (isDisabled(d)) return;
    setFocused(d);
    if (!isRange) {
      onSelect?.(d);
      return;
    }
    const { start, end } = range;
    if (!start || end) onSelectRange?.({ start: d, end: null });
    else if (compareDays(d, start) < 0) onSelectRange?.({ start: d, end: start });
    else onSelectRange?.({ start, end: d });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(active, -1),
      ArrowRight: () => addDays(active, 1),
      ArrowUp: () => addDays(active, -7),
      ArrowDown: () => addDays(active, 7),
      Home: () => startOfWeek(active, weekStartsOn),
      End: () => endOfWeek(active, weekStartsOn),
      PageUp: () => (e.shiftKey ? addYears(active, -1) : addMonths(active, -1)),
      PageDown: () => (e.shiftKey ? addYears(active, 1) : addMonths(active, 1)),
    };
    if (moves[e.key]) {
      e.preventDefault();
      moveTo(moves[e.key]());
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(active);
    }
  };

  const today = todayDate();
  const preview = isRange && range.start && !range.end && hovered ? { start: range.start, end: hovered } : null;

  return (
    <div className={cn('w-[20.5rem] max-w-full p-3 flex flex-col gap-2', className)} role={ariaLabel ? 'group' : undefined} aria-label={ariaLabel}>
      <CalendarHeader
        month={visibleMonth}
        onMonthChange={(m) => {
          setMonth(m);
          setFocused(clampDate(new Date(m.getFullYear(), m.getMonth(), Math.min(focused.getDate(), endOfMonth(m).getDate())), min, max));
        }}
        min={min}
        max={max}
        locale={locale}
        headingId={headingId}
      />
      <CalendarGrid
        ref={gridRef}
        month={visibleMonth}
        active={active}
        today={today}
        value={isRange ? null : value}
        range={isRange ? (preview ?? range) : null}
        isDisabled={isDisabled}
        weekStartsOn={weekStartsOn}
        locale={locale}
        labelledBy={headingId}
        onKeyDown={onKeyDown}
        onChoose={choose}
        onHover={isRange ? setHovered : undefined}
      />
      {showToday && !isRange && (
        <div className="flex justify-end border-t border-zinc-100 pt-2">
          <button
            type="button"
            disabled={isDisabled(today)}
            onClick={() => {
              moveTo(today);
              choose(today);
            }}
            className="h-8 px-3 rounded-md text-xs font-medium text-primary-700 hover:bg-primary-50 cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-primary-600 disabled:text-zinc-300 disabled:cursor-not-allowed"
          >
            Today
          </button>
        </div>
      )}
    </div>
  );
}
