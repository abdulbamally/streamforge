// ============================================================
//  @streamforge/shared — Shared TypeScript types
// ============================================================

// ─── Base API Response ────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: ResponseMeta
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface ResponseMeta {
  page?: number
  limit?: number
  total?: number
  hasNextPage?: boolean
}

// ─── Auth Types ───────────────────────────────────────────────
export interface JwtAccessPayload {
  sub: string       // userId
  email: string
  username: string
  plan: Plan
  emailVerified: boolean
  iat?: number
  exp?: number
}

export interface JwtRefreshPayload {
  sub: string       // userId
  tokenId: string   // Token.id for revocation
  iat?: number
  exp?: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

// ─── Plans ───────────────────────────────────────────────────
export type Plan = 'FREE' | 'PRO' | 'CREATOR' | 'ENTERPRISE'

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: {
    maxDestinations: 1,
    maxResolution: '720p',
    maxStorageGB: 5,
    maxProjectsCount: 3,
    hasWatermark: true,
    hasAIFeatures: false,
    hasColorGrading: false,
    maxExportFormats: ['MP4'],
  },
  PRO: {
    maxDestinations: 3,
    maxResolution: '1080p',
    maxStorageGB: 50,
    maxProjectsCount: 20,
    hasWatermark: false,
    hasAIFeatures: true,
    hasColorGrading: true,
    maxExportFormats: ['MP4', 'MOV', 'WEBM'],
  },
  CREATOR: {
    maxDestinations: 10,
    maxResolution: '4K',
    maxStorageGB: 500,
    maxProjectsCount: 100,
    hasWatermark: false,
    hasAIFeatures: true,
    hasColorGrading: true,
    maxExportFormats: ['MP4', 'MOV', 'WEBM', 'MKV', 'GIF', 'MP3'],
  },
  ENTERPRISE: {
    maxDestinations: -1, // unlimited
    maxResolution: '4K',
    maxStorageGB: -1,    // unlimited
    maxProjectsCount: -1,
    hasWatermark: false,
    hasAIFeatures: true,
    hasColorGrading: true,
    maxExportFormats: ['MP4', 'MOV', 'WEBM', 'MKV', 'GIF', 'MP3'],
  },
}

export interface PlanLimits {
  maxDestinations: number
  maxResolution: string
  maxStorageGB: number
  maxProjectsCount: number
  hasWatermark: boolean
  hasAIFeatures: boolean
  hasColorGrading: boolean
  maxExportFormats: string[]
}

// ─── User ─────────────────────────────────────────────────────
export interface PublicUser {
  id: string
  email: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  emailVerified: boolean
  plan: Plan
  createdAt: string
}

export interface UserWithSubscription extends PublicUser {
  subscription: {
    status: string
    currentPeriodEnd: string | null
    cancelAtPeriodEnd: boolean
  } | null
}

// ─── Platform Types ───────────────────────────────────────────
export type Platform = 'YOUTUBE' | 'TWITCH' | 'FACEBOOK' | 'TIKTOK' | 'INSTAGRAM' | 'CUSTOM'

export const PLATFORM_RTMP_URLS: Partial<Record<Platform, string>> = {
  YOUTUBE:   'rtmp://a.rtmp.youtube.com/live2',
  TWITCH:    'rtmp://live.twitch.tv/app',
  FACEBOOK:  'rtmps://live-api-s.facebook.com:443/rtmp/',
  TIKTOK:    'rtmp://push.tiktok.com/live/',
  INSTAGRAM: 'rtmps://edgetee-upload-{dc}.facebook.com:443/rtmp/',
}

// ─── Error Codes ──────────────────────────────────────────────
export const ErrorCodes = {
  // Auth
  INVALID_CREDENTIALS:   'AUTH_001',
  EMAIL_NOT_VERIFIED:    'AUTH_002',
  TOKEN_EXPIRED:         'AUTH_003',
  TOKEN_INVALID:         'AUTH_004',
  EMAIL_ALREADY_EXISTS:  'AUTH_005',
  USERNAME_TAKEN:        'AUTH_006',
  ACCOUNT_DISABLED:      'AUTH_007',
  OAUTH_ERROR:           'AUTH_008',
  // Authorization
  UNAUTHORIZED:          'AUTHZ_001',
  FORBIDDEN:             'AUTHZ_002',
  PLAN_LIMIT_REACHED:    'AUTHZ_003',
  // Validation
  VALIDATION_ERROR:      'VAL_001',
  // Server
  INTERNAL_ERROR:        'SRV_001',
  NOT_FOUND:             'SRV_002',
  RATE_LIMITED:          'SRV_003',
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]
