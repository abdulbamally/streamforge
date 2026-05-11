// ============================================================
//  Auth Schemas — Zod + JSON Schema for Fastify validation
// ============================================================

import { z } from 'zod'

// ─── Register ────────────────────────────────────────────────
export const RegisterSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  displayName: z.string().min(1).max(50).optional(),
})

export type RegisterDto = z.infer<typeof RegisterSchema>

// ─── Login ───────────────────────────────────────────────────
export const LoginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email or username is required')
    .trim()
    .toLowerCase(),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
})

export type LoginDto = z.infer<typeof LoginSchema>

// ─── Refresh Token ───────────────────────────────────────────
export const RefreshTokenSchema = z.object({
  refreshToken: z.string().optional(), // Can come from cookie or body
})

export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>

// ─── Email Verification ───────────────────────────────────────
export const VerifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
})

export type VerifyEmailDto = z.infer<typeof VerifyEmailSchema>

// ─── Password Reset Request ───────────────────────────────────
export const ForgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
})

export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>

// ─── Password Reset Confirm ───────────────────────────────────
export const ResetPasswordSchema = z.object({
  token:    z.string().min(1),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>

// ─── Change Password ─────────────────────────────────────────
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
})

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>

// ─── Update Profile ──────────────────────────────────────────
export const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio:         z.string().max(160).optional(),
  avatarUrl:   z.string().url().optional(),
})

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>

// ─── OAuth ───────────────────────────────────────────────────
export const OAuthCallbackSchema = z.object({
  code:  z.string(),
  state: z.string().optional(),
})

export type OAuthCallbackDto = z.infer<typeof OAuthCallbackSchema>

// ─── Stripe Webhook ──────────────────────────────────────────
export const CreateCheckoutSchema = z.object({
  priceId: z.string().startsWith('price_'),
  successUrl: z.string().url().optional(),
  cancelUrl:  z.string().url().optional(),
})

export type CreateCheckoutDto = z.infer<typeof CreateCheckoutSchema>
