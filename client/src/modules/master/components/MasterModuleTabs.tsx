import { cn } from '@/components/ui/cn';
import { RailTabs, SegmentedTabs } from '@/components/ui/tab-nav';
import { MACRO_TABS, MASTER_SECTION_ID, SUB_TABS, type MasterMacro } from '../config/masterTabs';

interface MasterModuleTabsProps {
  macro: MasterMacro;
  onMacroChange: (macro: MasterMacro) => void;
  subTab: string;
  onSubTabChange: (subTabId: string) => void;
  className?: string;
}

/**
 * Master navigation in two clearly different levels: the main areas
 * (General / Operations) as two-line tabs on a light band, and the open
 * area's sections as a smaller underlined row below.
 */
export function MasterModuleTabs({ macro, onMacroChange, subTab, onSubTabChange, className }: MasterModuleTabsProps) {
  const areas = MACRO_TABS.map((tab) => ({ ...tab, description: `${SUB_TABS[tab.value].length} sections` }));

  return (
    <div className={cn('w-full bg-white border border-zinc-200 rounded-md overflow-hidden select-none', className)}>
      <div className="px-2 py-2 bg-zinc-50 border-b border-zinc-200 overflow-x-auto scrollbar-none">
        <SegmentedTabs
          label="Master area"
          idPrefix="master-area"
          items={areas}
          value={macro}
          onChange={(next) => next !== macro && onMacroChange(next)}
        />
      </div>
      <RailTabs
        size="sm"
        className="px-2"
        label={`${macro === 'general' ? 'General' : 'Operations'} sections`}
        idPrefix={MASTER_SECTION_ID}
        items={SUB_TABS[macro]}
        value={subTab}
        onChange={onSubTabChange}
      />
    </div>
  );
}
