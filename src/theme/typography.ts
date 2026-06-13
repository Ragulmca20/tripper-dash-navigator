import { Platform, TextStyle } from 'react-native';

const family = Platform.select({
  ios: { regular: 'SF Pro Text', display: 'SF Pro Display', mono: 'Menlo' },
  android: { regular: 'Inter', display: 'Inter', mono: 'monospace' },
  default: { regular: 'Inter', display: 'Inter', mono: 'monospace' },
})!;

const make = (size: number, weight: TextStyle['fontWeight'], lh = size * 1.2): TextStyle => ({
  fontSize: size, fontWeight: weight, lineHeight: lh, fontFamily: family.regular,
});

export const typography = {
  display: { ...make(40, '700', 44), fontFamily: family.display, letterSpacing: -0.5 },
  h1: { ...make(28, '700', 32), fontFamily: family.display, letterSpacing: -0.3 },
  h2: make(22, '600', 26),
  h3: make(18, '600', 22),
  body: make(15, '400', 22),
  bodyStrong: make(15, '600', 22),
  label: make(13, '500', 18),
  caption: make(12, '400', 16),
  micro: make(10, '600', 12),
  mono: { ...make(14, '500', 18), fontFamily: family.mono, letterSpacing: 0.5 },
  // Dashboard-scale glyphs (526x300 viewport)
  dashHero: { ...make(72, '700', 76), fontFamily: family.display, letterSpacing: -2 },
  dashLabel: { ...make(12, '600', 14), letterSpacing: 1.5 },
} as const;

export type TypographyToken = keyof typeof typography;
