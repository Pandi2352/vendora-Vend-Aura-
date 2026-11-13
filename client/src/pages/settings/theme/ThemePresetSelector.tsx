import { Check } from '@phosphor-icons/react';
import { THEME_PRESETS, type ThemeId } from '../../../lib/theme';
import { cn } from '../../../components/ui/cn';

interface ThemePresetSelectorProps {
  selectedThemeId: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
}

export function ThemePresetSelector({ selectedThemeId, onSelectTheme }: ThemePresetSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
          Color Themes ({THEME_PRESETS.length} Curated Styles)
        </p>
        <span className="text-xs text-zinc-500">Click any theme for instant live preview</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {THEME_PRESETS.map((preset) => {
          const isSelected = preset.id === selectedThemeId;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectTheme(preset.id)}
              className={cn(
                'relative text-left p-3.5 rounded-xl border transition-all cursor-pointer bg-white',
                'hover:border-zinc-400 hover:shadow-xs',
                isSelected
                  ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-sm bg-primary-50/20'
                  : 'border-zinc-200',
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-zinc-900">{preset.name}</span>
                    {isSelected && (
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary-600 text-white">
                        <Check className="w-2.5 h-2.5" weight="bold" />
                      </span>
                    )}
                  </div>
                  <span className="text-[0.6875rem] font-semibold text-zinc-500 uppercase tracking-wider">
                    {preset.badge}
                  </span>
                </div>

                <span
                  className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                  style={{ backgroundColor: preset.primaryColor }}
                  aria-hidden="true"
                />
              </div>

              {/* 5-step Color Swatch strip */}
              <div className="flex items-center gap-1.5 h-3.5 w-full rounded-md p-0.5 bg-zinc-100">
                <span className="flex-1 h-full rounded-xs" style={{ backgroundColor: preset.colors[50] }} />
                <span className="flex-1 h-full rounded-xs" style={{ backgroundColor: preset.colors[200] }} />
                <span className="flex-1 h-full rounded-xs" style={{ backgroundColor: preset.colors[400] }} />
                <span className="flex-1 h-full rounded-xs" style={{ backgroundColor: preset.colors[600] }} />
                <span className="flex-1 h-full rounded-xs" style={{ backgroundColor: preset.colors[800] }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

