// ============================================================
//  StreamForge Design Tokens
//  Dark-first design system. All UI is built from these tokens.
// ============================================================

// ─── Colors ───────────────────────────────────────────────────
export const Colors = {
  // Brand
  brand:       '#6366f1',   // Indigo — primary action
  brandLight:  '#818cf8',
  brandDark:   '#4f46e5',

  // Backgrounds (dark-first)
  bg:          '#0a0a0a',   // App background
  bgElevated:  '#141414',   // Cards, panels
  bgSurface:   '#1e1e1e',   // Inputs, secondary surfaces
  bgOverlay:   '#2a2a2a',   // Modals, overlays

  // Borders
  border:      '#2a2a2a',
  borderLight: '#3a3a3a',

  // Text
  textPrimary:   '#ffffff',
  textSecondary: '#a0a0a0',
  textTertiary:  '#666666',
  textDisabled:  '#404040',

  // Status
  success:  '#22c55e',
  warning:  '#f59e0b',
  error:    '#ef4444',
  info:     '#3b82f6',

  // Live indicator
  live:     '#ef4444',
  liveGlow: 'rgba(239,68,68,0.3)',

  // Plan badges
  planFree:       '#666666',
  planPro:        '#6366f1',
  planCreator:    '#f59e0b',
  planEnterprise: '#22c55e',

  // Transparent utilities
  overlay10: 'rgba(0,0,0,0.1)',
  overlay30: 'rgba(0,0,0,0.3)',
  overlay50: 'rgba(0,0,0,0.5)',
  overlay70: 'rgba(0,0,0,0.7)',
  white10:   'rgba(255,255,255,0.1)',
  white20:   'rgba(255,255,255,0.2)',
} as const

// ─── Typography ───────────────────────────────────────────────
export const Typography = {
  // Font family
  fontRegular:  'Inter-Regular',
  fontMedium:   'Inter-Medium',
  fontSemiBold: 'Inter-SemiBold',
  fontBold:     'Inter-Bold',

  // Sizes
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  xxl:  30,
  xxxl: 38,

  // Line heights
  lineHeightTight:   1.2,
  lineHeightNormal:  1.5,
  lineHeightRelaxed: 1.75,

  // Letter spacing
  trackingTight:  -0.5,
  trackingNormal: 0,
  trackingWide:   0.5,
} as const

// ─── Spacing (4pt grid) ───────────────────────────────────────
export const Spacing = {
  xxs: 2,
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const

// ─── Border Radius ────────────────────────────────────────────
export const Radius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 9999,
} as const

// ─── Shadows ──────────────────────────────────────────────────
export const Shadows = {
  sm: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius:  2,
    elevation:     2,
  },
  md: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius:  8,
    elevation:     6,
  },
  lg: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius:  16,
    elevation:     12,
  },
} as const

// ─── Z-Index ──────────────────────────────────────────────────
export const ZIndex = {
  base:       0,
  elevated:   10,
  dropdown:   100,
  sticky:     200,
  overlay:    300,
  modal:      400,
  toast:      500,
} as const

// ─── Animation durations ──────────────────────────────────────
export const Duration = {
  fast:   150,
  normal: 250,
  slow:   400,
} as const

// ─── Icon sizes ───────────────────────────────────────────────
export const IconSize = {
  xs:  14,
  sm:  16,
  md:  20,
  lg:  24,
  xl:  32,
} as const
