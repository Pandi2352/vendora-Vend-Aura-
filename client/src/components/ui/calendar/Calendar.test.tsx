import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar } from './Calendar';
import { financialYear, maskDmy, monthWeeks, parseDmy, presetRange, toIsoDate, type DateRange } from './calendar-utils';
import { formatTimeValue, maskTime, parseTime, stepTime } from './time-utils';

const cell = (iso: string) => document.querySelector<HTMLElement>(`[data-date="${iso}"]`)!;

function Single(props: { min?: Date; max?: Date; initial?: Date | null; onSelect?: (d: Date) => void }) {
  const [value, setValue] = useState<Date | null>(props.initial ?? null);
  return (
    <>
      <Calendar
        value={value}
        min={props.min}
        max={props.max}
        showToday
        onSelect={(d) => {
          setValue(d);
          props.onSelect?.(d);
        }}
      />
      <output data-testid="value">{value ? toIsoDate(value) : 'none'}</output>
    </>
  );
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-11T06:00:00Z')); // Wed 11 Nov 2026 in India
});
afterEach(() => vi.useRealTimers());

describe('Calendar', () => {
  it('renders an APG grid with today marked and Monday first', () => {
    render(<Single />);
    const grid = screen.getByRole('grid', { name: 'November 2026' });
    expect(grid.querySelectorAll('th')[0]).toHaveAttribute('abbr', 'Monday');
    expect(cell('2026-11-11')).toHaveAttribute('aria-current', 'date');
    expect(cell('2026-11-11')).toHaveAttribute('tabindex', '0');
    expect(document.querySelector('select')).toBeNull();
  });

  it('moves focus with arrows, Home / End and PageUp / PageDown', async () => {
    const user = userEvent.setup();
    render(<Single initial={new Date(2026, 10, 11)} />);
    cell('2026-11-11').focus();
    await user.keyboard('{ArrowRight}');
    expect(cell('2026-11-12')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(cell('2026-11-19')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(cell('2026-11-16')).toHaveFocus(); // Monday
    await user.keyboard('{End}');
    expect(cell('2026-11-22')).toHaveFocus(); // Sunday
    await user.keyboard('{PageUp}');
    expect(screen.getByRole('grid', { name: 'October 2026' })).toBeInTheDocument();
    expect(cell('2026-10-22')).toHaveFocus();
    await user.keyboard('{Shift>}{PageDown}{/Shift}');
    expect(cell('2027-10-22')).toHaveFocus();
    await user.keyboard('{ArrowLeft}{Enter}');
    expect(screen.getByTestId('value')).toHaveTextContent('2027-10-21');
    expect(cell('2027-10-21')).toHaveAttribute('aria-selected', 'true');
  });

  it('crosses into the previous month with ArrowLeft on the 1st', async () => {
    const user = userEvent.setup();
    render(<Single initial={new Date(2026, 10, 1)} />);
    cell('2026-11-01').focus();
    await user.keyboard('{ArrowLeft}');
    expect(cell('2026-10-31')).toHaveFocus();
  });

  it('disables days outside min / max and keeps focus inside the limits', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Single min={new Date(2026, 10, 5)} max={new Date(2026, 10, 20)} onSelect={onSelect} />);
    expect(cell('2026-11-04')).toHaveAttribute('aria-disabled', 'true');
    expect(cell('2026-11-21')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled();
    await user.click(cell('2026-11-04'));
    expect(onSelect).not.toHaveBeenCalled();
    cell('2026-11-11').focus();
    await user.keyboard('{PageDown}');
    expect(cell('2026-11-20')).toHaveFocus();
  });

  it('changes month with the buttons and the month / year lists', async () => {
    const user = userEvent.setup();
    render(<Single />);
    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('grid', { name: 'December 2026' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Previous year' }));
    expect(screen.getByRole('grid', { name: 'December 2025' })).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Month' }));
    await user.click(screen.getByRole('option', { name: 'Mar' }));
    expect(screen.getByRole('grid', { name: 'March 2025' })).toBeInTheDocument();
  });

  it('selects today with the Today button', async () => {
    const user = userEvent.setup();
    render(<Single />);
    await user.click(screen.getByRole('button', { name: 'Today' }));
    expect(screen.getByTestId('value')).toHaveTextContent('2026-11-11');
  });

  it('picks a range with a hover preview', async () => {
    const user = userEvent.setup();
    function Range() {
      const [range, setRange] = useState<DateRange>({ start: null, end: null });
      return (
        <>
          <Calendar range={range} onSelectRange={setRange} />
          <output data-testid="range">{`${range.start ? toIsoDate(range.start) : '-'}..${range.end ? toIsoDate(range.end) : '-'}`}</output>
        </>
      );
    }
    render(<Range />);
    await user.click(cell('2026-11-10'));
    await user.hover(cell('2026-11-14'));
    expect(cell('2026-11-12').className).toContain('bg-primary-50');
    await user.click(cell('2026-11-03')); // before start → becomes the start
    expect(screen.getByTestId('range')).toHaveTextContent('2026-11-03..2026-11-10');
  });
});

describe('calendar-utils', () => {
  it('masks and parses dd/mm/yyyy', () => {
    expect(maskDmy('31122026')).toBe('31/12/2026');
    expect(maskDmy('3a1/1')).toBe('31/1');
    expect(maskDmy('12/')).toBe('12/');
    expect(toIsoDate(parseDmy('1/2/2026')!)).toBe('2026-02-01');
    expect(parseDmy('31/02/2026')).toBeNull();
    expect(parseDmy('31/12/26')).toBeNull();
  });

  it('builds month weeks starting Monday', () => {
    const weeks = monthWeeks(new Date(2026, 10, 1), 1);
    expect(weeks[0].slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(weeks[0][6]?.getDate()).toBe(1);
  });

  it('knows the Indian financial year and presets', () => {
    expect(toIsoDate(financialYear(new Date(2026, 1, 10)).start)).toBe('2025-04-01');
    expect(toIsoDate(financialYear(new Date(2026, 10, 10)).end)).toBe('2027-03-31');
    const lastMonth = presetRange('lastMonth', new Date(2026, 0, 15));
    expect([toIsoDate(lastMonth.start), toIsoDate(lastMonth.end)]).toEqual(['2025-12-01', '2025-12-31']);
  });

  it('parses, masks, formats and steps times', () => {
    expect(parseTime('14:30')).toBe('14:30');
    expect(parseTime('930')).toBe('09:30');
    expect(parseTime('2:30 pm')).toBe('14:30');
    expect(parseTime('12 am')).toBe('00:00');
    expect(parseTime('24:00')).toBeNull();
    expect(parseTime('13 pm')).toBeNull();
    expect(maskTime('1430')).toBe('14:30');
    expect(formatTimeValue('14:30', true)).toBe('2:30 pm');
    expect(stepTime('09:10', 15, 1)).toBe('09:15');
    expect(stepTime('09:15', 15, -1)).toBe('09:00');
    expect(stepTime('23:50', 15, 1)).toBe('00:00');
  });
});
