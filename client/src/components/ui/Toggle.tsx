import { useId } from 'react';
import { Switch } from './Switch';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

/** Settings row: label + description on the left, Switch on the right. */
export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p id={`${id}-label`} className="text-sm font-semibold text-zinc-900">
          {label}
        </p>
        {description && (
          <p id={`${id}-desc`} className="text-xs text-zinc-500 mt-0.5">
            {description}
          </p>
        )}
      </div>
      <Switch
        checked={checked}
        onChange={onChange}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-desc` : undefined}
      />
    </div>
  );
}
