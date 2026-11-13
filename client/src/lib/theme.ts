export type ThemeId =
  | 'default'
  | 'emerald'
  | 'violet'
  | 'amber'
  | 'rose'
  | 'teal'
  | 'slate'
  | 'crimson'
  | 'indigo'
  | 'nordic'
  | 'forest'
  | 'espresso';

export type SidebarStyle = 'default' | 'dark' | 'brand' | 'contrast';
export type NavbarStyle = 'default' | 'card' | 'brand' | 'dark';
export type FontFamily =
  | 'Plus Jakarta Sans'
  | 'Inter'
  | 'Outfit'
  | 'DM Sans'
  | 'Roboto'
  | 'Poppins'
  | 'Lexend'
  | 'System';

export type BorderRadius = 'sharp' | 'modern' | 'rounded' | 'pill';
export type FontSize = 'compact' | 'default' | 'large' | 'xlarge';

export interface ThemeConfig {
  themeId: ThemeId;
  sidebarStyle: SidebarStyle;
  navbarStyle: NavbarStyle;
  fontFamily: FontFamily;
  fontSize: FontSize;
  borderRadius: BorderRadius;
}

export interface ThemePreset {
  id: ThemeId;
  name: string;
  badge: string;
  primaryColor: string;
  accentColor: string;
  colors: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'default',
    name: 'Vendora Classic',
    badge: 'Default',
    primaryColor: '#0b5cd5',
    accentColor: '#3374f5',
    colors: {
      50: '#eef5ff',
      100: '#d9e8ff',
      200: '#bcd7ff',
      300: '#8ebdff',
      400: '#5998ff',
      500: '#3374f5',
      600: '#0b5cd5',
      700: '#0a4bb0',
      800: '#0e3f8f',
      900: '#123873',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald Luxe',
    badge: 'Grocery & Retail',
    primaryColor: '#059669',
    accentColor: '#10b981',
    colors: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    badge: 'Fashion & Tech',
    primaryColor: '#7c3aed',
    accentColor: '#8b5cf6',
    colors: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
  },
  {
    id: 'amber',
    name: 'Sunset Amber',
    badge: 'Bakery & Café',
    primaryColor: '#d97706',
    accentColor: '#f59e0b',
    colors: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
  },
  {
    id: 'rose',
    name: 'Rose Boutique',
    badge: 'Cosmetics & Lifestyle',
    primaryColor: '#e11d48',
    accentColor: '#f43f5e',
    colors: {
      50: '#fff1f2',
      100: '#ffe4e6',
      200: '#fecdd3',
      300: '#fda4af',
      400: '#fb7185',
      500: '#f43f5e',
      600: '#e11d48',
      700: '#be123c',
      800: '#9f1239',
      900: '#881337',
    },
  },
  {
    id: 'teal',
    name: 'Ocean Breeze',
    badge: 'Pharmacy & Health',
    primaryColor: '#0d9488',
    accentColor: '#14b8a6',
    colors: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
    },
  },
  {
    id: 'slate',
    name: 'Midnight Obsidian',
    badge: 'Minimalist & Electronics',
    primaryColor: '#334155',
    accentColor: '#64748b',
    colors: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  {
    id: 'crimson',
    name: 'Ruby Crimson',
    badge: 'Supermarket & Mart',
    primaryColor: '#dc2626',
    accentColor: '#ef4444',
    colors: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
  },
  {
    id: 'indigo',
    name: 'Electric Indigo',
    badge: 'Corporate Tech',
    primaryColor: '#4f46e5',
    accentColor: '#6366f1',
    colors: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
    },
  },
  {
    id: 'nordic',
    name: 'Nordic Frost',
    badge: 'Stationery & Books',
    primaryColor: '#0284c7',
    accentColor: '#0ea5e9',
    colors: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
  },
  {
    id: 'forest',
    name: 'Forest Pine',
    badge: 'Organic & Farm',
    primaryColor: '#15803d',
    accentColor: '#16a34a',
    colors: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
  },
  {
    id: 'espresso',
    name: 'Warm Espresso',
    badge: 'Artisan & Coffee',
    primaryColor: '#78350f',
    accentColor: '#a16207',
    colors: {
      50: '#fafaf9',
      100: '#f5f5f4',
      200: '#e7e5e4',
      300: '#d6d3d1',
      400: '#a8a29e',
      500: '#78716c',
      600: '#57534e',
      700: '#44403c',
      800: '#292524',
      900: '#1c1917',
    },
  },
];

export const FONT_OPTIONS: { id: FontFamily; label: string; stack: string; sample: string }[] = [
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', stack: "'Plus Jakarta Sans', 'Inter', sans-serif", sample: 'Modern, crisp POS interface' },
  { id: 'Inter', label: 'Inter', stack: "'Inter', sans-serif", sample: 'Ultra-clean universal UI design' },
  { id: 'Outfit', label: 'Outfit', stack: "'Outfit', sans-serif", sample: 'Geometric & premium aesthetic' },
  { id: 'DM Sans', label: 'DM Sans', stack: "'DM Sans', sans-serif", sample: 'Friendly, warm and approachable' },
  { id: 'Roboto', label: 'Roboto', stack: "'Roboto', sans-serif", sample: 'Classic structured utilitarian' },
  { id: 'Poppins', label: 'Poppins', stack: "'Poppins', sans-serif", sample: 'Bold and playful headlines' },
  { id: 'Lexend', label: 'Lexend', stack: "'Lexend', sans-serif", sample: 'High readability for fast cashiering' },
  { id: 'System', label: 'System Native', stack: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", sample: 'Matches host operating system' },
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
    // Local storage unavailable
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

  // 4. Set data-theme attributes for styled shells
  root.setAttribute('data-theme-id', config.themeId);
  root.setAttribute('data-sidebar-style', config.sidebarStyle);
  root.setAttribute('data-navbar-style', config.navbarStyle);
}

