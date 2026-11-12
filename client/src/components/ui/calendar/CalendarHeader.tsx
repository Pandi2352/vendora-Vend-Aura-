import type { ReactNode } from 'react';
import { CaretDoubleLeft, CaretDoubleRight, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { Dropdown } from '../dropdown/Dropdown';
import type { DropdownOption } from '../dropdown/dropdown-utils';
import { addMonths, addYears, clampDate, compareDays, endOfMonth, monthNames, monthYearLabel, startOfMonth, todayDate } from './calendar-utils';

interface CalendarHeaderProps {
  month: Date;
  onMonthChange: (month: Date) => void;
  min?: Date | null;
  max?: Date | null;
  locale: string;
  headingId: string;
}

const YEARS_BACK = 100;
const YEARS_AHEAD = 10;

/** True when no day of `month` lies inside [min, max]. */
const monthOutOfBounds = (month: Date, min?: Date | null, max?: Date | null) =>
  (!!min && compareDays(endOfMonth(month), min) < 0) || (!!max && compareDays(startOfMonth(month), max) > 0);

function NavButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center justify-center w-8 h-8 shrink-0 rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-primary-600 disabled:text-zinc-300 disabled:cursor-not-allowed disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

/** Previous / next year and month buttons with month + year jump lists. */
export function CalendarHeader({ month, onMonthChange, min, max, locale, headingId }: CalendarHeaderProps) {
  const year = month.getFullYear();
  const go = (target: Date) => {
    const lower = min ? startOfMonth(min) : null;
    onMonthChange(startOfMonth(clampDate(startOfMonth(target), lower, max)));
  };

  const thisYear = todayDate().getFullYear();
  const firstYear = Math.min(min?.getFullYear() ?? thisYear - YEARS_BACK, year);
  const lastYear = Math.max(max?.getFullYear() ?? thisYear + YEARS_AHEAD, year);
  const yearOptions: DropdownOption<number>[] = [];
  for (let y = firstYear; y <= lastYear; y++) yearOptions.push({ value: y, label: String(y) });

  const monthOptions: DropdownOption<number>[] = monthNames(locale, 'short').map((label, m) => ({
    value: m,
    label,
    disabled: monthOutOfBounds(new Date(year, m, 1), min, max),
  }));

  const prevMonth = addMonths(startOfMonth(month), -1);
  const nextMonth = addMonths(startOfMonth(month), 1);
  const prevYear = addYears(startOfMonth(month), -1);
  const nextYear = addYears(startOfMonth(month), 1);
  // Year jumps clamp to the min / max month, so they stay usable until that month is shown.
  const atStart = monthOutOfBounds(prevMonth, min, null);
  const atEnd = monthOutOfBounds(nextMonth, null, max);

  return (
    <div className="flex items-center gap-1">
      <h2 id={headingId} aria-live="polite" className="sr-only">
        {monthYearLabel(month, locale)}
      </h2>
      <NavButton label="Previous year" onClick={() => go(prevYear)} disabled={atStart}>
        <CaretDoubleLeft className="w-4 h-4" />
      </NavButton>
      <NavButton label="Previous month" onClick={() => go(prevMonth)} disabled={atStart}>
        <CaretLeft className="w-4 h-4" />
      </NavButton>
      <div className="flex flex-1 min-w-0 gap-1">
        <div className="flex-1 min-w-0">
          <Dropdown<number>
            aria-label="Month"
            options={monthOptions}
            value={month.getMonth()}
            onChange={(m) => m !== null && go(new Date(year, m, 1))}
            searchable={false}
          />
        </div>
        <div className="w-[5.25rem] shrink-0">
          <Dropdown<number>
            aria-label="Year"
            options={yearOptions}
            value={year}
            onChange={(y) => y !== null && go(new Date(y, month.getMonth(), 1))}
            searchable={false}
            className="tabular-nums"
          />
        </div>
      </div>
      <NavButton label="Next month" onClick={() => go(nextMonth)} disabled={atEnd}>
        <CaretRight className="w-4 h-4" />
      </NavButton>
      <NavButton label="Next year" onClick={() => go(nextYear)} disabled={atEnd}>
        <CaretDoubleRight className="w-4 h-4" />
      </NavButton>
    </div>
  );
}
