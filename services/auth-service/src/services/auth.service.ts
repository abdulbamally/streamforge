// ============================================================
//  AuthService — Core authentication business logic
// ============================================================

import * as argon2 from 'argon2'
import { nanoid } from 'nanoid'
import type { FastifyInstance } from 'fastify'
import type {
  RegisterDto,
  LoginDto,
  ResetPasswordDto,
} from '../schemas/auth.schema'
import type {
  AuthTokens,
  JwtAccessPayload,
  JwtRefreshPayload,
  PublicUser,
} from '@streamforge/shared/types'
import { ErrorCodes } from '@streamforge/shared/types'
import { prisma } from '../utils/prisma'
import { redisHelpers } from '../utils/redis'
import { config } from '../utils/config'
import { EmailService } from './email.service'
import { createAppError } from '../utils/errors'
import type { Prisma } from '../generated/prisma/client'

// Argon2id configuration — tuned for mobile clients (lower than web)
const ARGON2_OPTIONS: argon2.Options = {
  type:         argon2.argon2id,
  memoryCost:   65536, // 64MB
  timeCost:     3,
  parallelism:  4,
}

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_MINUTES    = 15

export class AuthService {
  constructor(
    private readonly app: FastifyInstance,
    private readonly emailService: EmailService
  ) {}

