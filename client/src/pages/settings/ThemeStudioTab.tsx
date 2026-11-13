import { useState } from 'react';
import { Palette, FloppyDisk, ArrowCounterClockwise } from '@phosphor-icons/react';
import { Card, CardHeader, Alert, Button } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { ThemePresetSelector } from './theme/ThemePresetSelector';
import { ShellStylingCard } from './theme/ShellStylingCard';
import { TypographyStylingCard } from './theme/TypographyStylingCard';
import { LiveThemePreviewCard } from './theme/LiveThemePreviewCard';

export function ThemeStudioTab() {
  const { user } = useAuth();
  const { config, setTheme, saveToBackend, resetTheme, isSaving, hasUnsavedChanges } = useTheme();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);
    const ok = await saveToBackend();
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } else {
      setSaveError('Failed to save theme settings to the database. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {saveSuccess && (
        <Alert tone="success">
          Theme & UI settings successfully saved to your store account! All cashiers and devices will now reflect your store branding.
        </Alert>
      )}

      {saveError && (
        <Alert tone="error">
          {saveError}
        </Alert>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200">
          <CardHeader
            icon={<Palette />}
            title="Theme & UI Customization Studio"
            description="Personalize your store POS and backoffice interface with custom themes, sidebar/navbar styling, and retail typography."
          />

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowCounterClockwise />}
              onClick={resetTheme}
              disabled={isSaving}
            >
              Reset Defaults
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={<FloppyDisk />}
              onClick={handleSave}
              loading={isSaving}
              disabled={isSaving}
            >
              {hasUnsavedChanges ? 'Save for Store' : 'Saved'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pt-4 items-start">
          {/* Main Controls Column */}
          <div className="xl:col-span-7 space-y-6">
            <ThemePresetSelector
              selectedThemeId={config.themeId}
              onSelectTheme={(themeId) => setTheme({ themeId })}
            />

            <div className="border-t border-zinc-200 pt-5">
              <ShellStylingCard
                sidebarStyle={config.sidebarStyle}
                navbarStyle={config.navbarStyle}
                onChangeSidebar={(sidebarStyle) => setTheme({ sidebarStyle })}
                onChangeNavbar={(navbarStyle) => setTheme({ navbarStyle })}
              />
            </div>

            <div className="border-t border-zinc-200 pt-5">
              <TypographyStylingCard
                fontFamily={config.fontFamily}
                borderRadius={config.borderRadius}
                onChangeFont={(fontFamily) => setTheme({ fontFamily })}
                onChangeRadius={(borderRadius) => setTheme({ borderRadius })}
              />
            </div>
          </div>

          {/* Right Live Preview Column */}
          <div className="xl:col-span-5 space-y-4 sticky top-4">
            <LiveThemePreviewCard config={config} businessName={user?.businessName} />

            <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/60 text-xs text-zinc-600 space-y-1.5">
              <p className="font-bold text-zinc-900">How UI customization works:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Instant preview: Changes appear immediately in your browser.</li>
                <li>Store-wide persistence: Clicking <strong>Save for Store</strong> syncs your theme to MongoDB so all cashiers on this shop receive the same branding.</li>
                <li>Everyplace Switcher: You can also quickly toggle palettes anytime via the palette icon in the top navigation bar.</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
