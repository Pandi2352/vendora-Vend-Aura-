import { useState } from 'react';
import { Check, Sparkle, Shuffle } from '@phosphor-icons/react';
import { THEME_PRESETS, type ThemeId, type ThemeCategory } from '../../../lib/theme';
import { cn } from '../../../components/ui/cn';

interface ThemePresetSelectorProps {
  selectedThemeId: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
  onShuffle?: () => void;
}

const CATEGORIES: { id: ThemeCategory; label: string }[] = [
  { id: 'all', label: 'All Themes' },
  { id: 'retail', label: 'Retail & Mart' },
  { id: 'tech', label: 'Tech & Fashion' },
  { id: 'nature', label: 'Nature & Wellness' },
  { id: 'luxury', label: 'Luxury & Executive' },
];

export function ThemePresetSelector({ selectedThemeId, onSelectTheme, onShuffle }: ThemePresetSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<ThemeCategory>('all');

  const filteredPresets = THEME_PRESETS.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  return (
    <div className="space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkle className="w-4 h-4 text-primary-600" />
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
            Color Themes ({THEME_PRESETS.length} Curated Styles)
          </p>
        </div>

        {onShuffle && (
          <button
            type="button"
            onClick={onShuffle}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-primary-700 bg-primary-50 rounded-md border border-primary-200 hover:bg-primary-100 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Surprise Me</span>
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
        {CATEGORIES.map((cat) => {
          const isSelected = cat.id === activeCategory;
          const count = cat.id === 'all' ? THEME_PRESETS.length : THEME_PRESETS.filter((p) => p.category === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-full transition-all shrink-0 cursor-pointer border',
                isSelected
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200',
              )}
            >
              <span>{cat.label}</span>
              <span className="ml-1.5 opacity-70 text-[0.625rem]">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Theme Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredPresets.map((preset) => {
          const isSelected = preset.id === selectedThemeId;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectTheme(preset.id)}
              className={cn(
                'relative text-left p-3.5 rounded-xl border transition-all cursor-pointer bg-white group',
                'hover:border-zinc-400 hover:shadow-xs',
                isSelected
                  ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-sm bg-primary-50/20'
                  : 'border-zinc-200',
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-zinc-900 group-hover:text-primary-700 transition-colors">
                      {preset.name}
                    </span>
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
                  className="w-5 h-5 rounded-full border border-black/10 shadow-xs transition-transform group-hover:scale-110"
                  style={{ backgroundColor: preset.primaryColor }}
                  aria-hidden="true"
                />
              </div>

              {/* 5-step Color Swatch strip */}
              <div className="flex items-center gap-1.5 h-3.5 w-full rounded-md p-0.5 bg-zinc-100">
                <span className="flex-1 h-full rounded-xs" style={{ backgroundColor: preset.colors[50] }} title={`50: ${preset.colors[50]}`} />
                <span className="flex-1 h-full rounded-xs" style={{ backgroundColor: preset.colors[200] }} title={`200: ${preset.colors[200]}`} />
                <span className="flex-1 h-full rounded-xs" style={{ backgroundColor: preset.colors[400] }} title={`400: ${preset.colors[400]}`} />
                <span className="flex-1 h-full rounded-xs" style={{ backgroundColor: preset.colors[600] }} title={`600: ${preset.colors[600]}`} />
                <span className="flex-1 h-full rounded-xs" style={{ backgroundColor: preset.colors[800] }} title={`800: ${preset.colors[800]}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
