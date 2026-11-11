import { CircleNotch, CheckCircle, WarningCircle } from '@phosphor-icons/react';

interface IdCheckStatus {
  available: boolean;
  message: string;
}

interface CustomerIdFieldProps {
  value: string;
  onChange: (val: string) => void;
  onBlur: () => void;
  onManualCheck: () => void;
  isChecking: boolean;
  checkStatus: IdCheckStatus | null;
  errorMessage?: string;
}

export function CustomerIdField({
  value,
  onChange,
  onBlur,
  onManualCheck,
  isChecking,
  checkStatus,
  errorMessage,
}: CustomerIdFieldProps) {
  const isAvailable = checkStatus?.available === true && !errorMessage;
  const isError = Boolean(errorMessage || (checkStatus && !checkStatus.available));

  return (
    <div>
      <label className="block text-xs font-bold text-zinc-900 mb-1.5">
        Customer ID <span className="text-red-600">*</span>
      </label>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 6);
              onChange(sanitized);
            }}
            onBlur={onBlur}
            placeholder="e.g. kmart"
            className={`w-full px-3.5 py-2.5 rounded-md border text-sm font-semibold outline-hidden transition-all ${
              isError
                ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-red-950'
                : isAvailable
                ? 'border-emerald-500 bg-emerald-50/20 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 text-zinc-950'
                : 'border-zinc-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />

          {/* Right Status Icon inside Input */}
          <div className="absolute right-3 top-3 pointer-events-none">
            {isChecking && <CircleNotch className="w-4 h-4 text-blue-600 animate-spin" />}
            {!isChecking && isAvailable && <CheckCircle weight="fill" className="w-4 h-4 text-emerald-600" />}
            {!isChecking && isError && <WarningCircle weight="fill" className="w-4 h-4 text-red-500" />}
          </div>
        </div>

        <button
          type="button"
          onClick={onManualCheck}
          disabled={isChecking}
          className="px-6 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shrink-0 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
        >
          {isChecking ? (
            <>
              <CircleNotch className="w-4 h-4 animate-spin" />
              <span>Checking</span>
            </>
          ) : (
            <span>Check</span>
          )}
        </button>
      </div>

      {/* Helper text, Availability message, or Error message */}
      <div className="mt-1.5 min-h-[18px]">
        {isError ? (
          <p className="text-red-600 text-xs font-semibold flex items-center gap-1.5">
            <WarningCircle weight="fill" className="w-3.5 h-3.5 shrink-0 text-red-500" />
            <span>{errorMessage || checkStatus?.message}</span>
          </p>
        ) : isAvailable ? (
          <p className="text-emerald-600 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle weight="fill" className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
            <span>
              {checkStatus?.message} Store URL: <strong className="font-mono text-emerald-700">{value}.vendora.com</strong>
            </span>
          </p>
        ) : (
          <p className="text-zinc-500 text-xs">
            3 to 6 letters or numbers — you'll sign in with this ID.
          </p>
        )}
      </div>
    </div>
  );
}

