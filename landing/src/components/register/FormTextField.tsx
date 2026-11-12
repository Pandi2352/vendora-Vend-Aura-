import { useId } from 'react';
import { WarningCircle } from '@phosphor-icons/react';

interface FormTextFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  error?: string;
  type?: 'text' | 'tel' | 'email';
  inputMode?: 'text' | 'numeric' | 'tel' | 'email';
  maxLength?: number;
  autoComplete?: string;
}

export function FormTextField({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = 'text',
  inputMode,
  maxLength,
  autoComplete,
}: FormTextFieldProps) {
  const inputId = useId();
  return (
    <div>
      <label htmlFor={inputId} className="block text-xs font-bold text-zinc-900 mb-1.5">
        {label} <span className="text-red-600">*</span>
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        className={`w-full px-3.5 py-2.5 rounded-md border text-sm font-medium outline-hidden transition-all ${
          error
            ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
            : 'border-zinc-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
        }`}
      />
      {error && (
        <p className="text-red-600 text-xs font-semibold mt-1.5 flex items-center gap-1.5">
          <WarningCircle weight="fill" className="w-3.5 h-3.5 shrink-0 text-red-500" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
