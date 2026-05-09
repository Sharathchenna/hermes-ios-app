export const Colors = {
  // Base
  bg: '#111111',
  surface: '#1A1A1A',
  surfaceElevated: '#222222',
  border: '#2A2A2A',
  borderLight: '#333333',

  // Text
  text: '#F0F0F0',
  textSecondary: '#A0A0A0',
  textTertiary: '#707070',
  textMuted: '#555555',

  // Accent — green like ChatGPT
  accent: '#10A37F',
  accentLight: '#19C99A',
  accentDark: '#0D8A6A',
  accentDim: 'rgba(16, 163, 127, 0.15)',

  // Semantic
  danger: '#EF4444',
  warning: '#F59E0B',

  // Message roles
  userBubble: '#2A2A2A',
  assistantIcon: '#10A37F',

  // Misc
  overlay: 'rgba(0, 0, 0, 0.6)',
} as const;

export const Typography = {
  title: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  composer: {
    fontSize: 16,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;
