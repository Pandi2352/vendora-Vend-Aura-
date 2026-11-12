import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { MsIcon } from '@/components/ui/MsIcon';
import type { CompanySection } from '../config/sections';

interface SectionPanelHeaderProps {
  section: CompanySection;
  previous?: CompanySection;
  next?: CompanySection;
  onGo: (section: CompanySection) => void;
}

/** Title of the open section with previous / next section buttons. */
export function SectionPanelHeader({ section, previous, next, onGo }: SectionPanelHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-zinc-100">
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-9 h-9 rounded-md bg-primary-50 border border-primary-200 text-primary-600 inline-flex items-center justify-center shrink-0">
          <MsIcon name={section.icon} className="text-[1.25rem] ms-fill" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-zinc-900">{section.label}</h3>
          <p className="text-xs text-zinc-500">{section.subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {previous && (
          <Button
            variant="secondary"
            size="sm"
            icon={<CaretLeft className="w-3.5 h-3.5" />}
            onClick={() => onGo(previous)}
          >
            {previous.label}
          </Button>
        )}
        {next && (
          <Button variant="secondary" size="sm" onClick={() => onGo(next)}>
            {next.label}
            <CaretRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
