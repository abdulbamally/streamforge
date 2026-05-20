// ============================================================
//  Auth Routes — /api/auth/*
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import {
  RegisterSchema,
  LoginSchema,
  VerifyEmailSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
} from '../schemas/auth.schema'
import { authenticate, validateBody } from '../middleware/auth.middleware'
import { AuthService } from '../services/auth.service'
import { EmailService } from '../services/email.service'
import { config } from '../utils/config'

const REFRESH_COOKIE_NAME = '__sf_rt'

function setRefreshCookie(reply: FastifyReply, token: string, rememberMe = false): void {
  reply.setCookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure:   config.COOKIE_SECURE,
    sameSite: 'strict',
    path:     '/api/auth',          // Restrict to auth endpoints only
    maxAge:   rememberMe
      ? 60 * 60 * 24 * 90          // 90 days
      : 60 * 60 * 24 * 30,         // 30 days
  })
}

function clearRefreshCookie(reply: FastifyReply): void {
  reply.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' })
}

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // Instantiate services (in prod, use DI container)
  const emailService = new EmailService()
  const authService  = new AuthService(app, emailService)

  // ─── POST /api/auth/register ────────────────────────────────
  app.post(
    '/register',
    {
      config: { rateLimit: { max: 10, timeWindow: '1h' } },
      schema: {
        tags: ['Auth'],
        summary: 'Register a new user account',
        body: {
          type: 'object',
          required: ['email', 'username', 'password'],
          properties: {
            email:       { type: 'string', format: 'email' },
            username:    { type: 'string', minLength: 3, maxLength: 30 },
            password:    { type: 'string', minLength: 8 },
            displayName: { type: 'string' },
          },
        },
      },
      preHandler: [validateBody(RegisterSchema)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const dto = RegisterSchema.parse(request.body)
      const { user, tokens } = await authService.register(dto)

      setRefreshCookie(reply, tokens.refreshToken)

      return reply.status(201).send({
        success: true,
        data: {
          user,
          accessToken:  tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn:    tokens.expiresIn,
        },
      })
    }
  )

  // ─── POST /api/auth/login ────────────────────────────────────
  app.post(
    '/login',
    {
      config: { rateLimit: { max: 20, timeWindow: '15m' } },
      schema: {
        tags: ['Auth'],
        summary: 'Login with email/username and password',
        body: {
          type: 'object',
          required: ['identifier', 'password'],
          properties: {
            identifier: { type: 'string' },
            password:   { type: 'string' },
            rememberMe: { type: 'boolean' },
          },
        },
      },
      preHandler: [validateBody(LoginSchema)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const dto = LoginSchema.parse(request.body)
      const { user, tokens } = await authService.login(dto)

      setRefreshCookie(reply, tokens.refreshToken, dto.rememberMe)

      return reply.send({
        success: true,
        data: {
          user,
          accessToken:  tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn:    tokens.expiresIn,
        },
      })
    }
  )

  // ─── POST /api/auth/refresh ──────────────────────────────────
  app.post(
    '/refresh',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Refresh access token using refresh token cookie or body',
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Token can come from HttpOnly cookie (preferred) or body (mobile fallback)
      const refreshToken =
        request.cookies[REFRESH_COOKIE_NAME] ??
        (request.body as any)?.refreshToken

      if (!refreshToken) {
        return reply.status(401).send({
          success: false,
          error: { code: 'AUTH_003', message: 'No refresh token provided' },
        })
      }

      const tokens = await authService.refreshTokens(refreshToken)

      setRefreshCookie(reply, tokens.refreshToken)

      return reply.send({
        success: true,
        data: {
          accessToken:  tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn:    tokens.expiresIn,
        },
      })
    }
  )

  // ─── POST /api/auth/logout ───────────────────────────────────
  app.post(
    '/logout',
    {
      schema: { tags: ['Auth'], summary: 'Logout and revoke refresh token' },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const refreshToken =
        request.cookies[REFRESH_COOKIE_NAME] ??
        (request.body as { refreshToken?: string } | undefined)?.refreshToken
      await authService.logout(refreshToken)

      clearRefreshCookie(reply)

      return reply.send({ success: true, data: { message: 'Logged out successfully' } })
    }
  )

  // ─── POST /api/auth/verify-email ─────────────────────────────
  app.post(
    '/verify-email',
    {
      config: { rateLimit: { max: 10, timeWindow: '1h' } },
      schema: {
        tags: ['Auth'],
        summary: 'Verify email address with token',
        body: {
          type: 'object',
          required: ['token'],
          properties: { token: { type: 'string' } },
        },
      },
      preHandler: [validateBody(VerifyEmailSchema)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { token } = VerifyEmailSchema.parse(request.body)
      await authService.verifyEmail(token)

      return reply.send({ success: true, data: { message: 'Email verified successfully' } })
    }
  )

  // ─── POST /api/auth/resend-verification ──────────────────────
  app.post(
    '/resend-verification',
    {
      config: { rateLimit: { max: 3, timeWindow: '1h' } },
      schema: { tags: ['Auth'], summary: 'Resend email verification link' },
      preHandler: [authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      await authService.resendVerification(request.user.sub)
      return reply.send({ success: true, data: { message: 'Verification email sent' } })
    }
  )

  // ─── POST /api/auth/forgot-password ──────────────────────────
  app.post(
    '/forgot-password',
    {
      config: { rateLimit: { max: 5, timeWindow: '1h' } },
      schema: {
        tags: ['Auth'],
        summary: 'Request password reset email',
        body: {
          type: 'object',
          required: ['email'],
          properties: { email: { type: 'string', format: 'email' } },
        },
      },
      preHandler: [validateBody(ForgotPasswordSchema)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { email } = ForgotPasswordSchema.parse(request.body)
      await authService.forgotPassword(email)

      // Always return success (prevent email enumeration)
      return reply.send({
        success: true,
        data: { message: 'If an account exists for that email, a reset link has been sent' },
      })
    }
  )

  // ─── POST /api/auth/reset-password ───────────────────────────
  app.post(
    '/reset-password',
    {
      config: { rateLimit: { max: 5, timeWindow: '1h' } },
      schema: {
        tags: ['Auth'],
        summary: 'Reset password with token',
        body: {
          type: 'object',
          required: ['token', 'password', 'confirmPassword'],
          properties: {
            token:           { type: 'string' },
            password:        { type: 'string', minLength: 8 },
            confirmPassword: { type: 'string' },
          },
        },
      },
      preHandler: [validateBody(ResetPasswordSchema)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const dto = ResetPasswordSchema.parse(request.body)
      await authService.resetPassword(dto)

      clearRefreshCookie(reply)

      return reply.send({ success: true, data: { message: 'Password reset successfully. Please login.' } })
    }
  )

  // ─── POST /api/auth/change-password ──────────────────────────
  app.post(
    '/change-password',
    {
      config: { rateLimit: { max: 5, timeWindow: '1h' } },
      schema: { tags: ['Auth'], summary: 'Change password (authenticated)' },
      preHandler: [authenticate, validateBody(ChangePasswordSchema)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const dto = ChangePasswordSchema.parse(request.body)
      await authService.changePassword(
        request.user.sub,
        dto.currentPassword,
        dto.newPassword
      )

      clearRefreshCookie(reply)

      return reply.send({ success: true, data: { message: 'Password changed. Please login again.' } })
    }
  )
}
