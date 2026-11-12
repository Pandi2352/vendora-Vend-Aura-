import type { KeyboardEvent, Ref } from 'react';
import { cn } from '../cn';
import { compareDays, isBetween, isSameDate, longDateLabel, monthWeeks, toIsoDate, weekdayNames, type WeekDay } from './calendar-utils';

interface CalendarGridProps {
  ref?: Ref<HTMLTableElement>;
  month: Date;
  /** Day that owns tabindex=0 (roving focus). */
  active: Date;
  today: Date;
  value: Date | null;
  /** Range (or hover preview) to highlight. */
  range: { start: Date | null; end: Date | null } | null;
  isDisabled: (d: Date) => boolean;
  weekStartsOn: WeekDay;
  locale: string;
  labelledBy: string;
  onKeyDown: (e: KeyboardEvent) => void;
  onChoose: (d: Date) => void;
  onHover?: (d: Date | null) => void;
}

/** role="grid" month table. Days from other months are blank cells. */
export function CalendarGrid({
  ref,
  month,
  active,
  today,
  value,
  range,
  isDisabled,
  weekStartsOn,
  locale,
  labelledBy,
  onKeyDown,
  onChoose,
  onHover,
}: CalendarGridProps) {
  const days = weekdayNames(locale, weekStartsOn);
  const { start, end } = range ?? { start: null, end: null };

  return (
    <table
      ref={ref}
      role="grid"
      aria-labelledby={labelledBy}
      onKeyDown={onKeyDown}
      onMouseLeave={() => onHover?.(null)}
      className="w-full table-fixed border-collapse"
    >
      <thead>
        <tr>
          {days.map((d) => (
            <th key={d.long} scope="col" abbr={d.long} className="h-8 text-xs font-medium text-zinc-500">
              {d.short.slice(0, 2)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {monthWeeks(month, weekStartsOn).map((week, w) => (
          <tr key={w}>
            {week.map((day, i) => {
              if (!day) return <td key={i} className="h-10" />;
              const disabled = isDisabled(day);
              const isEndpoint = isSameDate(day, start) || isSameDate(day, end);
              const selected = isSameDate(day, value) || isEndpoint;
              const inRange = !selected && !!start && !!end && isBetween(day, start, end) && compareDays(start, end) !== 0;
              const isToday = isSameDate(day, today);
              return (
                <td
                  key={i}
                  role="gridcell"
                  data-date={toIsoDate(day)}
                  tabIndex={isSameDate(day, active) ? 0 : -1}
                  aria-label={longDateLabel(day, locale)}
                  aria-selected={selected}
                  aria-current={isToday ? 'date' : undefined}
                  aria-disabled={disabled || undefined}
                  onClick={() => onChoose(day)}
                  onMouseEnter={() => onHover?.(day)}
                  onFocus={() => onHover?.(day)}
                  className={cn(
                    'h-10 p-0 text-center text-sm tabular-nums rounded-md select-none outline-none',
                    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-600',
                    disabled
                      ? 'text-zinc-300 cursor-not-allowed'
                      : selected
                        ? 'bg-primary-600 text-white font-semibold cursor-pointer'
                        : inRange
                          ? 'bg-primary-50 text-primary-800 cursor-pointer hover:bg-primary-100'
                          : 'text-zinc-800 cursor-pointer hover:bg-zinc-100',
                    isToday && !selected && !disabled && 'font-semibold text-primary-700 underline underline-offset-4',
                  )}
                >
                  {day.getDate()}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
