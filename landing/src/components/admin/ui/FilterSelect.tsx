import { useMemo } from 'react';
import { Dropdown, type DropdownOption } from '../../ui/dropdown';

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  /** Label of the "no filter" option (value 'ALL'). */
  allLabel: string;
}

/** Compact dropdown filter for table toolbars. `label` is the accessible name. */
export function FilterSelect({ label, value, onChange, options, allLabel }: FilterSelectProps) {
  const items = useMemo<DropdownOption[]>(() => [{ value: 'ALL', label: allLabel }, ...options], [options, allLabel]);
  return (
    <Dropdown
      aria-label={label}
      options={items}
      value={value}
      onChange={(v) => onChange(v ?? 'ALL')}
      highlighted={value !== 'ALL'}
      wrapperClassName="w-44"
      className="font-semibold"
    />
  );
}