  // ─── Register ───────────────────────────────────────────────
  async register(dto: RegisterDto): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    // Check uniqueness
    const [existingEmail, existingUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email: dto.email } }),
      prisma.user.findUnique({ where: { username: dto.username } }),
    ])

    if (existingEmail) {
      throw createAppError(409, ErrorCodes.EMAIL_ALREADY_EXISTS, 'Email already registered')
    }
    if (existingUsername) {
      throw createAppError(409, ErrorCodes.USERNAME_TAKEN, 'Username is already taken')
    }

    // Hash password
    const passwordHash = await argon2.hash(dto.password, ARGON2_OPTIONS)

    // Create user + subscription in transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email:       dto.email,
          username:    dto.username,
          displayName: dto.displayName ?? dto.username,
          passwordHash,
        },
      })

      // Bootstrap free subscription (needed for plan checks)
      await tx.subscription.create({
        data: {
          userId:          newUser.id,
          stripeCustomerId: `pending_${newUser.id}`, // Will be updated when Stripe syncs
          plan:             'FREE',
          status:           'ACTIVE',
        },
      })

      return newUser
    })

    // Send verification email (non-blocking)
    const verifyToken = nanoid(48)
    await redisHelpers.setEmailToken(verifyToken, user.id)
    this.emailService.sendVerificationEmail(user.email, user.displayName ?? user.username, verifyToken)
      .catch(err => this.app.log.error({ err }, 'Failed to send verification email'))

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.username, 'FREE', false)

    await this.createAuditLog(user.id, 'user.register', { username: user.username })

    return { user: this.toPublicUser(user, 'FREE'), tokens }
  }

  // ─── Login ───────────────────────────────────────────────────
  async login(dto: LoginDto): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const isEmail = dto.identifier.includes('@')

    // Check lockout
    const attempts = await redisHelpers.getLoginAttempts(dto.identifier)
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      throw createAppError(
        429,
        ErrorCodes.TOKEN_INVALID,
        `Account temporarily locked. Try again in ${LOCKOUT_MINUTES} minutes`
      )
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: dto.identifier }
        : { username: dto.identifier },
      include: { subscription: true },
    })

    // Constant-time check even if user not found (prevent timing attacks)
    const dummyHash = '$argon2id$v=19$m=65536,t=3,p=4$dummy$dummy'
    const passwordHash = user?.passwordHash ?? dummyHash

    const passwordValid = await argon2.verify(passwordHash, dto.password)

    if (!user || !passwordValid) {
      await redisHelpers.incrementLoginAttempts(dto.identifier)
      throw createAppError(401, ErrorCodes.INVALID_CREDENTIALS, 'Invalid credentials')
    }

    if (!user.isActive) {
      throw createAppError(403, ErrorCodes.ACCOUNT_DISABLED, 'Account has been disabled')
    }

    // Clear login attempts on success
    await redisHelpers.clearLoginAttempts(dto.identifier)

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data:  { lastLoginAt: new Date() },
    })

    const plan = user.subscription?.plan ?? 'FREE'
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.username,
      plan,
      user.emailVerified,
      dto.rememberMe
    )

    await this.createAuditLog(user.id, 'user.login', { method: 'password' })

    return {
      user:   this.toPublicUser(user, plan),
      tokens,
    }
  }

  // ─── Refresh Token ───────────────────────────────────────────
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    let payload: JwtRefreshPayload

    try {
      payload = this.app.jwt.verify<JwtRefreshPayload>(
        refreshToken,
        { key: config.JWT_REFRESH_SECRET }
      )
    } catch {
      throw createAppError(401, ErrorCodes.TOKEN_INVALID, 'Invalid refresh token')
    }

    // Check token exists in Redis (not revoked)
    const storedUserId = await redisHelpers.getRefreshToken(payload.tokenId)
    if (!storedUserId || storedUserId !== payload.sub) {
      throw createAppError(401, ErrorCodes.TOKEN_INVALID, 'Refresh token has been revoked')
    }

    // Fetch current user state (plan may have changed)
    const user = await prisma.user.findUnique({
      where:   { id: payload.sub },
      include: { subscription: true },
    })

    if (!user || !user.isActive) {
      throw createAppError(401, ErrorCodes.UNAUTHORIZED, 'User not found or disabled')
    }

    // Rotate refresh token (invalidate old, issue new)
    await redisHelpers.deleteRefreshToken(payload.tokenId)

    const plan = user.subscription?.plan ?? 'FREE'
    return this.generateTokens(user.id, user.email, user.username, plan, user.emailVerified)
  }

  // ─── Logout ──────────────────────────────────────────────────
  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return

    try {
      const payload = this.app.jwt.verify<JwtRefreshPayload>(
        refreshToken,
        { key: config.JWT_REFRESH_SECRET }
      )
      await redisHelpers.deleteRefreshToken(payload.tokenId)
    } catch {
      // Token may already be invalid — that's fine
    }
  }

  // ─── Verify Email ─────────────────────────────────────────────
  async verifyEmail(token: string): Promise<void> {
    const userId = await redisHelpers.getEmailToken(token)

    if (!userId) {
      throw createAppError(400, ErrorCodes.TOKEN_INVALID, 'Invalid or expired verification token')
    }

    await prisma.user.update({
      where: { id: userId },
      data:  { emailVerified: true },
    })

    await redisHelpers.deleteEmailToken(token)
    await this.createAuditLog(userId, 'user.email_verified')
  }

  // ─── Resend Verification ──────────────────────────────────────
  async resendVerification(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.emailVerified) return // Silent — don't leak info

    const token = nanoid(48)
    await redisHelpers.setEmailToken(token, userId)
    await this.emailService.sendVerificationEmail(user.email, user.displayName ?? user.username, token)
  }

  // ─── Forgot Password ──────────────────────────────────────────
  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } })

    // Always return success to prevent email enumeration
    if (!user) return

    const token = nanoid(48)
    await redisHelpers.setPasswordResetToken(token, user.id)
    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.displayName ?? user.username,
      token
    )
  }

  // ─── Reset Password ───────────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const userId = await redisHelpers.getPasswordResetToken(dto.token)

    if (!userId) {
      throw createAppError(400, ErrorCodes.TOKEN_INVALID, 'Invalid or expired reset token')
    }

    const passwordHash = await argon2.hash(dto.password, ARGON2_OPTIONS)

    await prisma.user.update({
      where: { id: userId },
      data:  { passwordHash },
    })

    // Invalidate reset token + all active sessions (force re-login)
    await redisHelpers.deletePasswordResetToken(dto.token)
    await redisHelpers.invalidateAllUserSessions(userId)

    await this.createAuditLog(userId, 'user.password_reset')
  }

  // ─── Change Password ──────────────────────────────────────────
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user?.passwordHash) {
      throw createAppError(400, ErrorCodes.VALIDATION_ERROR, 'No password set on this account')
    }

    const valid = await argon2.verify(user.passwordHash, currentPassword)
    if (!valid) {
      throw createAppError(400, ErrorCodes.INVALID_CREDENTIALS, 'Current password is incorrect')
    }

    const passwordHash = await argon2.hash(newPassword, ARGON2_OPTIONS)
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } })

    // Invalidate all sessions on password change
    await redisHelpers.invalidateAllUserSessions(userId)
    await this.createAuditLog(userId, 'user.password_changed')
  }

  // ─── Get Current User ─────────────────────────────────────────
  async getMe(userId: string): Promise<PublicUser & { subscription: any }> {
    const user = await prisma.user.findUnique({
      where:   { id: userId },
      include: { subscription: true },
    })

    if (!user) {
      throw createAppError(404, ErrorCodes.NOT_FOUND, 'User not found')
    }

    const plan = user.subscription?.plan ?? 'FREE'
    return {
      ...this.toPublicUser(user, plan),
      subscription: user.subscription
        ? {
            status:            user.subscription.status,
            plan:              user.subscription.plan,
            currentPeriodEnd:  user.subscription.currentPeriodEnd?.toISOString() ?? null,
            cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
          }
        : null,
    }
  }

  // ─── Internal: token generation ───────────────────────────────
  private async generateTokens(
    userId: string,
    email: string,
    username: string,
    plan: any,
    emailVerified: boolean,
    rememberMe = false
  ): Promise<AuthTokens> {
    const tokenId = nanoid(32)

    const accessPayload: JwtAccessPayload = {
      sub: userId,
      email,
      username,
      plan,
      emailVerified,
    }

    // Access token — short-lived
    const accessToken = this.app.jwt.sign(accessPayload, {
      expiresIn: config.JWT_ACCESS_EXPIRES_IN,
    })

    // Refresh token — long-lived, signed with separate secret
    const refreshPayload: JwtRefreshPayload = { sub: userId, tokenId }
    const refreshToken = this.app.jwt.sign(refreshPayload, {
      key:       config.JWT_REFRESH_SECRET,
      expiresIn: rememberMe ? '90d' : config.JWT_REFRESH_EXPIRES_IN,
    })

    // Store refresh token reference in Redis for revocation
    await redisHelpers.setRefreshToken(tokenId, userId)

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    }
  }

  private toPublicUser(user: any, plan: any): PublicUser {
    return {
      id:            user.id,
      email:         user.email,
      username:      user.username,
      displayName:   user.displayName,
      avatarUrl:     user.avatarUrl,
      bio:           user.bio,
      emailVerified: user.emailVerified,
      plan,
      createdAt:     user.createdAt.toISOString(),
    }
  }

  private async createAuditLog(
    userId: string,
    action: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        metadata: metadata as Prisma.InputJsonValue | undefined,
      },
    }).catch(() => {}) // Non-fatal
  }
}
