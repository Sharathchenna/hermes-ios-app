/**
 * Hermes iOS Design Tokens
 * Converted from OKLCH prototype values to hex/RGB for React Native
 * Dark theme only — the prototype has no light mode
 */

import { Platform } from 'react-native';

// Accent hue is configurable (default 55 = warm gold)
const ACCENT_HUE = 55;

export const HermesColors = {
  // Core palette
  bg: '#171512',
  bg2: '#1E1C19',
  surface: '#24221E',
  surface2: '#2A2824',
  line: 'rgba(61, 58, 53, 0.9)',
  lineSoft: 'rgba(61, 58, 53, 0.45)',
  text: '#F5F3F0',
  textDim: '#C5C2BB',
  textMute: '#8A857D',

  // Accent (warm gold, hue 55)
  accent: '#E8C84A',
  accent2: '#D4B030',
  accentSoft: 'rgba(232, 200, 74, 0.15)',

  // Semantic
  good: '#7AD48A',
  warn: '#E8A050',
  danger: '#E86050',

  // Gradients / overlays
  bgGradientStart: 'rgba(232, 200, 74, 0.06)',
  composerBg: 'rgba(23, 21, 18, 0.8)',
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    mono: 'Courier',
  },
  android: {
    sans: 'Roboto',
    serif: 'serif',
    mono: 'monospace',
  },
  default: {
    sans: 'system-ui',
    serif: 'Georgia, serif',
    mono: 'SFMono-Regular, Menlo, monospace',
  },
});

// Utility: get accent color for a given hue
export function getAccentColor(hue: number): string {
  // Simplified hue shift for warm tones
  // 55 = gold, 30 = orange, 200 = blue, 280 = purple, 140 = green, 15 = red
  const hueMap: Record<number, string> = {
    55: '#E8C84A',
    30: '#E8A050',
    200: '#5AAEE8',
    280: '#A47AE8',
    140: '#7AD48A',
    15: '#E86050',
  };
  return hueMap[hue] || hueMap[55];
}

// Tab bar colors
export const TabColors = {
  active: HermesColors.accent,
  inactive: HermesColors.textMute,
  bg: 'rgba(23, 21, 18, 0.85)',
};
