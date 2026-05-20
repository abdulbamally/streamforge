// ============================================================
//  Stream Routes — /api/v1/streams/*
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { streamRedis } from '../utils/redis'
import { authenticate } from '../middleware/auth.middleware'
import { MulticastService } from '../services/multicast.service'
import { SceneService } from '../services/scene.service'
import { STREAM_PLAN_LIMITS } from '../types'
import { logger } from '../utils/logger'

const CreateStreamSchema = z.object({
  title:       z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

const CreateDestinationSchema = z.object({
  platform:  z.enum(['YOUTUBE', 'TWITCH', 'FACEBOOK', 'TIKTOK', 'INSTAGRAM', 'CUSTOM']),
  label:     z.string().min(1).max(50),
  rtmpUrl:   z.string().url(),
  streamKey: z.string().min(1),
})

const CreateSceneSchema = z.object({
  name:  z.string().min(1).max(50),
  order: z.number().int().min(0).optional().default(0),
})

const CreateSourceSchema = z.object({
  type:      z.enum(['CAMERA', 'SCREEN', 'IMAGE', 'VIDEO', 'TEXT', 'BROWSER', 'AUDIO']),
  label:     z.string().min(1).max(50),
  order:     z.number().int().min(0).optional().default(0),
  assetUrl:  z.string().url().optional(),
  config: z.object({
    x:        z.number().default(0),
    y:        z.number().default(0),
    width:    z.number().default(1),
    height:   z.number().default(1),
    rotation: z.number().default(0),
    opacity:  z.number().min(0).max(1).default(1),
    zIndex:   z.number().default(0),
    locked:   z.boolean().default(false),
    visible:  z.boolean().default(true),
    filters:  z.array(z.any()).default([]),
  }).optional().default({}),
})

export async function streamRoutes(
  app: FastifyInstance,
  { multicast, sceneService }: { multicast: MulticastService; sceneService: SceneService }
): Promise<void> {

  // ─── POST /streams — Create stream ─────────────────────────
  app.post('/', {
    preHandler: [authenticate],
    schema: { tags: ['Streams'], summary: 'Create a new stream' },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = CreateStreamSchema.parse(request.body)

    const stream = await prisma.stream.create({
      data: {
        userId:      request.user.sub,
        title:       dto.title,
        description: dto.description,
      },
    })

    // Auto-create a default scene
    await prisma.scene.create({
      data: { streamId: stream.id, name: 'Main Scene', order: 0, isActive: true },
    })

    return reply.status(201).send({ success: true, data: stream })
  })

  // ─── GET /streams — List user's streams ────────────────────
  app.get('/', {
    preHandler: [authenticate],
    schema: { tags: ['Streams'], summary: 'List all streams for authenticated user' },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const streams = await prisma.stream.findMany({
      where:   { userId: request.user.sub },
      include: { destinations: { include: { destination: true } }, recording: true },
      orderBy: { createdAt: 'desc' },
    })

    return reply.send({ success: true, data: streams })
  })

  // ─── GET /streams/:id — Get single stream ──────────────────
  app.get('/:streamId', {
    preHandler: [authenticate],
    schema: { tags: ['Streams'], summary: 'Get stream by ID' },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { streamId } = request.params as { streamId: string }
    const stream = await prisma.stream.findFirst({
      where:   { id: streamId, userId: request.user.sub },
      include: {
        destinations: { include: { destination: true } },
        scenes:       { include: { sources: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } },
        recording:    true,
      },
    })

    if (!stream) {
      return reply.status(404).send({ success: false, error: { code: 'SRV_002', message: 'Stream not found' } })
    }

    // Attach live state from Redis if active
    const liveState = await streamRedis.getLiveState(stream.id)

    return reply.send({ success: true, data: { ...stream, liveState } })
  })

  // ─── GET /streams/:id/key — Get stream key (sensitive) ─────
  app.get('/:streamId/key', {
    preHandler: [authenticate],
    schema: { tags: ['Streams'], summary: 'Get stream ingest key and URL' },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { streamId } = request.params as { streamId: string }
    const stream = await prisma.stream.findFirst({
      where: { id: streamId, userId: request.user.sub },
      select: { id: true, streamKey: true },
    })

    if (!stream) {
      return reply.status(404).send({ success: false, error: { code: 'SRV_002', message: 'Stream not found' } })
    }

    return reply.send({
      success: true,
      data: {
        streamKey:  stream.streamKey,
        ingestUrl:  `rtmp://stream.streamforge.app/live`,
        serverUrl:  `rtmp://stream.streamforge.app/live`,
        fullUrl:    `rtmp://stream.streamforge.app/live/${stream.streamKey}`,
      },
    })
  })

  // ─── POST /streams/:id/destinations — Add destination ──────
  app.post('/:streamId/destinations', {
    preHandler: [authenticate],
    schema: { tags: ['Streams'], summary: 'Add a streaming destination' },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { streamId } = request.params as { streamId: string }
    const dto = CreateDestinationSchema.parse(request.body)
    const plan = request.user.plan as keyof typeof STREAM_PLAN_LIMITS
    const limits = STREAM_PLAN_LIMITS[plan]

    // Enforce plan destination limit
    const currentCount = await prisma.destination.count({
      where: { userId: request.user.sub },
    })

    if (limits.maxDestinations !== -1 && currentCount >= limits.maxDestinations) {
      return reply.status(403).send({
        success: false,
        error: {
          code:    'AUTHZ_003',
          message: `Your ${plan} plan allows a maximum of ${limits.maxDestinations} destination(s). Upgrade to add more.`,
        },
      })
    }

    const destination = await prisma.destination.create({
      data: {
        userId:    request.user.sub,
        platform:  dto.platform,
        label:     dto.label,
        rtmpUrl:   dto.rtmpUrl,
        streamKey: dto.streamKey,
      },
    })

    // Link to stream
    await prisma.streamDestination.create({
      data: {
        streamId,
        destinationId: destination.id,
      },
    })

    return reply.status(201).send({ success: true, data: destination })
  })

  // ─── DELETE /streams/:id/destinations/:destId ──────────────
  app.delete('/:streamId/destinations/:destId', {
    preHandler: [authenticate],
    schema: { tags: ['Streams'], summary: 'Remove a destination from a stream' },
  }, async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { streamId, destId } = request.params as {
      streamId: string
      destId: string
    }
    await prisma.streamDestination.deleteMany({
      where: {
        streamId,
        destinationId: destId,
      },
    })

    return reply.send({ success: true, data: { message: 'Destination removed' } })
  })

  // ─── POST /streams/:id/end — Force end stream ──────────────
  app.post('/:streamId/end', {
    preHandler: [authenticate],
    schema: { tags: ['Streams'], summary: 'Forcefully end an active stream' },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { streamId } = request.params as { streamId: string }
    const stream = await prisma.stream.findFirst({
      where: { id: streamId, userId: request.user.sub },
    })

    if (!stream) {
      return reply.status(404).send({ success: false, error: { code: 'SRV_002', message: 'Stream not found' } })
    }

    await multicast.stopMulticast(stream.id)

    await prisma.stream.update({
      where: { id: stream.id },
      data:  { status: 'ENDED', endedAt: new Date() },
    })

    await streamRedis.deleteLiveState(stream.id)
    await streamRedis.clearUserActiveStream(request.user.sub)

    return reply.send({ success: true, data: { message: 'Stream ended' } })
  })

  // ─── Scene routes ──────────────────────────────────────────
  // POST /streams/:id/scenes
  app.post('/:streamId/scenes', {
    preHandler: [authenticate],
    schema: { tags: ['Streams'], summary: 'Create a scene' },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { streamId } = request.params as { streamId: string }
    const dto   = CreateSceneSchema.parse(request.body)
    const scene = await sceneService.createScene(streamId, dto)
    return reply.status(201).send({ success: true, data: scene })
  })

  // GET /streams/:id/scenes
  app.get('/:streamId/scenes', {
    preHandler: [authenticate],
    schema: { tags: ['Streams'], summary: 'Get all scenes for a stream' },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { streamId } = request.params as { streamId: string }
    const scenes = await sceneService.getScenesForStream(streamId)
    return reply.send({ success: true, data: scenes })
  })

  // POST /streams/:id/scenes/:sceneId/switch
  app.post('/:streamId/scenes/:sceneId/switch', {
    preHandler: [authenticate],
    schema: { tags: ['Streams'], summary: 'Switch active scene' },
  }, async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { streamId, sceneId } = request.params as {
      streamId: string
      sceneId: string
    }
    await sceneService.switchActiveScene(streamId, request.user.sub, sceneId)
    return reply.send({ success: true, data: { message: 'Scene switched' } })
  })

  // POST /streams/:id/scenes/:sceneId/sources
  app.post('/:streamId/scenes/:sceneId/sources', {
    preHandler: [authenticate],
    schema: { tags: ['Streams'], summary: 'Add a source to a scene' },
  }, async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { sceneId } = request.params as { streamId: string; sceneId: string }
    const dto    = CreateSourceSchema.parse(request.body)
    const source = await sceneService.createSource(sceneId, request.user.sub, dto as any)
    return reply.status(201).send({ success: true, data: source })
  })

  // PATCH /streams/:id/scenes/:sceneId/sources/:sourceId
  app.patch('/:streamId/scenes/:sceneId/sources/:sourceId', {
    preHandler: [authenticate],
    schema: { tags: ['Streams'], summary: 'Update a source' },
  }, async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { sourceId } = request.params as {
      streamId: string
      sceneId: string
      sourceId: string
    }
    const source = await sceneService.updateSource(
      sourceId,
      request.user.sub,
      request.body as any
    )
    return reply.send({ success: true, data: source })
  })
}
