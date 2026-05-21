import type { ViewStyle } from 'react-native'

export const EditorColors = {
  canvas: '#f5f6f8',
  surface: '#ffffff',
  surfaceSoft: '#f9fafb',
  surfaceRaised: '#ffffff',
  stage: '#111318',
  stageSoft: '#1b1f27',
  border: '#e5e7eb',
  borderStrong: '#d1d5db',
  textPrimary: '#151922',
  textSecondary: '#667085',
  textTertiary: '#98a2b3',
  accent: '#4f46e5',
  accentSoft: '#eef2ff',
  accentMuted: '#c7d2fe',
  clipVideo: '#dbeafe',
  clipAudio: '#dcfce7',
  clipText: '#fef3c7',
  danger: '#dc2626',
  shadow: '#101828',
  white: '#ffffff',
} as const

export const EditorSpacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const

export const EditorRadius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  full: 999,
} as const

export const EditorTypography = {
  micro: 10,
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
} as const

export const EditorShadows = {
  panel: {
    shadowColor: EditorColors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  } satisfies ViewStyle,
  control: {
    shadowColor: EditorColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  } satisfies ViewStyle,
} as const
