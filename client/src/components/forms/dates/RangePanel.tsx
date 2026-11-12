import { useState } from 'react';
import { Button } from '../../ui/Button';
import { cn } from '../../ui/cn';
import { Calendar } from '../../ui/calendar/Calendar';
import {
  RANGE_PRESETS,
  clampDate,
  compareDays,
  formatDmy,
  isOutOfBounds,
  presetRange,
  startOfMonth,
  todayDate,
  type DateRange,
  type RangePresetKey,
  type WeekDay,
} from '../../ui/calendar/calendar-utils';

interface RangePanelProps {
  initial: DateRange;
  min: Date | null;
  max: Date | null;
  isDateDisabled?: (date: Date) => boolean;
  weekStartsOn: WeekDay;
  showPresets: boolean;
  onApply: (range: { start: Date; end: Date }) => void;
  onCancel: () => void;
}

/** Preset range limited to [min, max]; null when it lies completely outside. */
function boundedPreset(key: RangePresetKey, min: Date | null, max: Date | null) {
  const { start, end } = presetRange(key, todayDate());
  if (isOutOfBounds(end, min, null) || isOutOfBounds(start, null, max)) return null;
  return { start: clampDate(start, min, max), end: clampDate(end, min, max) };
}

const presetClass = (pressed: boolean) =>
  cn(
    'h-8 px-2.5 rounded-md text-left text-sm whitespace-nowrap cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-primary-600',
    'disabled:text-zinc-300 disabled:cursor-not-allowed',
    pressed ? 'bg-primary-50 text-primary-700 font-medium' : 'text-zinc-700 hover:bg-zinc-100',
  );

/** Popover body of DateRangeField: presets column, range calendar, Cancel / Apply. */
export function RangePanel({ initial, min, max, isDateDisabled, weekStartsOn, showPresets, onApply, onCancel }: RangePanelProps) {
  const [draft, setDraft] = useState<DateRange>(initial);
  const [preset, setPreset] = useState<RangePresetKey | 'custom' | null>(null);
  const [month, setMonth] = useState(() => startOfMonth(initial.start ?? clampDate(todayDate(), min, max)));

  const choosePreset = (key: RangePresetKey) => {
    const range = boundedPreset(key, min, max);
    if (!range) return;
    setDraft(range);
    setPreset(key);
    setMonth(startOfMonth(range.start));
  };

  const summary = !draft.start
    ? 'Choose the start date'
    : !draft.end
      ? `${formatDmy(draft.start)} – choose the end date`
      : `${formatDmy(draft.start)} – ${formatDmy(draft.end)}`;

  const apply = () => {
    if (!draft.start) return;
    const end = draft.end ?? draft.start;
    onApply(compareDays(draft.start, end) <= 0 ? { start: draft.start, end } : { start: end, end: draft.start });
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col sm:flex-row">
        {showPresets && (
          <div
            role="group"
            aria-label="Quick ranges"
            className="flex flex-wrap sm:flex-col gap-1 p-3 border-b sm:border-b-0 sm:border-r border-zinc-100 sm:w-44"
          >
            {RANGE_PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                aria-pressed={preset === p.key}
                disabled={!boundedPreset(p.key, min, max)}
                onClick={() => choosePreset(p.key)}
                className={presetClass(preset === p.key)}
              >
                {p.label}
              </button>
            ))}
            <button type="button" aria-pressed={preset === 'custom'} onClick={() => setPreset('custom')} className={presetClass(preset === 'custom')}>
              Custom
            </button>
          </div>
        )}
        <Calendar
          range={draft}
          onSelectRange={(r) => {
            setDraft(r);
            setPreset('custom');
          }}
          month={month}
          onMonthChange={setMonth}
          min={min}
          max={max}
          isDateDisabled={isDateDisabled}
          weekStartsOn={weekStartsOn}
          autoFocus
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-t border-zinc-100">
        <p className="text-xs text-zinc-600 tabular-nums" aria-live="polite">
          {summary}
        </p>
        <div className="flex gap-2 ml-auto">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={apply} disabled={!draft.start}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
