export type ThemeCategory = 'all' | 'retail' | 'tech' | 'nature' | 'luxury';

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
  | 'espresso'
  | 'coral'
  | 'cyberpunk'
  | 'fuchsia'
  | 'mint'
  | 'olive'
  | 'sapphire';

export interface ThemePreset {
  id: ThemeId;
  name: string;
  badge: string;
  category: 'retail' | 'tech' | 'nature' | 'luxury';
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
  // 1. Retail & Supermarket
  {
    id: 'default',
    name: 'Vendora Classic',
    badge: 'Default POS',
    category: 'retail',
    primaryColor: '#0b5cd5',
    accentColor: '#3374f5',
    colors: {
      50: '#eef5ff', 100: '#d9e8ff', 200: '#bcd7ff', 300: '#8ebdff', 400: '#5998ff',
      500: '#3374f5', 600: '#0b5cd5', 700: '#0a4bb0', 800: '#0e3f8f', 900: '#123873',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald Luxe',
    badge: 'Supermarket & Mart',
    category: 'retail',
    primaryColor: '#059669',
    accentColor: '#10b981',
    colors: {
      50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
      500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b',
    },
  },
  {
    id: 'crimson',
    name: 'Ruby Crimson',
    badge: 'Hypermarket Red',
    category: 'retail',
    primaryColor: '#dc2626',
    accentColor: '#ef4444',
    colors: {
      50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171',
      500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d',
    },
  },
  {
    id: 'amber',
    name: 'Sunset Amber',
    badge: 'Bakery & Café',
    category: 'retail',
    primaryColor: '#d97706',
    accentColor: '#f59e0b',
    colors: {
      50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24',
      500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f',
    },
  },
  {
    id: 'coral',
    name: 'Coral Tropic',
    badge: 'Boutique & Surf',
    category: 'retail',
    primaryColor: '#ea580c',
    accentColor: '#f97316',
    colors: {
      50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c',
      500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12',
    },
  },

  // 2. Tech & Fashion
  {
    id: 'violet',
    name: 'Royal Violet',
    badge: 'Fashion & Tech',
    category: 'tech',
    primaryColor: '#7c3aed',
    accentColor: '#8b5cf6',
    colors: {
      50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa',
      500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95',
    },
  },
  {
    id: 'indigo',
    name: 'Electric Indigo',
    badge: 'Gadgets & Audio',
    category: 'tech',
    primaryColor: '#4f46e5',
    accentColor: '#6366f1',
    colors: {
      50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8',
      500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81',
    },
  },
  {
    id: 'cyberpunk',
    name: 'Neon Cyber',
    badge: 'Gaming & Kiosk',
    category: 'tech',
    primaryColor: '#06b6d4',
    accentColor: '#3b82f6',
    colors: {
      50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9', 400: '#22d3ee',
      500: '#06b6d4', 600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63',
    },
  },
  {
    id: 'fuchsia',
    name: 'Vibrant Fuchsia',
    badge: 'High Fashion',
    category: 'tech',
    primaryColor: '#c026d3',
    accentColor: '#d946ef',
    colors: {
      50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe', 300: '#f0abfc', 400: '#e879f9',
      500: '#d946ef', 600: '#c026d3', 700: '#a21caf', 800: '#86198f', 900: '#701a75',
    },
  },
  {
    id: 'rose',
    name: 'Rose Boutique',
    badge: 'Cosmetics & Beauty',
    category: 'tech',
    primaryColor: '#e11d48',
    accentColor: '#f43f5e',
    colors: {
      50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185',
      500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337',
    },
  },

  // 3. Nature & Wellness
  {
    id: 'teal',
    name: 'Ocean Breeze',
    badge: 'Pharmacy & Health',
    category: 'nature',
    primaryColor: '#0d9488',
    accentColor: '#14b8a6',
    colors: {
      50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf',
      500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a',
    },
  },
  {
    id: 'forest',
    name: 'Forest Pine',
    badge: 'Organic & Farm',
    category: 'nature',
    primaryColor: '#15803d',
    accentColor: '#16a34a',
    colors: {
      50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80',
      500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d',
    },
  },
  {
    id: 'mint',
    name: 'Botanical Mint',
    badge: 'Ayurvedic & Herb',
    category: 'nature',
    primaryColor: '#10b981',
    accentColor: '#34d399',
    colors: {
      50: '#f2fbf7', 100: '#e6f7ef', 200: '#c5eedc', 300: '#96e0c2', 400: '#5ecc9f',
      500: '#34b281', 600: '#10b981', 700: '#1d815e', 800: '#1b664c', 900: '#195440',
    },
  },
  {
    id: 'olive',
    name: 'Tuscan Olive',
    badge: 'Gourmet Deli & Wine',
    category: 'nature',
    primaryColor: '#65a30d',
    accentColor: '#84cc16',
    colors: {
      50: '#f7fee7', 100: '#ecfccb', 200: '#d9f99d', 300: '#bef264', 400: '#a3e635',
      500: '#84cc16', 600: '#65a30d', 700: '#4d7c0f', 800: '#3f6212', 900: '#365314',
    },
  },

  // 4. Luxury & Executive
  {
    id: 'slate',
    name: 'Midnight Obsidian',
    badge: 'Minimal Titanium',
    category: 'luxury',
    primaryColor: '#334155',
    accentColor: '#64748b',
    colors: {
      50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
      500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a',
    },
  },
  {
    id: 'nordic',
    name: 'Nordic Frost',
    badge: 'Stationery & Books',
    category: 'luxury',
    primaryColor: '#0284c7',
    accentColor: '#0ea5e9',
    colors: {
      50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8',
      500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e',
    },
  },
  {
    id: 'espresso',
    name: 'Warm Espresso',
    badge: 'Artisan Roastery',
    category: 'luxury',
    primaryColor: '#78350f',
    accentColor: '#a16207',
    colors: {
      50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4', 300: '#d6d3d1', 400: '#a8a29e',
      500: '#78716c', 600: '#57534e', 700: '#44403c', 800: '#292524', 900: '#1c1917',
    },
  },
  {
    id: 'sapphire',
    name: 'Royal Sapphire',
    badge: 'Enterprise Luxury',
    category: 'luxury',
    primaryColor: '#1d4ed8',
    accentColor: '#2563eb',
    colors: {
      50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
      500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a',
    },
  },
];
