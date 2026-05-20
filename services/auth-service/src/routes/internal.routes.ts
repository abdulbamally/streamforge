// ============================================================
//  Internal Routes — /api/internal/*
//  Used for service-to-service communication (Stream, Media, AI services)
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { requireInternalService } from '../middleware/auth.middleware'
import { prisma } from '../utils/prisma'
import { PLAN_LIMITS } from '@streamforge/shared/types'
import type { JwtAccessPayload } from '@streamforge/shared/types'

export async function internalRoutes(app: FastifyInstance): Promise<void> {

  // ─── POST /api/internal/verify-token ─────────────────────────
  // Called by other services to validate a user's JWT
  app.post(
    '/verify-token',
    {
      schema: {
        tags: ['Internal'],
        summary: 'Verify and decode an access token (service-to-service)',
        body: {
          type: 'object',
          required: ['token'],
          properties: { token: { type: 'string' } },
        },
      },
      preHandler: [requireInternalService],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { token } = request.body as { token: string }
      try {
        const payload = app.jwt.verify<JwtAccessPayload>(token)

        return reply.send({
          success: true,
          data: {
            valid:  true,
            userId: payload.sub,
            email:  payload.email,
            plan:   payload.plan,
            limits: PLAN_LIMITS[payload.plan],
          },
        })
      } catch {
        return reply.send({
          success: true,
          data: { valid: false },
        })
      }
    }
  )

  // ─── GET /api/internal/users/:userId ─────────────────────────
  // Fetch a user's full profile — used by Media/Stream services
  app.get(
    '/users/:userId',
    {
      schema: {
        tags: ['Internal'],
        summary: 'Get user by ID (service-to-service)',
        params: {
          type: 'object',
          properties: { userId: { type: 'string' } },
        },
      },
      preHandler: [requireInternalService],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = request.params as { userId: string }
      const user = await prisma.user.findUnique({
        where:   { id: userId },
        include: { subscription: true },
      })

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: { code: 'SRV_002', message: 'User not found' },
        })
      }

      const plan = user.subscription?.plan ?? 'FREE'

      return reply.send({
        success: true,
        data: {
          id:            user.id,
          email:         user.email,
          username:      user.username,
          plan,
          limits:        PLAN_LIMITS[plan],
          isActive:      user.isActive,
          emailVerified: user.emailVerified,
        },
      })
    }
  )
}
