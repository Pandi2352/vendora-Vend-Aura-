import { Check } from '@phosphor-icons/react';
import {
  FONT_OPTIONS,
  RADIUS_OPTIONS,
  type FontFamily,
  type BorderRadius,
} from '../../../lib/theme';
import { cn } from '../../../components/ui/cn';

interface TypographyStylingCardProps {
  fontFamily: FontFamily;
  borderRadius: BorderRadius;
  onChangeFont: (font: FontFamily) => void;
  onChangeRadius: (radius: BorderRadius) => void;
}

export function TypographyStylingCard({
  fontFamily,
  borderRadius,
  onChangeFont,
  onChangeRadius,
}: TypographyStylingCardProps) {
  return (
    <div className="space-y-5">
      {/* Font Family Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
            Font Family & Retail Typography ({FONT_OPTIONS.length} Styles)
          </p>
          <span className="text-xs text-zinc-500">Rendered with real typography preview</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {FONT_OPTIONS.map((font) => {
            const isSelected = font.id === fontFamily;
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => onChangeFont(font.id)}
                className={cn(
                  'flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer bg-white group',
                  isSelected
                    ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-xs bg-primary-50/15'
                    : 'border-zinc-200 hover:border-zinc-300',
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-zinc-900 group-hover:text-primary-700 transition-colors">
                    {font.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[0.625rem] font-bold px-1.5 py-0.5 rounded-sm bg-zinc-100 text-zinc-600">
                      {font.tag}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary-600 shrink-0" weight="bold" />}
                  </div>
                </div>
                <p
                  className="text-xs text-zinc-600 font-medium line-clamp-1"
                  style={{ fontFamily: font.stack }}
                >
                  {font.sample}
                </p>
                <span className="text-[0.6875rem] text-zinc-500 mt-1.5 font-mono">
                  Invoice #089 · ₹499.00
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Border Radius Selection */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">
          Corner Radius & Geometry
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {RADIUS_OPTIONS.map((rad) => {
            const isSelected = rad.id === borderRadius;
            return (
              <button
                key={rad.id}
                type="button"
                onClick={() => onChangeRadius(rad.id)}
                className={cn(
                  'flex flex-col items-center justify-center p-3 border text-center transition-all cursor-pointer bg-white',
                  isSelected
                    ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-xs bg-primary-50/15'
                    : 'border-zinc-200 hover:border-zinc-300',
                )}
                style={{ borderRadius: rad.value }}
              >
                <div
                  className="w-10 h-7 border-2 border-primary-500/60 bg-primary-50/40 mb-1.5"
                  style={{ borderRadius: rad.value }}
                />
                <span className="text-xs font-bold text-zinc-900">{rad.label}</span>
                <span className="text-[0.625rem] text-zinc-500">{rad.value}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
