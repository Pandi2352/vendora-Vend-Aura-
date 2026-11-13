import { Eye, ShoppingCart, CheckCircle, Tag } from '@phosphor-icons/react';
import {
  THEME_PRESETS,
  FONT_OPTIONS,
  RADIUS_OPTIONS,
  type ThemeConfig,
} from '../../../lib/theme';
import { cn } from '../../../components/ui/cn';

interface LiveThemePreviewCardProps {
  config: ThemeConfig;
  businessName?: string;
}

export function LiveThemePreviewCard({ config, businessName = 'Vendora Retail' }: LiveThemePreviewCardProps) {
  const preset = THEME_PRESETS.find((p) => p.id === config.themeId) ?? THEME_PRESETS[0];
  const fontMeta = FONT_OPTIONS.find((f) => f.id === config.fontFamily) ?? FONT_OPTIONS[0];
  const radiusMeta = RADIUS_OPTIONS.find((r) => r.id === config.borderRadius) ?? RADIUS_OPTIONS[1];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
            Live Retail Interface Preview
          </span>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
          {preset.name} · {fontMeta.label}
        </span>
      </div>

      {/* Simulated App Frame */}
      <div
        className="rounded-lg border border-zinc-300 overflow-hidden shadow-inner text-xs transition-all duration-200"
        style={{
          fontFamily: fontMeta.stack,
          borderRadius: radiusMeta.value,
        }}
      >
        {/* Simulated Topbar */}
        <div
          className={cn(
            'h-10 px-3 flex items-center justify-between border-b transition-colors',
            config.navbarStyle === 'dark' && 'bg-zinc-950 border-zinc-800 text-white',
            config.navbarStyle === 'brand' && 'bg-primary-600 border-primary-700 text-white',
            config.navbarStyle === 'card' && 'bg-white border-zinc-200 text-zinc-900',
            config.navbarStyle === 'default' && 'bg-zinc-100 border-zinc-200 text-zinc-900',
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-5 h-5 rounded-md flex items-center justify-center text-[0.625rem] font-black text-white"
              style={{ backgroundColor: preset.primaryColor }}
            >
              V
            </span>
            <span className="font-bold truncate max-w-[10rem]">{businessName}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[0.625rem] font-bold bg-white/20 border border-current">
              OUT-01
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Simulated Body: Sidebar + Main Stage */}
        <div className="flex h-44 bg-zinc-50">
          {/* Simulated Sidebar */}
          <div
            className={cn(
              'w-28 sm:w-36 p-1.5 border-r flex flex-col gap-1 transition-colors shrink-0',
              config.sidebarStyle === 'dark' && 'bg-zinc-950 border-zinc-800 text-zinc-300',
              config.sidebarStyle === 'brand' && 'bg-primary-50/80 border-primary-200/60 text-primary-950',
              config.sidebarStyle === 'contrast' && 'bg-white border-zinc-200 text-zinc-800',
              config.sidebarStyle === 'default' && 'bg-zinc-100 border-zinc-200 text-zinc-700',
            )}
          >
            <div
              className={cn(
                'px-2 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-colors',
                config.sidebarStyle === 'dark' || config.sidebarStyle === 'brand'
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-50 text-primary-700',
              )}
              style={{ borderRadius: radiusMeta.value }}
            >
              <ShoppingCart className="w-3 h-3 shrink-0" />
              <span className="truncate">POS Billing</span>
            </div>
            <div className="px-2 py-1 rounded-md opacity-75 truncate">Inventory</div>
            <div className="px-2 py-1 rounded-md opacity-75 truncate">Customers</div>
            <div className="px-2 py-1 rounded-md opacity-75 truncate">Reports</div>
          </div>

          {/* Simulated Content Area */}
          <div className="flex-1 p-2.5 space-y-2 overflow-hidden flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-900 text-xs">Invoice #INV-2026-089</span>
                <span className="px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 font-bold text-[0.625rem]">
                  PAID
                </span>
              </div>

              {/* Sample Cart / Bill Line */}
              <div className="p-1.5 rounded-md border border-zinc-200 bg-white flex items-center justify-between">
                <div>
                  <div className="font-semibold text-zinc-900">Organic Basmati Rice (1kg)</div>
                  <div className="text-[0.625rem] text-zinc-500">HSN 1006 · 5% GST</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-zinc-900">₹149.00</div>
                  <div className="text-[0.625rem] text-zinc-500">Qty: 1</div>
                </div>
              </div>
            </div>

            {/* Buttons & Chips */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-200">
              <button
                type="button"
                className="px-2.5 py-1 text-white font-bold transition-all shadow-xs flex items-center gap-1"
                style={{
                  backgroundColor: preset.primaryColor,
                  borderRadius: radiusMeta.value,
                }}
              >
                <CheckCircle className="w-3 h-3" />
                <span>Collect Cash</span>
              </button>

              <span
                className="px-2 py-1 text-primary-700 bg-primary-50 font-bold border border-primary-200 flex items-center gap-1"
                style={{ borderRadius: radiusMeta.value }}
              >
                <Tag className="w-3 h-3" />
                <span>Promo APPLIED</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

