/**
 * Hermes iOS is dark-only. This hook is kept for compatibility.
 */

import { HermesColors } from '@/constants/theme';

export function useThemeColor(
  _props: { light?: string; dark?: string },
  colorName: keyof typeof HermesColors
) {
  return HermesColors[colorName];
}
