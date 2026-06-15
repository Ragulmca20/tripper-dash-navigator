/**
 * Design tokens — single source of truth.
 * Automotive-inspired, matte-black first, Royal Enfield amber accent.
 */
export const colors = {
  // Surfaces
  bg: '#0A0A0B',          // matte black
  surface: '#121316',     // deep charcoal
  surfaceAlt: '#1A1C20',  // graphite
  surfaceHi: '#22252B',
  divider: '#2A2D33',

  // Text
  text: '#F5F6F7',
  textPrimary: '#F5F6F7',
  textSecondary: '#9AA0A6',
  textMuted: '#9AA0A6',
  textDim: '#6B7079',

  // Brand
  amber: '#FFB400',       // Royal Enfield amber / yellow
  accent: '#FFB400',
  amberDim: '#7A5600',
  electric: '#3DA9FC',    // electric blue accent

  // Status
  success: '#2ECC71',
  warning: '#FF8A00',
  danger: '#FF4D4F',

  // Map / dashboard
  routeLine: '#FFB400',
  corridor: 'rgba(255,180,0,0.18)',
  dashBg: '#000000',
  dashInk: '#FFFFFF',
} as const;

export type ColorToken = keyof typeof colors;
