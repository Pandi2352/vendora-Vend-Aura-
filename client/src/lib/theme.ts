import { THEME_PRESETS, type ThemePreset, type ThemeId, type ThemeCategory } from './themePresets';

export { THEME_PRESETS };
export type { ThemePreset, ThemeId, ThemeCategory };

export type SidebarStyle = 'default' | 'dark' | 'brand' | 'contrast';
export type NavbarStyle = 'default' | 'card' | 'brand' | 'dark';
export type SurfaceStyle = 'flat' | 'glass' | 'bordered';
export type AccentIntensity = 'subtle' | 'vibrant' | 'punchy';

export type FontFamily =
  | 'Plus Jakarta Sans'
  | 'Inter'
  | 'Outfit'
  | 'DM Sans'
  | 'Roboto'
  | 'Poppins'
  | 'Lexend'
  | 'Manrope'
  | 'Space Grotesk'
  | 'Urbanist'
  | 'Sora'
  | 'System';

export type BorderRadius = 'sharp' | 'modern' | 'rounded' | 'pill';
export type FontSize = 'compact' | 'default' | 'large' | 'xlarge';

export interface ThemeConfig {
  themeId: ThemeId;
  sidebarStyle: SidebarStyle;
  navbarStyle: NavbarStyle;
  surfaceStyle: SurfaceStyle;
  accentIntensity: AccentIntensity;
  tableStriping: boolean;
  fontFamily: FontFamily;
  fontSize: FontSize;
  borderRadius: BorderRadius;
}

export const FONT_OPTIONS: { id: FontFamily; label: string; stack: string; sample: string; tag: string }[] = [
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', stack: "'Plus Jakarta Sans', 'Inter', sans-serif", sample: 'Modern, crisp POS interface', tag: 'Default' },
  { id: 'Inter', label: 'Inter', stack: "'Inter', sans-serif", sample: 'Ultra-clean universal UI design', tag: 'Standard' },
  { id: 'Outfit', label: 'Outfit', stack: "'Outfit', sans-serif", sample: 'Geometric & premium aesthetic', tag: 'Modern' },
  { id: 'DM Sans', label: 'DM Sans', stack: "'DM Sans', sans-serif", sample: 'Friendly, warm and approachable', tag: 'Warm' },
  { id: 'Roboto', label: 'Roboto', stack: "'Roboto', sans-serif", sample: 'Classic structured utilitarian', tag: 'Classic' },
  { id: 'Poppins', label: 'Poppins', stack: "'Poppins', sans-serif", sample: 'Bold and playful headlines', tag: 'Bold' },
  { id: 'Lexend', label: 'Lexend', stack: "'Lexend', sans-serif", sample: 'High readability for fast cashiering', tag: 'Retail' },
  { id: 'Manrope', label: 'Manrope', stack: "'Manrope', sans-serif", sample: 'Semi-geometric with crisp numerals', tag: 'Finance' },
  { id: 'Space Grotesk', label: 'Space Grotesk', stack: "'Space Grotesk', sans-serif", sample: 'Streetwear, gaming & techno look', tag: 'Trendy' },
  { id: 'Urbanist', label: 'Urbanist', stack: "'Urbanist', sans-serif", sample: 'Contemporary digital boutique vibe', tag: 'Luxury' },
  { id: 'Sora', label: 'Sora', stack: "'Sora', sans-serif", sample: 'High-contrast precision letterforms', tag: 'Japanese' },
  { id: 'System', label: 'System Native', stack: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", sample: 'Matches host operating system', tag: 'OS' },
];

export const SIDEBAR_STYLES: { id: SidebarStyle; label: string; desc: string }[] = [
  { id: 'default', label: 'Default Shell', desc: 'Soft warm grey matching the app standard' },
  { id: 'dark', label: 'Dark Obsidian', desc: 'High-contrast dark navy sidebar with glowing active pills' },
  { id: 'brand', label: 'Brand Tinted', desc: 'Soft pastel background matched to the active theme' },
  { id: 'contrast', label: 'Crisp White', desc: 'Pure white surface with structured borders' },
];

export const NAVBAR_STYLES: { id: NavbarStyle; label: string; desc: string }[] = [
  { id: 'default', label: 'Default Shell', desc: 'Seamless header matching the app background' },
  { id: 'card', label: 'Card White', desc: 'Raised clean white header with subtle shadow' },
  { id: 'brand', label: 'Brand Accent', desc: 'Bold saturated primary header with white icons' },
  { id: 'dark', label: 'Dark Slate', desc: 'Executive midnight slate header' },
];

export const SURFACE_STYLES: { id: SurfaceStyle; label: string; desc: string }[] = [
  { id: 'flat', label: 'Modern Flat', desc: 'Solid, clean, high-performance retail surfaces' },
  { id: 'glass', label: 'Glassmorphism', desc: 'Translucent frosted glass with subtle backdrop blur' },
  { id: 'bordered', label: 'Neo-Bordered', desc: 'High-contrast structured borders for bright counter displays' },
];

export const RADIUS_OPTIONS: { id: BorderRadius; label: string; value: string }[] = [
  { id: 'sharp', label: 'Sharp', value: '0.125rem' },
  { id: 'modern', label: 'Modern (Default)', value: '0.375rem' },
  { id: 'rounded', label: 'Rounded', value: '0.75rem' },
  { id: 'pill', label: 'Pill Curve', value: '1.25rem' },
];

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  themeId: 'default',
  sidebarStyle: 'default',
  navbarStyle: 'default',
  surfaceStyle: 'flat',
  accentIntensity: 'vibrant',
  tableStriping: false,
  fontFamily: 'Plus Jakarta Sans',
  fontSize: 'default',
  borderRadius: 'modern',
};

const THEME_STORAGE_KEY = 'vendora_theme_config';

export function loadLocalTheme(): ThemeConfig {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return DEFAULT_THEME_CONFIG;
    return { ...DEFAULT_THEME_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_THEME_CONFIG;
  }
}

export function saveLocalTheme(config: ThemeConfig) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Storage unavailable
  }
}

export function applyThemeToDom(config: ThemeConfig) {
  const root = document.documentElement;
  const preset = THEME_PRESETS.find((p) => p.id === config.themeId) ?? THEME_PRESETS[0];

  // 1. Inject primary 50-900 color scale into CSS custom properties
  Object.entries(preset.colors).forEach(([shade, hex]) => {
    root.style.setProperty(`--color-primary-${shade}`, hex);
  });

  // 2. Set root typography font stack
  const fontMeta = FONT_OPTIONS.find((f) => f.id === config.fontFamily) ?? FONT_OPTIONS[0];
  root.style.setProperty('--font-sans', fontMeta.stack);
  document.body.style.fontFamily = fontMeta.stack;

  // 3. Set border radius
  const radiusMeta = RADIUS_OPTIONS.find((r) => r.id === config.borderRadius) ?? RADIUS_OPTIONS[1];
  root.style.setProperty('--app-radius', radiusMeta.value);

  // 4. Set data attributes for shell styling
  root.setAttribute('data-theme-id', config.themeId);
  root.setAttribute('data-sidebar-style', config.sidebarStyle);
  root.setAttribute('data-navbar-style', config.navbarStyle);
  root.setAttribute('data-surface-style', config.surfaceStyle || 'flat');
  root.setAttribute('data-table-striping', String(config.tableStriping));
}
