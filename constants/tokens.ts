// Design tokens mirroring colors_and_type.css
import { Platform } from 'react-native';

// Returns native shadow props on iOS/Android and a boxShadow string on web.
// Prevents the "shadow* style props are deprecated" warning in React Native Web.
function makeShadow(
  native: Record<string, unknown>,
  web: string,
): Record<string, unknown> {
  return Platform.select({
    web: { boxShadow: web } as Record<string, unknown>,
    default: native,
  }) as Record<string, unknown>;
}

export const Colors = {
  // Brand
  primary: '#297AD6',
  primaryDark: '#2162AB',
  primaryAlt: '#3880FF',
  primarySubtle: '#EAF2FB',

  // Accent
  orange: '#E06714',
  orangeLight: '#EE781D',
  yellow: '#F9AE2B',
  teal: '#3086A3',

  // Semantic
  success: '#027A48',
  error: '#EF0A0A',
  warning: '#F9AE2B',
  info: '#297AD6',

  // Surface / neutral
  bg: '#F7F9FC',
  surface: '#FFFFFF',
  surfaceAlt: '#F7F9FC',
  border: '#EAEAEB',
  borderLight: '#F5F5F5',
  borderFocus: '#297AD6',

  // Text
  textPrimary: '#1F242A',
  textBody: '#2B323B',
  textSecondary: '#555B62',
  textTertiary: '#71767C',
  textMuted: '#BDC0C2',
  textIndigo: '#3D3D5A',
  textInverse: '#FFFFFF',
} as const;

export const Typography = {
  // Font families
  fontPrimary: 'Manrope',
  fontSecondary: 'Roboto',
  fontMono: 'Inter',

  // Font sizes
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
} as const;

export const Spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,

  // Layout
  pagePadding: 12,
  cardPadding: 12,
  cardGap: 4,
  sectionGap: 8,
  navHeight: 58,
  headerHeight: 56,
} as const;

export const Radius = {
  sm: 4,
  md: 6,
  card: 12,
  hero: 16,
  pill: 100,
  input: 8,
} as const;

export const Shadows = {
  card: makeShadow(
    { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 },
    '0 1px 2px rgba(0,0,0,0.06)',
  ),
  avatar: makeShadow(
    { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 4 },
    '0 4px 8px rgba(0,0,0,0.10)',
  ),
  nav: makeShadow(
    { shadowColor: '#000', shadowOffset: { width: 0, height: -1 }, shadowOpacity: 0.12, shadowRadius: 2, elevation: 8 },
    '0 -1px 2px rgba(0,0,0,0.12)',
  ),
};
