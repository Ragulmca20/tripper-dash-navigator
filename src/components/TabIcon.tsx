import React from 'react';
import { Svg, Path, Circle, Rect, Line } from 'react-native-svg';
import { colors } from '@/theme';

export type TabName = 'Search' | 'Routes' | 'Navigate' | 'Scanner' | 'Settings';

type IconProps = { size?: number; color?: string };
type StarProps = IconProps & { filled?: boolean };

export const TabIcon: React.FC<{ name: TabName; focused: boolean; size?: number }> = ({
  name, focused, size = 24,
}) => {
  const stroke = focused ? colors.amber : colors.textDim;
  const sw = 1.6;
  switch (name) {
    case 'Search':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="11" cy="11" r="7" stroke={stroke} strokeWidth={sw} />
          <Line x1="16.5" y1="16.5" x2="21" y2="21" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
    case 'Routes':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M5 7 H13 a4 4 0 0 1 0 8 H9 a4 4 0 0 0 0 8 H19" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
          <Circle cx="5" cy="7" r="2" fill={stroke} />
          <Circle cx="19" cy="23" r="2" fill={stroke} />
        </Svg>
      );
    case 'Navigate':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 3 L19 20 L12 16 L5 20 Z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    case 'Scanner':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 8 V5 a1 1 0 0 1 1 -1 H8" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
          <Path d="M20 8 V5 a1 1 0 0 0 -1 -1 H16" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
          <Path d="M4 16 V19 a1 1 0 0 0 1 1 H8" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
          <Path d="M20 16 V19 a1 1 0 0 1 -1 1 H16" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
          <Line x1="4" y1="12" x2="20" y2="12" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
        </Svg>
      );
    case 'Settings':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="3" stroke={stroke} strokeWidth={sw}/>
          <Path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.3 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.3l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1A2 2 0 1 1 19.7 7l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"
            stroke={stroke} strokeWidth={sw} strokeLinejoin="round"/>
        </Svg>
      );
  }
};

/** Lightweight outline glyphs reused across screens. */
export const Icon = {
  Pin: ({ size = 18, color = colors.amber }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12z" stroke={color} strokeWidth={1.6} strokeLinejoin="round"/>
      <Circle cx="12" cy="10" r="2.5" stroke={color} strokeWidth={1.6}/>
    </Svg>
  ),
  Clock: ({ size = 16, color = colors.textMuted }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.6}/>
      <Path d="M12 7v5l3 2" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  Download: ({ size = 16, color = colors.amber }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4v12m0 0 4-4m-4 4-4-4M4 20h16" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  Trash: ({ size = 16, color = colors.danger }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 7h16M9 7V4h6v3m-8 0 1 13a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-13" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  Wifi: ({ size = 16, color = colors.amber }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 9a16 16 0 0 1 20 0M5 13a11 11 0 0 1 14 0M8.5 17a6 6 0 0 1 7 0" stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
      <Circle cx="12" cy="20" r="1.2" fill={color}/>
    </Svg>
  ),
  Sat: ({ size = 16, color = colors.amber }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12a7 7 0 0 1 7-7M5 16a11 11 0 0 1 11-11" stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
      <Rect x="4" y="14" width="6" height="6" rx="1" stroke={color} strokeWidth={1.6}/>
    </Svg>
  ),
  Play: ({ size = 22, color = colors.bg }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M7 5v14l12-7z" fill={color}/></Svg>
  ),
  Pause: ({ size = 22, color = colors.text }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24"><Rect x="6" y="5" width="4" height="14" fill={color}/><Rect x="14" y="5" width="4" height="14" fill={color}/></Svg>
  ),
  Stop: ({ size = 22, color = colors.text }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24"><Rect x="6" y="6" width="12" height="12" rx="1" fill={color}/></Svg>
  ),
  Chevron: ({ size = 18, color = colors.textMuted }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m9 6 6 6-6 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  Star: ({ size = 16, color = colors.amber, filled = false }: StarProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
      <Path d="m12 3 2.9 6 6.6.9-4.8 4.6 1.2 6.6L12 18l-5.9 3.1L7.3 14.5 2.5 9.9 9.1 9z" stroke={color} strokeWidth={1.6} strokeLinejoin="round"/>
    </Svg>
  ),
};
