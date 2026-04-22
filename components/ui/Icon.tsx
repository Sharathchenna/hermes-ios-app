import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { View } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
}

const defaultColor = '#F5F3F0';

function IconWrapper({ children, size = 24, color = defaultColor }: IconProps & { children: React.ReactNode }) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {children}
      </Svg>
    </View>
  );
}

export const IconHome = ({ size = 24, color = defaultColor }: IconProps) => (
  <IconWrapper size={size} color={color}>
    <Path d="M4 11l8-6 8 6v8a2 2 0 0 1-2 2h-3v-5h-6v5H6a2 2 0 0 1-2-2z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
  </IconWrapper>
);

export const IconChat = ({ size = 24, color = defaultColor }: IconProps) => (
  <IconWrapper size={size} color={color}>
    <Path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8A2.5 2.5 0 0 1 17.5 17H10l-4 3v-3h-.5A1.5 1.5 0 0 1 4 15.5z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
  </IconWrapper>
);

export const IconSkills = ({ size = 24, color = defaultColor }: IconProps) => (
  <IconWrapper size={size} color={color}>
    <Path d="M4 7l8-4 8 4-8 4z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    <Path d="M4 12l8 4 8-4M4 17l8 4 8-4" stroke={color} strokeWidth={1.6} strokeLinejoin="round" opacity={0.55} />
  </IconWrapper>
);

export const IconMemory = ({ size = 24, color = defaultColor }: IconProps) => (
  <IconWrapper size={size} color={color}>
    <Path d="M12 3a5 5 0 0 0-5 5c0 1.3-.6 2-1.5 2.8A3 3 0 0 0 7 16v3a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3a3 3 0 0 0 1.5-5.2C17.6 10 17 9.3 17 8a5 5 0 0 0-5-5" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    <Path d="M9 13h6M10 17h4" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
  </IconWrapper>
);

export const IconClock = ({ size = 24, color = defaultColor }: IconProps) => (
  <IconWrapper size={size} color={color}>
    <Circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth={1.6} />
    <Path d="M12 7.5V12l3 2" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
  </IconWrapper>
);

export const IconBranch = ({ size = 24, color = defaultColor }: IconProps) => (
  <IconWrapper size={size} color={color}>
    <Circle cx="6" cy="5" r="2.2" stroke={color} strokeWidth={1.6} />
    <Circle cx="6" cy="19" r="2.2" stroke={color} strokeWidth={1.6} />
    <Circle cx="18" cy="12" r="2.2" stroke={color} strokeWidth={1.6} />
    <Path d="M6 7.5v9M8 19c4 0 8-1 8-5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
  </IconWrapper>
);

export const IconSettings = ({ size = 24, color = defaultColor }: IconProps) => (
  <IconWrapper size={size} color={color}>
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.6} />
    <Path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
  </IconWrapper>
);

export const IconSend = ({ size = 24, color = defaultColor }: IconProps) => (
  <IconWrapper size={size} color={color}>
    <Path d="M4 12l16-8-6 17-3-7z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
  </IconWrapper>
);

export const IconPlus = ({ size = 24, color = defaultColor }: IconProps) => (
  <IconWrapper size={size} color={color}>
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </IconWrapper>
);

export const IconBack = ({ size = 24, color = defaultColor }: IconProps) => (
  <IconWrapper size={size} color={color}>
    <Path d="M14 6l-6 6 6 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </IconWrapper>
);

export const IconCheck = ({ size = 24, color = defaultColor }: IconProps) => (
  <IconWrapper size={size} color={color}>
    <Path d="M5 12.5l4 4 10-10" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </IconWrapper>
);

export const IconSpark = ({ size = 24, color = defaultColor }: IconProps) => (
  <IconWrapper size={size} color={color}>
    <Path d="M12 3l1.7 5.1L19 10l-5.3 1.9L12 17l-1.7-5.1L5 10l5.3-1.9z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
  </IconWrapper>
);

export const IconSearch = ({ size = 24, color = defaultColor }: IconProps) => (
  <IconWrapper size={size} color={color}>
    <Circle cx="11" cy="11" r="6.5" stroke={color} strokeWidth={1.6} />
    <Path d="M20 20l-4-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </IconWrapper>
);

export const IconTerminal = ({ size = 24, color = defaultColor }: IconProps) => (
  <IconWrapper size={size} color={color}>
    <Rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth={1.6} />
    <Path d="M7 10l3 2-3 2M12 15h5" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
  </IconWrapper>
);

export const IconWeb = ({ size = 24, color = defaultColor }: IconProps) => (
  <IconWrapper size={size} color={color}>
    <Circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth={1.6} />
    <Path d="M3.5 12h17M12 3.5c2.5 2.5 4 5.5 4 8.5s-1.5 6-4 8.5M12 3.5c-2.5 2.5-4 5.5-4 8.5s1.5 6 4 8.5" stroke={color} strokeWidth={1.6} />
  </IconWrapper>
);

export const IconCode = ({ size = 24, color = defaultColor }: IconProps) => (
  <IconWrapper size={size} color={color}>
    <Path d="M9 8l-5 4 5 4M15 8l5 4-5 4M13 6l-2 12" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
  </IconWrapper>
);

export const IconFile = ({ size = 24, color = defaultColor }: IconProps) => (
  <IconWrapper size={size} color={color}>
    <Path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    <Path d="M14 3v5h5" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
  </IconWrapper>
);

export const IconBolt = ({ size = 24, color = defaultColor }: IconProps) => (
  <IconWrapper size={size} color={color}>
    <Path d="M13 3L5 14h6l-1 7 8-11h-6z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
  </IconWrapper>
);

export const IconDots = ({ size = 24, color = defaultColor }: IconProps) => (
  <IconWrapper size={size} color={color}>
    <Circle cx="5" cy="12" r="1.6" fill={color} />
    <Circle cx="12" cy="12" r="1.6" fill={color} />
    <Circle cx="19" cy="12" r="1.6" fill={color} />
  </IconWrapper>
);

export const IconPause = ({ size = 24, color = defaultColor }: IconProps) => (
  <IconWrapper size={size} color={color}>
    <Rect x="7" y="5" width="3" height="14" rx="1" fill={color} />
    <Rect x="14" y="5" width="3" height="14" rx="1" fill={color} />
  </IconWrapper>
);

export const IconPlay = ({ size = 24, color = defaultColor }: IconProps) => (
  <IconWrapper size={size} color={color}>
    <Path d="M7 5l12 7-12 7z" fill={color} />
  </IconWrapper>
);

export const IconX = ({ size = 24, color = defaultColor }: IconProps) => (
  <IconWrapper size={size} color={color}>
    <Path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </IconWrapper>
);

export const IconChev = ({ size = 24, color = defaultColor }: IconProps) => (
  <IconWrapper size={size} color={color}>
    <Path d="M9 6l6 6-6 6" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
  </IconWrapper>
);

export const IconHermesMark = ({ size = 28, color = defaultColor }: IconProps & { spin?: boolean }) => (
  <IconWrapper size={size} color={color}>
    <Circle cx="16" cy="16" r="13" stroke={color} strokeOpacity={0.25} strokeWidth={1.4} />
    <Path d="M16 3 A13 13 0 0 1 29 16" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Circle cx="16" cy="3" r="2.2" fill={color} />
    <Circle cx="16" cy="16" r="3" fill={color} />
  </IconWrapper>
);
