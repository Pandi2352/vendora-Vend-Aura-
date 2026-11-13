import { Check } from '@phosphor-icons/react';
import {
  SIDEBAR_STYLES,
  NAVBAR_STYLES,
  SURFACE_STYLES,
  type SidebarStyle,
  type NavbarStyle,
  type SurfaceStyle,
} from '../../../lib/theme';
import { Toggle } from '../../../components/ui';
import { cn } from '../../../components/ui/cn';

interface ShellStylingCardProps {
  sidebarStyle: SidebarStyle;
  navbarStyle: NavbarStyle;
  surfaceStyle?: SurfaceStyle;
  tableStriping?: boolean;
  onChangeSidebar: (style: SidebarStyle) => void;
  onChangeNavbar: (style: NavbarStyle) => void;
  onChangeSurface?: (style: SurfaceStyle) => void;
  onChangeStriping?: (striping: boolean) => void;
}

export function ShellStylingCard({
  sidebarStyle,
  navbarStyle,
  surfaceStyle = 'flat',
  tableStriping = false,
  onChangeSidebar,
  onChangeNavbar,
  onChangeSurface,
  onChangeStriping,
}: ShellStylingCardProps) {
  return (
    <div className="space-y-5">
      {/* Sidebar Style Selection */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">
          Sidebar Styling
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SIDEBAR_STYLES.map((style) => {
            const isSelected = style.id === sidebarStyle;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => onChangeSidebar(style.id)}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer bg-white',
                  isSelected
                    ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-xs bg-primary-50/15'
                    : 'border-zinc-200 hover:border-zinc-300',
                )}
              >
                <div
                  className={cn(
                    'w-7 h-11 rounded-md border shrink-0 flex flex-col justify-between p-1',
                    style.id === 'dark' && 'bg-zinc-950 border-zinc-800',
                    style.id === 'brand' && 'bg-primary-600 border-primary-700',
                    style.id === 'contrast' && 'bg-white border-zinc-300',
                    style.id === 'default' && 'bg-zinc-200 border-zinc-300',
                  )}
                >
                  <span className="w-full h-1 rounded-xs bg-white/40" />
                  <span className="w-full h-1 rounded-xs bg-white/40" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-900">{style.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-primary-600 shrink-0" weight="bold" />}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{style.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navbar Style Selection */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">
          Navbar / Topbar Styling
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {NAVBAR_STYLES.map((style) => {
            const isSelected = style.id === navbarStyle;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => onChangeNavbar(style.id)}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer bg-white',
                  isSelected
                    ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-xs bg-primary-50/15'
                    : 'border-zinc-200 hover:border-zinc-300',
                )}
              >
                <div
                  className={cn(
                    'w-11 h-7 rounded-md border shrink-0 flex items-center justify-between px-1',
                    style.id === 'dark' && 'bg-zinc-950 border-zinc-800',
                    style.id === 'brand' && 'bg-primary-600 border-primary-700',
                    style.id === 'card' && 'bg-white border-zinc-300',
                    style.id === 'default' && 'bg-zinc-200 border-zinc-300',
                  )}
                >
                  <span className="w-2 h-2 rounded-full bg-white/50" />
                  <span className="w-4 h-1 rounded-xs bg-white/50" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-900">{style.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-primary-600 shrink-0" weight="bold" />}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{style.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Surface Texture & Elevation */}
      {onChangeSurface && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">
            Surface Elevation & Texture
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {SURFACE_STYLES.map((surf) => {
              const isSelected = surf.id === surfaceStyle;
              return (
                <button
                  key={surf.id}
                  type="button"
                  onClick={() => onChangeSurface(surf.id)}
                  className={cn(
                    'p-3 rounded-xl border text-left transition-all cursor-pointer bg-white',
                    isSelected
                      ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-xs bg-primary-50/15'
                      : 'border-zinc-200 hover:border-zinc-300',
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-zinc-900">{surf.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary-600" weight="bold" />}
                  </div>
                  <p className="text-xs text-zinc-500">{surf.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Table Striping Toggle */}
      {onChangeStriping && (
        <div className="pt-2">
          <Toggle
            label="Zebra Striped Tables"
            description="Adds alternating tinted rows to sales registers, inventory ledgers, and audit tables for faster eye scanning."
            checked={tableStriping}
            onChange={onChangeStriping}
          />
        </div>
      )}
    </div>
  );
}
