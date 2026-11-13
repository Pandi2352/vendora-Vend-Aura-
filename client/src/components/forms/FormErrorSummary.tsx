import { useFormContext } from 'react-hook-form';
import { WarningCircle } from '@phosphor-icons/react';
import { flattenErrors } from './flattenErrors';

/**
 * "There is a problem" box after a failed submit (GOV.UK pattern): every error
 * as a link that focuses its field. Shown by <Form errorSummary>.
 */
export function FormErrorSummary({ title = 'There is a problem' }: { title?: string }) {
  const { formState, setFocus } = useFormContext();
  if (formState.submitCount === 0) return null;
  const entries = flattenErrors(formState.errors).filter((e, i, all) => all.findIndex((x) => x.path === e.path) === i);
  if (entries.length === 0) return null;

  return (
    <div
      role="alert"
      aria-labelledby="form-error-summary-title"
      className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3"
    >
      <p id="form-error-summary-title" className="flex items-center gap-1.5 text-sm font-bold text-red-700">
        <WarningCircle aria-hidden weight="fill" className="w-4 h-4" />
        {title}
      </p>
      <ul className="mt-1.5 space-y-0.5 pl-5.5">
        {entries.map((entry) => (
          <li key={entry.path}>
            <a
              href={`#${entry.path}`}
              onClick={(e) => {
                e.preventDefault();
                try {
                  setFocus(entry.path as never);
                } catch {
                  /* field without a focusable ref */
                }
              }}
              className="text-xs font-medium text-red-700 underline underline-offset-2 hover:text-red-800"
            >
              {entry.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
