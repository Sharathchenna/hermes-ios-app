import { View, type ViewProps } from 'react-native';

import { HermesColors } from '@/constants/theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, ...otherProps }: ThemedViewProps) {
  return <View style={[{ backgroundColor: HermesColors.bg }, style]} {...otherProps} />;
}
