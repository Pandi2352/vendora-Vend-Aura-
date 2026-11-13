import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Palette, Check, ArrowRight, Sparkle } from '@phosphor-icons/react';
import { useTheme } from '../../hooks/useTheme';
import {
  THEME_PRESETS,
  SIDEBAR_STYLES,
  NAVBAR_STYLES,
  type ThemeId,
  type SidebarStyle,
  type NavbarStyle,
} from '../../lib/theme';
import { ROUTES } from '../../config/routes';
import { cn } from '../ui/cn';

export function ThemeSwitcherDropdown() {
  const { config, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activePreset = THEME_PRESETS.find((p) => p.id === config.themeId) ?? THEME_PRESETS[0];

  // Close on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleDown = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key === 'Escape') {
        setIsOpen(false);
      } else if (e instanceof MouseEvent && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('keydown', handleDown);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('keydown', handleDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Theme options"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'relative inline-flex items-center justify-center gap-1.5 h-9 px-2.5 rounded-md text-sm font-semibold transition-colors cursor-pointer',
          'border border-shell-border bg-shell-raised text-shell-text hover:bg-shell-hover hover:border-zinc-300',
          isOpen && 'ring-2 ring-primary-500/20 border-primary-500',
        )}
      >
        <span
          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs border border-white/40"
          style={{ backgroundColor: activePreset.primaryColor }}
          aria-hidden="true"
        />
        <Palette className="w-4 h-4 text-shell-muted" />
        <span className="hidden xl:inline text-xs truncate max-w-[5.5rem]">{activePreset.name}</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Theme switcher"
          className="absolute right-0 mt-2 w-80 sm:w-96 p-3 rounded-xl border border-shell-border bg-shell-raised shadow-xl z-50 animate-flyout-in focus:outline-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-shell-border">
            <div className="flex items-center gap-2">
              <Sparkle className="w-4 h-4 text-primary-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-shell-text">Theme & Appearance</span>
            </div>
            <span
              className="text-[0.6875rem] font-semibold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: activePreset.primaryColor }}
            >
              {activePreset.name}
            </span>
          </div>

          {/* Color Themes Grid */}
          <div className="mb-3">
            <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Color Palette ({THEME_PRESETS.length} Themes)</p>
            <div className="grid grid-cols-3 gap-1.5 max-h-52 overflow-y-auto pr-0.5">
              {THEME_PRESETS.map((preset) => {
                const isSelected = preset.id === config.themeId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setTheme({ themeId: preset.id as ThemeId })}
                    className={cn(
                      'flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all cursor-pointer',
                      isSelected
                        ? 'border-primary-500 bg-primary-50/50 shadow-xs ring-1 ring-primary-500'
                        : 'border-shell-border hover:border-zinc-300 hover:bg-shell-hover',
                    )}
                  >
                    <span
                      className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: preset.primaryColor }}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" weight="bold" />}
                    </span>
                    <span className="text-xs font-medium text-shell-text truncate">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Sidebar & Navbar style toggles */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-shell-border mb-3">
            <div>
              <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-zinc-500 mb-1">Sidebar Style</p>
              <select
                value={config.sidebarStyle}
                onChange={(e) => setTheme({ sidebarStyle: e.target.value as SidebarStyle })}
                aria-label="Sidebar style"
                className="w-full text-xs font-medium py-1 px-1.5 rounded-md border border-shell-border bg-shell text-shell-text focus:outline-primary-500"
              >
                {SIDEBAR_STYLES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-zinc-500 mb-1">Navbar Style</p>
              <select
                value={config.navbarStyle}
                onChange={(e) => setTheme({ navbarStyle: e.target.value as NavbarStyle })}
                aria-label="Navbar style"
                className="w-full text-xs font-medium py-1 px-1.5 rounded-md border border-shell-border bg-shell text-shell-text focus:outline-primary-500"
              >
                {NAVBAR_STYLES.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Link to full Theme Studio in Settings */}
          <Link
            to={`${ROUTES.SETTINGS}?tab=appearance`}
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between w-full py-1.5 px-2.5 rounded-lg bg-primary-50 text-primary-700 text-xs font-bold hover:bg-primary-100 transition-colors"
          >
            <span>Fonts, Radius & Full Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
