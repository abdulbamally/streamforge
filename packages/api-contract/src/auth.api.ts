// ============================================================
//  StreamForge API Contract — Auth Service
//  Base: /api/v1/auth  &  /api/v1/users  &  /api/v1/subscriptions
// ============================================================

import { apiFetch, buildQuery } from './client'
import type {
  User,
  UserWithSubscription,
  AuthTokens,
  Subscription,
  PlanInfo,
  ApiResponse,
} from './types'

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

// ─── Response DTOs ────────────────────────────────────────────
export interface AuthResponse {
  user:        User
  accessToken: string
  expiresIn:   number
}

export interface RefreshResponse {
  accessToken: string
  expiresIn:   number
}

// ─── Auth API ─────────────────────────────────────────────────
export const authApi = {

  /**
   * Register a new user account.
   * Returns access token + user. Refresh token set as HttpOnly cookie.
   */
  register: (dto: RegisterDto): Promise<AuthResponse> =>
    apiFetch('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(dto) }),

  /**
   * Login with email/username and password.
   */
  login: (dto: LoginDto): Promise<AuthResponse> =>
    apiFetch('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(dto) }),

  /**
   * Refresh access token.
   * On mobile: pass refreshToken in body (no cookie support).
   * On web: cookie is used automatically.
   */
  refresh: (refreshToken?: string): Promise<RefreshResponse> =>
    apiFetch('/api/v1/auth/refresh', {
      method: 'POST',
      body:   JSON.stringify(refreshToken ? { refreshToken } : {}),
    }),

  /**
   * Logout and revoke refresh token.
   */
  logout: (): Promise<{ message: string }> =>
    apiFetch('/api/v1/auth/logout', { method: 'POST' }),

  /**
   * Verify email address with token from email link.
   */
  verifyEmail: (token: string): Promise<{ message: string }> =>
    apiFetch('/api/v1/auth/verify-email', {
      method: 'POST',
      body:   JSON.stringify({ token }),
    }),

  /**
   * Resend email verification link (requires auth).
   */
  resendVerification: (): Promise<{ message: string }> =>
    apiFetch('/api/v1/auth/resend-verification', { method: 'POST' }),

  /**
   * Request password reset email.
   * Always returns success (prevents email enumeration).
   */
  forgotPassword: (dto: ForgotPasswordDto): Promise<{ message: string }> =>
    apiFetch('/api/v1/auth/forgot-password', {
      method: 'POST',
      body:   JSON.stringify(dto),
    }),

  /**
   * Reset password using token from email link.
   * Invalidates all existing sessions.
   */
  resetPassword: (dto: ResetPasswordDto): Promise<{ message: string }> =>
    apiFetch('/api/v1/auth/reset-password', {
      method: 'POST',
      body:   JSON.stringify(dto),
    }),

  /**
   * Change password (requires auth).
   * Invalidates all existing sessions — user must log in again.
   */
  changePassword: (dto: ChangePasswordDto): Promise<{ message: string }> =>
    apiFetch('/api/v1/auth/change-password', {
      method: 'POST',
      body:   JSON.stringify(dto),
    }),
}

// ─── User API ─────────────────────────────────────────────────
export const userApi = {

  /**
   * Get current authenticated user with subscription details.
   */
  getMe: (): Promise<UserWithSubscription> =>
    apiFetch('/api/v1/users/me'),

  /**
   * Update current user's profile.
   */
  updateMe: (dto: UpdateProfileDto): Promise<User> =>
    apiFetch('/api/v1/users/me', {
      method: 'PATCH',
      body:   JSON.stringify(dto),
    }),

  /**
   * Get public profile of any user by username.
   */
  getByUsername: (username: string): Promise<Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'bio' | 'createdAt'>> =>
    apiFetch(`/api/v1/users/${username}`),

  /**
   * Delete own account (soft delete).
   */
  deleteAccount: (): Promise<{ message: string }> =>
    apiFetch('/api/v1/users/me', { method: 'DELETE' }),
}

// ─── Subscription API ─────────────────────────────────────────
export const subscriptionApi = {

  /**
   * Get all available plans and their limits.
   * No auth required.
   */
  getPlans: (): Promise<{ plans: PlanInfo[] }> =>
    apiFetch('/api/v1/subscriptions/plans'),

  /**
   * Get current user's subscription details.
   */
  getMySubscription: (): Promise<Subscription> =>
    apiFetch('/api/v1/subscriptions/me'),

  /**
   * Create a Stripe checkout session.
   * Returns a URL — open in WebView or browser.
   */
  createCheckout: (dto: CreateCheckoutDto): Promise<{ url: string }> =>
    apiFetch('/api/v1/subscriptions/checkout', {
      method: 'POST',
      body:   JSON.stringify(dto),
    }),

  /**
   * Create a Stripe billing portal session.
   * Returns a URL — open in WebView or browser.
   */
  createPortal: (): Promise<{ url: string }> =>
    apiFetch('/api/v1/subscriptions/portal', { method: 'POST' }),
}
