import { useFormState } from 'react-hook-form';
import { CaretRight } from '@phosphor-icons/react';
import { cn } from '@/components/ui/cn';
import { MsIcon } from '@/components/ui/MsIcon';
import { COMPANY_SECTIONS, type CompanySectionKey } from '../config/sections';

interface SectionNavProps {
  active: CompanySectionKey;
  onSelect: (key: CompanySectionKey) => void;
}

/**
 * Section stepper: a column on wide screens, a scrolling row on phones.
 * Shows each section's field count, or its error count in red after a failed save.
 */
export function SectionNav({ active, onSelect }: SectionNavProps) {
  const { errors } = useFormState();

  return (
    <nav aria-label="Company profile sections" className="md:w-56 shrink-0">
      <ol className="flex md:flex-col gap-1.5 overflow-x-auto scrollbar-none">
        {COMPANY_SECTIONS.map((section, index) => {
          const isActive = section.key === active;
          const errorCount = section.fields.filter((field) => errors[field]).length;
          return (
            <li key={section.key} className="shrink-0">
              <button
                type="button"
                aria-current={isActive ? 'step' : undefined}
                onClick={() => onSelect(section.key)}
                className={cn(
                  'group w-full flex items-center gap-3 p-2.5 rounded-md border text-left transition-colors cursor-pointer',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
                  isActive
                    ? 'bg-primary-50 border-primary-200'
                    : 'border-transparent hover:bg-zinc-50 hover:border-zinc-200',
                )}
              >
                <span
                  className={cn(
                    'w-8 h-8 rounded-md inline-flex items-center justify-center shrink-0 border transition-colors',
                    errorCount > 0
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : isActive
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'bg-white border-zinc-200 text-zinc-500',
                  )}
                >
                  <MsIcon name={section.icon} className={cn('text-[1.125rem]', isActive && 'ms-fill')} />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block text-[0.8125rem] font-bold whitespace-nowrap',
                      isActive ? 'text-primary-700' : 'text-zinc-700',
                    )}
                  >
                    <span className="text-zinc-400 font-semibold mr-1">{index + 1}.</span>
                    {section.label}
                  </span>
                  <span
                    className={cn(
                      'block text-[0.6875rem] font-medium',
                      errorCount > 0 ? 'text-red-700' : 'text-zinc-500',
                    )}
                  >
                    {errorCount > 0 ? `${errorCount} to fix` : `${section.fields.length} fields`}
                  </span>
                </span>
                <CaretRight
                  className={cn('hidden md:block w-3.5 h-3.5', isActive ? 'text-primary-600' : 'text-zinc-300')}
                />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
