// ============================================================
//  User Routes — /api/users/*
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { UpdateProfileSchema } from '../schemas/auth.schema'
import { authenticate, validateBody } from '../middleware/auth.middleware'
import { AuthService } from '../services/auth.service'
import { EmailService } from '../services/email.service'
import { prisma } from '../utils/prisma'

export async function userRoutes(app: FastifyInstance): Promise<void> {
  const emailService = new EmailService()
  const authService  = new AuthService(app, emailService)

  // ─── GET /api/users/me ───────────────────────────────────────
  app.get(
    '/me',
    {
      schema: {
        tags: ['Users'],
        summary: 'Get current authenticated user',
        security: [{ BearerAuth: [] }],
      },
      preHandler: [authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = await authService.getMe(request.user.sub)
      return reply.send({ success: true, data: user })
    }
  )

  // ─── PATCH /api/users/me ─────────────────────────────────────
  app.patch(
    '/me',
    {
      schema: {
        tags: ['Users'],
        summary: 'Update current user profile',
        security: [{ BearerAuth: [] }],
      },
      preHandler: [authenticate, validateBody(UpdateProfileSchema)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const dto = UpdateProfileSchema.parse(request.body)

      const updated = await prisma.user.update({
        where: { id: request.user.sub },
        data:  dto,
        select: {
          id:            true,
          email:         true,
          username:      true,
          displayName:   true,
          avatarUrl:     true,
          bio:           true,
          emailVerified: true,
          createdAt:     true,
        },
      })

      return reply.send({ success: true, data: updated })
    }
  )

  // ─── GET /api/users/:username ────────────────────────────────
  app.get(
    '/:username',
    {
      schema: {
        tags: ['Users'],
        summary: 'Get public user profile by username',
        params: {
          type: 'object',
          properties: { username: { type: 'string' } },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { username: string } }>,
      reply: FastifyReply
    ) => {
      const user = await prisma.user.findUnique({
        where: { username: request.params.username },
        select: {
          id:          true,
          username:    true,
          displayName: true,
          avatarUrl:   true,
          bio:         true,
          createdAt:   true,
        },
      })

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: { code: 'SRV_002', message: 'User not found' },
        })
      }

      return reply.send({ success: true, data: user })
    }
  )

  // ─── DELETE /api/users/me ─────────────────────────────────────
  app.delete(
    '/me',
    {
      schema: {
        tags: ['Users'],
        summary: 'Delete own account (soft delete — marks inactive)',
        security: [{ BearerAuth: [] }],
      },
      preHandler: [authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      await prisma.user.update({
        where: { id: request.user.sub },
        data:  { isActive: false, email: `deleted_${Date.now()}_${request.user.email}` },
      })

      return reply.send({ success: true, data: { message: 'Account deleted' } })
    }
  )
}
