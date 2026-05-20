// ============================================================
//  StreamForge API Contract — Auth Service
//  Base: /api/v1/auth  &  /api/v1/users  &  /api/v1/subscriptions
// ============================================================

import { apiFetch } from './client'
import type {
  User,
  UserWithSubscription,
  AuthTokens,
  Subscription,
  PlanInfo,
  ApiResponse,
} from './types'

const AUTH = { service: 'auth' as const }

// ─── Request DTOs ─────────────────────────────────────────────
export interface RegisterDto {
  email:        string
  username:     string
  password:     string
  displayName?: string
}

export interface LoginDto {
  identifier: string    // email OR username
  password:   string
  rememberMe?: boolean
}

export interface ForgotPasswordDto {
  email: string
}

export interface ResetPasswordDto {
  token:           string
  password:        string
  confirmPassword: string
}

export interface ChangePasswordDto {
  currentPassword:    string
  newPassword:        string
  confirmNewPassword: string
}

export interface UpdateProfileDto {
  displayName?: string
  bio?:         string
  avatarUrl?:   string
}

export interface CreateCheckoutDto {
  priceId:     string
  successUrl?: string
  cancelUrl?:  string
}

export type PaymentProvider = 'stripe' | 'flutterwave' | 'paystack'

export interface CreateRegionalCheckoutDto extends CreateCheckoutDto {
  provider: PaymentProvider
  countryCode?: string
}

// ─── Response DTOs ────────────────────────────────────────────
export interface AuthResponse {
  user:         User
  accessToken:  string
  expiresIn:    number
  /** Present in JSON for mobile clients (web uses HttpOnly cookie). */
  refreshToken?: string
}

export interface RefreshResponse {
  accessToken:  string
  expiresIn:    number
  refreshToken?: string
}

// ─── Auth API ─────────────────────────────────────────────────
export const authApi = {

  register: (dto: RegisterDto): Promise<AuthResponse> =>
    apiFetch('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(dto),
      ...AUTH,
    }),

  login: (dto: LoginDto): Promise<AuthResponse> =>
    apiFetch('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
      ...AUTH,
    }),

  refresh: (refreshToken?: string): Promise<RefreshResponse> =>
    apiFetch('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(refreshToken ? { refreshToken } : {}),
      ...AUTH,
    }),

  logout: (refreshToken?: string): Promise<{ message: string }> =>
    apiFetch('/api/v1/auth/logout', {
      method: 'POST',
      body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
      ...AUTH,
    }),

  verifyEmail: (token: string): Promise<{ message: string }> =>
    apiFetch('/api/v1/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
      ...AUTH,
    }),

  resendVerification: (): Promise<{ message: string }> =>
    apiFetch('/api/v1/auth/resend-verification', { method: 'POST', ...AUTH }),

  forgotPassword: (dto: ForgotPasswordDto): Promise<{ message: string }> =>
    apiFetch('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(dto),
      ...AUTH,
    }),

  resetPassword: (dto: ResetPasswordDto): Promise<{ message: string }> =>
    apiFetch('/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(dto),
      ...AUTH,
    }),

  changePassword: (dto: ChangePasswordDto): Promise<{ message: string }> =>
    apiFetch('/api/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(dto),
      ...AUTH,
    }),
}

// ─── User API ─────────────────────────────────────────────────
export const userApi = {

  getMe: (): Promise<UserWithSubscription> =>
    apiFetch('/api/v1/users/me', AUTH),

  updateMe: (dto: UpdateProfileDto): Promise<User> =>
    apiFetch('/api/v1/users/me', {
      method: 'PATCH',
      body: JSON.stringify(dto),
      ...AUTH,
    }),

  getByUsername: (username: string): Promise<Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'bio' | 'createdAt'>> =>
    apiFetch(`/api/v1/users/${username}`, AUTH),

  deleteAccount: (): Promise<{ message: string }> =>
    apiFetch('/api/v1/users/me', { method: 'DELETE', ...AUTH }),
}

// ─── Subscription API ─────────────────────────────────────────
export const subscriptionApi = {

  getPlans: (): Promise<{ plans: PlanInfo[] }> =>
    apiFetch('/api/v1/subscriptions/plans', AUTH),

  getMySubscription: (): Promise<Subscription> =>
    apiFetch('/api/v1/subscriptions/me', AUTH),

  createCheckout: (dto: CreateCheckoutDto): Promise<{ url: string }> =>
    apiFetch('/api/v1/subscriptions/checkout', {
      method: 'POST',
      body: JSON.stringify(dto),
      ...AUTH,
    }),

  createRegionalCheckout: (dto: CreateRegionalCheckoutDto): Promise<{ url: string }> =>
    apiFetch('/api/v1/subscriptions/checkout/regional', {
      method: 'POST',
      body: JSON.stringify(dto),
      ...AUTH,
    }),

  createPortal: (): Promise<{ url: string }> =>
    apiFetch('/api/v1/subscriptions/portal', { method: 'POST', ...AUTH }),
}
