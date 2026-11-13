import { Palette, Sun, Moon, Sparkle, ArrowRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, OptionTile, Toggle } from '../../components/ui';
import { usePreferences } from '../../hooks/usePreferences';
import { CUSTOM_SCALE_RANGE, UI_SIZE_OPTIONS, type ThemeMode } from '../../lib/preferences';
import { ROUTES } from '../../config/routes';

const THEMES: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun /> },
  { value: 'dark', label: 'Dark', icon: <Moon /> },
];

const SectionLabel = ({ children }: { children: string }) => (
  <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-zinc-500 mb-2">{children}</p>
);

export function AppearanceCard() {
  const prefs = usePreferences();

  return (
    <Card>
      <CardHeader icon={<Palette />} title="Appearance" />

      <SectionLabel>Theme</SectionLabel>
      <div className="flex gap-2 mb-3">
        {THEMES.map((t) => (
          <OptionTile
            key={t.value}
            title={t.label}
            icon={t.icon}
            selected={prefs.theme === t.value}
            onSelect={() => prefs.update({ theme: t.value })}
          />
        ))}
      </div>

      <Link
        to={`${ROUTES.SETTINGS}?tab=appearance`}
        className="flex items-center justify-between p-3 mb-5 rounded-lg border border-primary-200 bg-primary-50/70 text-primary-900 text-xs font-semibold hover:bg-primary-100/70 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkle className="w-4 h-4 text-primary-600" />
          <span>Customize Brand Colors, Fonts & Navigation Bar</span>
        </div>
        <div className="flex items-center gap-1 text-primary-700 font-bold">
          <span>Theme Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </Link>

      <SectionLabel>UI size</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {UI_SIZE_OPTIONS.map((size) => (
          <OptionTile
            key={size.value}
            title={size.label}
            subtitle={`${size.value === 'custom' ? prefs.customScale : size.scale}%`}
            selected={prefs.uiSize === size.value}
            onSelect={() => prefs.update({ uiSize: size.value })}
          />
        ))}
      </div>

      {prefs.uiSize === 'custom' && (
        <div className="mt-3 flex items-center gap-3">
          <input
            type="range"
            aria-label="Custom UI size"
            min={CUSTOM_SCALE_RANGE.min}
            max={CUSTOM_SCALE_RANGE.max}
            step={CUSTOM_SCALE_RANGE.step}
            value={prefs.customScale}
            onChange={(e) => prefs.update({ customScale: Number(e.target.value) })}
            className="flex-1 accent-primary-600"
          />
          <span className="text-sm font-bold text-zinc-900 w-14 text-right">{prefs.customScale}%</span>
        </div>
      )}

      <p className="text-xs text-zinc-500 mt-3 mb-5">Applies everywhere, including the POS. Saved on this device.</p>

      <Toggle
        label="Kiosk mode"
        description="Warn before closing or reloading the till. Full screen is the button in the top bar or F11."
        checked={prefs.kioskMode}
        onChange={(kioskMode) => prefs.update({ kioskMode })}
      />
    </Card>
  );
}
