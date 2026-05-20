// ============================================================
//  AI Service — Auth Middleware
// ============================================================

import type { FastifyRequest, FastifyReply } from 'fastify'
import type { JwtAccessPayload } from '@streamforge/shared/types'
import { config }    from '../utils/config'
import { redis, AiKeys, AiTTL } from '../utils/redis'
import { AiErrors }  from '../utils/errors'

const ALLOWED_PLANS = config.AI_PLANS_ALLOWED.split(',')

// ─── Verify JWT ───────────────────────────────────────────────
export async function authenticate(
  request: FastifyRequest,
  reply:   FastifyReply
): Promise<void> {
  try {
    const payload  = await request.jwtVerify<JwtAccessPayload>()
    request.user   = payload
  } catch {
    return reply.status(401).send({
      success: false,
      error:   { code: 'AUTH_004', message: 'Invalid or expired token' },
    })
  }
}

// ─── Require AI-enabled plan ──────────────────────────────────
export async function requireAiPlan(
  request: FastifyRequest,
  reply:   FastifyReply
): Promise<void> {
  if (!ALLOWED_PLANS.includes(request.user.plan)) {
    const err = AiErrors.planNotAllowed()
    return reply.status(err.statusCode).send({
      success: false,
      error:   { code: err.code, message: err.message },
    })
  }
}

// ─── Per-user rate limiter based on plan ─────────────────────
export async function aiRateLimit(
  request: FastifyRequest,
  reply:   FastifyReply
): Promise<void> {
  const limits: Record<string, number> = {
    PRO:        config.AI_REQUESTS_PER_MIN_PRO,
    CREATOR:    config.AI_REQUESTS_PER_MIN_CREATOR,
    ENTERPRISE: config.AI_REQUESTS_PER_MIN_ENTERPRISE,
  }

  const maxRequests = limits[request.user.plan] ?? 10
  const key         = AiKeys.rateLimit(request.user.sub)

  const current = await redis.incr(key)
  if (current === 1) {
    await redis.expire(key, AiTTL.RATE_LIMIT)
  }

  // Set headers so client knows their limit status
  reply.header('X-AI-RateLimit-Limit',     maxRequests)
  reply.header('X-AI-RateLimit-Remaining', Math.max(0, maxRequests - current))

  if (current > maxRequests) {
    const err = AiErrors.rateLimited()
    return reply.status(err.statusCode).send({
      success: false,
      error:   { code: err.code, message: err.message },
    })
  }
}

// ─── Internal service auth ────────────────────────────────────
export async function requireInternalService(
  request: FastifyRequest,
  reply:   FastifyReply
): Promise<void> {
  const secret = request.headers['x-internal-secret']
  if (secret !== config.INTERNAL_SERVICE_SECRET) {
    return reply.status(401).send({
      success: false,
      error:   { code: 'AUTHZ_001', message: 'Unauthorized' },
    })
  }
}
