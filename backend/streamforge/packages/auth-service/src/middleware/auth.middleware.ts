// ============================================================
//  Auth Middleware — JWT Verification & Request Decoration
// ============================================================

import type { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify'
import type { JwtAccessPayload } from '@streamforge/shared/types'
import { ErrorCodes } from '@streamforge/shared/types'
import { config } from '../utils/config'
import { prisma } from '../utils/prisma'

/**
 * authenticate — Verifies Bearer JWT on protected routes
 * Attach to routes via: { preHandler: [authenticate] }
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Verify & decode JWT (throws on invalid/expired)
    const payload = await request.jwtVerify<JwtAccessPayload>()
    request.user = payload
  } catch (err) {
    return reply.status(401).send({
      success: false,
      error: {
        code:    ErrorCodes.TOKEN_INVALID,
        message: 'Invalid or expired access token',
      },
    })
  }
}

/**
 * requirePlan — Plan-based authorization guard
 * Usage: requirePlan('PRO', 'CREATOR', 'ENTERPRISE')
 */
export function requirePlan(...plans: Array<'FREE' | 'PRO' | 'CREATOR' | 'ENTERPRISE'>) {
  return async function (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({
        success: false,
        error: { code: ErrorCodes.UNAUTHORIZED, message: 'Authentication required' },
      })
    }

    if (!plans.includes(request.user.plan)) {
      return reply.status(403).send({
        success: false,
        error: {
          code:    ErrorCodes.PLAN_LIMIT_REACHED,
          message: `This feature requires one of the following plans: ${plans.join(', ')}`,
          details: { required: plans, current: request.user.plan },
        },
      })
    }
  }
}

/**
 * requireEmailVerified — Enforces email verification on sensitive routes
 */
export async function requireEmailVerified(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (!request.user?.emailVerified) {
    return reply.status(403).send({
      success: false,
      error: {
        code:    ErrorCodes.EMAIL_NOT_VERIFIED,
        message: 'Please verify your email address before accessing this feature',
      },
    })
  }
}

/**
 * optionalAuth — Populates request.user if a valid token is present
 * but does NOT reject the request if no token exists
 */
export async function optionalAuth(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    const payload = await request.jwtVerify<JwtAccessPayload>()
    request.user = payload
  } catch {
    // Silently fail — route handles unauthenticated access
  }
}

/**
 * requireInternalService — Guards internal service-to-service endpoints
 */
export async function requireInternalService(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const secret = request.headers['x-internal-secret']
  if (secret !== config.INTERNAL_SERVICE_SECRET) {
    return reply.status(401).send({
      success: false,
      error: { code: ErrorCodes.UNAUTHORIZED, message: 'Unauthorized' },
    })
  }
}

/**
 * validateZod — Generic Zod body validator
 */
export function validateBody<T>(schema: { parse: (data: unknown) => T }) {
  return async function (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      request.body = schema.parse(request.body)
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code:    ErrorCodes.VALIDATION_ERROR,
          message: 'Validation failed',
          details: err.errors ?? err.issues,
        },
      })
    }
  }
}
