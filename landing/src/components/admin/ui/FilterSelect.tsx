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
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-9 px-2.5 rounded-md border bg-white text-sm font-semibold outline-none cursor-pointer max-w-[190px] focus:border-red-600 ${
        value === 'ALL' ? 'border-zinc-200 text-zinc-700' : 'border-red-300 text-red-700 bg-red-50'
      }`}
    >
      <option value="ALL">{allLabel}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
