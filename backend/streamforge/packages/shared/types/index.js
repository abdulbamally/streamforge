"use strict";
// ============================================================
//  @streamforge/shared — Shared TypeScript types
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCodes = exports.PLATFORM_RTMP_URLS = exports.PLAN_LIMITS = void 0;
exports.PLAN_LIMITS = {
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
        maxStorageGB: -1, // unlimited
        maxProjectsCount: -1,
        hasWatermark: false,
        hasAIFeatures: true,
        hasColorGrading: true,
        maxExportFormats: ['MP4', 'MOV', 'WEBM', 'MKV', 'GIF', 'MP3'],
    },
};
exports.PLATFORM_RTMP_URLS = {
    YOUTUBE: 'rtmp://a.rtmp.youtube.com/live2',
    TWITCH: 'rtmp://live.twitch.tv/app',
    FACEBOOK: 'rtmps://live-api-s.facebook.com:443/rtmp/',
    TIKTOK: 'rtmp://push.tiktok.com/live/',
    INSTAGRAM: 'rtmps://edgetee-upload-{dc}.facebook.com:443/rtmp/',
};
// ─── Error Codes ──────────────────────────────────────────────
exports.ErrorCodes = {
    // Auth
    INVALID_CREDENTIALS: 'AUTH_001',
    EMAIL_NOT_VERIFIED: 'AUTH_002',
    TOKEN_EXPIRED: 'AUTH_003',
    TOKEN_INVALID: 'AUTH_004',
    EMAIL_ALREADY_EXISTS: 'AUTH_005',
    USERNAME_TAKEN: 'AUTH_006',
    ACCOUNT_DISABLED: 'AUTH_007',
    OAUTH_ERROR: 'AUTH_008',
    // Authorization
    UNAUTHORIZED: 'AUTHZ_001',
    FORBIDDEN: 'AUTHZ_002',
    PLAN_LIMIT_REACHED: 'AUTHZ_003',
    // Validation
    VALIDATION_ERROR: 'VAL_001',
    // Server
    INTERNAL_ERROR: 'SRV_001',
    NOT_FOUND: 'SRV_002',
    RATE_LIMITED: 'SRV_003',
};
//# sourceMappingURL=index.js.map