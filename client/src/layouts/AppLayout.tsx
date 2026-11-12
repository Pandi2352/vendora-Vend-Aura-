import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Topbar } from '../components/layout/Topbar';
import { Sidebar } from '../components/layout/Sidebar';
import { AppCommandPalette } from '../components/layout/AppCommandPalette';
import { useCommandPaletteHotkey } from '../components/ui/command/useCommandPaletteHotkey';
import { PosModalsHost } from '../components/pos/PosModalsHost';
import { PosSessionProvider } from '../app/providers/PosSessionProvider';
import { usePreferences } from '../hooks/usePreferences';
import { useKioskGuard } from '../hooks/useKioskGuard';

/** Signed-in shell: top bar, sidebar, page outlet, command palette (Ctrl+K) and the shared POS modals. */
export function AppLayout() {
  const { sidebarCollapsed } = usePreferences();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  useCommandPaletteHotkey(setPaletteOpen);
  useKioskGuard();

  return (
    <PosSessionProvider>
      <div className="h-screen flex flex-col bg-zinc-50 overflow-hidden">
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} onOpenSearch={() => setPaletteOpen(true)} />
        <div className="flex-1 flex min-h-0">
          <Sidebar
            collapsed={sidebarCollapsed}
            mobileOpen={mobileNavOpen}
            onCloseMobile={() => setMobileNavOpen(false)}
          />
          <main className="flex-1 min-w-0 overflow-y-auto scroll-stable">
            <Outlet />
          </main>
        </div>
      </div>
      <PosModalsHost />
      <AppCommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </PosSessionProvider>
  );
}
