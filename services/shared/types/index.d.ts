export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: ResponseMeta;
}
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}
export interface ResponseMeta {
    page?: number;
    limit?: number;
    total?: number;
    hasNextPage?: boolean;
}
export interface JwtAccessPayload {
    sub: string;
    email: string;
    username: string;
    plan: Plan;
    emailVerified: boolean;
    iat?: number;
    exp?: number;
}
export interface JwtRefreshPayload {
    sub: string;
    tokenId: string;
    iat?: number;
    exp?: number;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export type Plan = 'FREE' | 'PRO' | 'CREATOR' | 'ENTERPRISE';
export declare const PLAN_LIMITS: Record<Plan, PlanLimits>;
export interface PlanLimits {
    maxDestinations: number;
    maxResolution: string;
    maxStorageGB: number;
    maxProjectsCount: number;
    hasWatermark: boolean;
    hasAIFeatures: boolean;
    hasColorGrading: boolean;
    maxExportFormats: string[];
}
export interface PublicUser {
    id: string;
    email: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    emailVerified: boolean;
    plan: Plan;
    createdAt: string;
}
export interface UserWithSubscription extends PublicUser {
    subscription: {
        status: string;
        currentPeriodEnd: string | null;
        cancelAtPeriodEnd: boolean;
    } | null;
}
export type Platform = 'YOUTUBE' | 'TWITCH' | 'FACEBOOK' | 'TIKTOK' | 'INSTAGRAM' | 'CUSTOM';
export declare const PLATFORM_RTMP_URLS: Partial<Record<Platform, string>>;
export declare const ErrorCodes: {
    readonly INVALID_CREDENTIALS: "AUTH_001";
    readonly EMAIL_NOT_VERIFIED: "AUTH_002";
    readonly TOKEN_EXPIRED: "AUTH_003";
    readonly TOKEN_INVALID: "AUTH_004";
    readonly EMAIL_ALREADY_EXISTS: "AUTH_005";
    readonly USERNAME_TAKEN: "AUTH_006";
    readonly ACCOUNT_DISABLED: "AUTH_007";
    readonly OAUTH_ERROR: "AUTH_008";
    readonly UNAUTHORIZED: "AUTHZ_001";
    readonly FORBIDDEN: "AUTHZ_002";
    readonly PLAN_LIMIT_REACHED: "AUTHZ_003";
    readonly VALIDATION_ERROR: "VAL_001";
    readonly INTERNAL_ERROR: "SRV_001";
    readonly NOT_FOUND: "SRV_002";
    readonly RATE_LIMITED: "SRV_003";
};
export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
//# sourceMappingURL=index.d.ts.map