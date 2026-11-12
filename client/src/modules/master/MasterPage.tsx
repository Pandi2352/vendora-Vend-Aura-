import { Link, useSearchParams } from 'react-router-dom';
import { CaretRight } from '@phosphor-icons/react';
import { ROUTES } from '@/config/routes';
import { tabId, tabPanelId } from '@/components/ui/tab-nav';
import { MasterModuleTabs } from './components/MasterModuleTabs';
import { MASTER_SECTION_ID, SUB_TABS, type MasterMacro } from './config/masterTabs';
import { MASTER_VIEWS } from './config/masterViews';
import { ComingSoonPanel } from './shared/ComingSoonPanel';

/**
 * Master data hub. The open area and section live in the URL
 * (?macro=general&tab=company) so they survive reloads and can be linked.
 */
export function MasterPage() {
  const [params, setParams] = useSearchParams();
  const macro: MasterMacro = params.get('macro') === 'operations' ? 'operations' : 'general';
  const sections = SUB_TABS[macro];
  const section = sections.find((item) => item.value === params.get('tab')) ?? sections[0];
  const View = MASTER_VIEWS[macro][section.value];

  const changeMacro = (next: MasterMacro) =>
    setParams({ macro: next, tab: SUB_TABS[next][0].value }, { replace: true });
  const changeSection = (tab: string) => setParams({ macro, tab }, { replace: true });

  return (
    <div className="w-full px-4 sm:px-6 lg:px-7 pt-4 sm:pt-5 pb-12 space-y-4 animate-fade-in">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium select-none">
        <Link to={ROUTES.DASHBOARD} className="hover:text-zinc-800 transition-colors">
          Home
        </Link>
        <CaretRight className="w-3 h-3 text-zinc-400" />
        <span>Master</span>
        <CaretRight className="w-3 h-3 text-zinc-400" />
        <span className="text-zinc-900 font-semibold">{section.label}</span>
      </nav>

      <MasterModuleTabs
        macro={macro}
        onMacroChange={changeMacro}
        subTab={section.value}
        onSubTabChange={changeSection}
      />

      <div
        role="tabpanel"
        id={tabPanelId(MASTER_SECTION_ID, section.value)}
        aria-labelledby={tabId(MASTER_SECTION_ID, section.value)}
      >
        {View ? <View /> : <ComingSoonPanel title={section.label} />}
      </div>
    </div>
  );
}
