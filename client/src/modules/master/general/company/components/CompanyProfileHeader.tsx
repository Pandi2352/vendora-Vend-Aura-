import {
  ArrowsClockwise,
  CheckCircle,
  CurrencyInr,
  FloppyDisk,
  MapPin,
  Percent,
  Receipt,
  Tag,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { FactStrip, type Fact } from '@/components/ui/FactStrip';
import { cn } from '@/components/ui/cn';

export type CompanyFactKey = 'gstin' | 'location' | 'currency' | 'tax' | 'maxDiscount';

interface CompanyProfileHeaderProps {
  companyName: string;
  shopId?: string;
  updatedOn: string;
  updatedBy: string;
  facts: Partial<Record<CompanyFactKey, string | null>>;
  /** Number of edited, not yet saved fields (0 = everything saved). */
  unsavedCount: number;
  saving?: boolean;
  onReset: () => void;
  /** Jump to the field behind a fact. */
  onFactSelect?: (key: CompanyFactKey) => void;
}

const FACTS: Omit<Fact, 'value'>[] = [
  { key: 'gstin', label: 'GSTIN', icon: Receipt, tone: 'blue' },
  { key: 'location', label: 'Location', icon: MapPin, tone: 'red' },
  { key: 'currency', label: 'Currency', icon: CurrencyInr, tone: 'emerald' },
  { key: 'tax', label: 'Tax', icon: Percent, tone: 'amber' },
  { key: 'maxDiscount', label: 'Max discount', icon: Tag, tone: 'blue' },
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('') || 'CO';

function SaveStatus({ unsavedCount, saving }: { unsavedCount: number; saving?: boolean }) {
  const dirty = unsavedCount > 0;
  return (
    <span
      role="status"
      className={cn(
        'h-5 px-1.5 rounded-md border text-[0.6875rem] font-bold inline-flex items-center gap-1 shrink-0',
        dirty ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800',
      )}
    >
      {dirty ? (
        <>
          <span
            className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse motion-reduce:animate-none"
            aria-hidden
          />
          {saving ? 'Saving…' : `${unsavedCount} unsaved ${unsavedCount === 1 ? 'change' : 'changes'}`}
        </>
      ) : (
        <>
          <CheckCircle weight="fill" className="w-3 h-3" aria-hidden />
          All changes saved
        </>
      )}
    </span>
  );
}

/**
 * Company profile header: identity with a save-status badge, the key facts
 * (click one to edit it), and Reset / Save. Save submits the surrounding form.
 */
export function CompanyProfileHeader({
  companyName,
  shopId,
  updatedOn,
  updatedBy,
  facts,
  unsavedCount,
  saving,
  onReset,
  onFactSelect,
}: CompanyProfileHeaderProps) {
  const dirty = unsavedCount > 0;

  return (
    <section
      className={cn(
        'bg-white border rounded-md px-3 py-2.5 flex flex-wrap xl:flex-nowrap items-center gap-x-4 gap-y-2.5 transition-colors',
        dirty ? 'border-amber-200' : 'border-zinc-200',
      )}
    >
      <div className="flex items-center gap-3 min-w-0 shrink-0">
        <span className="w-9 h-9 rounded-md bg-primary-50 border border-primary-200 text-primary-700 text-sm font-black inline-flex items-center justify-center shrink-0">
          {initials(companyName)}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-sm font-bold text-zinc-900 truncate max-w-56">{companyName}</h2>
            {shopId && (
              <span className="text-[0.6875rem] font-mono font-semibold text-zinc-500 shrink-0">@{shopId}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <SaveStatus unsavedCount={unsavedCount} saving={saving} />
            <span className="text-[0.6875rem] text-zinc-500 whitespace-nowrap">
              Updated {updatedOn} by {updatedBy}
            </span>
          </div>
        </div>
      </div>

      <FactStrip
        className="order-last xl:order-none basis-full xl:basis-auto"
        facts={FACTS.map((fact) => ({ ...fact, value: facts[fact.key as CompanyFactKey] }))}
        onSelect={onFactSelect ? (key) => onFactSelect(key as CompanyFactKey) : undefined}
      />

      <div className="ml-auto flex items-center gap-2 shrink-0">
        <Button
          variant="secondary"
          size="sm"
          icon={<ArrowsClockwise className="w-3.5 h-3.5" />}
          disabled={!dirty || saving}
          onClick={onReset}
        >
          Reset
        </Button>
        <Button type="submit" size="sm" icon={<FloppyDisk className="w-3.5 h-3.5" />} loading={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </section>
  );
}
