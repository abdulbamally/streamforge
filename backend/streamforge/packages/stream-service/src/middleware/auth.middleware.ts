// ============================================================
//  Auth Middleware — Stream Service
//  Verifies JWT locally (shared secret) for performance.
//  Falls back to auth-service internal API for plan data.
// ============================================================

import type { FastifyRequest, FastifyReply } from 'fastify'
import type { JwtAccessPayload } from '@streamforge/shared/types'
import { ErrorCodes } from '@streamforge/shared/types'
import { config } from '../utils/config'

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const payload = await request.jwtVerify<JwtAccessPayload>()
    request.user  = payload
  } catch {
    return reply.status(401).send({
      success: false,
      error:   { code: ErrorCodes.TOKEN_INVALID, message: 'Invalid or expired token' },
    })
  }
}
