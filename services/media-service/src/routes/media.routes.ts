// ============================================================
//  Media Routes — /api/v1/media/*  &  /api/v1/projects/*
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { config } from '../utils/config'
import { logger } from '../utils/logger'
import { enqueueExport, enqueueTranscode, enqueueThumbnail } from '../workers'
import { authenticate } from '../middleware/auth.middleware'

const s3 = new S3Client({
  region:   'auto',
  endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     config.R2_ACCESS_KEY_ID,
    secretAccessKey: config.R2_SECRET_ACCESS_KEY,
  },
})

// ─── Schemas ─────────────────────────────────────────────────
const PresignedUrlSchema = z.object({
  filename:    z.string().min(1),
  contentType: z.string().regex(/^(video|audio|image)\//),
  size:        z.number().max(10 * 1024 * 1024 * 1024), // 10GB max
})

const CreateProjectSchema = z.object({
  title:       z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  resolution:  z.string().regex(/^\d+x\d+$/).optional().default('1920x1080'),
  fps:         z.number().int().min(1).max(120).optional().default(30),
  aspectRatio: z.string().optional().default('16:9'),
})

const AddClipSchema = z.object({
  assetId:    z.string().optional(),
  assetUrl:   z.string().url(),
  trackIndex: z.number().int().min(0).optional().default(0),
  startTime:  z.number().min(0),
  endTime:    z.number().min(0),
  trimIn:     z.number().min(0).optional().default(0),
  trimOut:    z.number().min(0).optional(),
})

const ExportSchema = z.object({
  format:       z.enum(['MP4', 'MOV', 'WEBM', 'MKV', 'GIF', 'MP3']).default('MP4'),
  resolution:   z.string().regex(/^\d+x\d+$/).optional(),
  fps:          z.number().int().min(1).max(120).optional(),
  videoBitrate: z.number().int().optional(),
  audioBitrate: z.number().int().optional(),
})

const TrimSchema = z.object({
  clipId: z.string(),
  start:  z.number().min(0),
  end:    z.number().min(0),
})

const ColorGradeSchema = z.object({
  clipId:     z.string(),
  brightness: z.number().min(-1).max(1).default(0),
  contrast:   z.number().min(0).max(3).default(1),
  saturation: z.number().min(0).max(3).default(1),
  hue:        z.number().min(-180).max(180).default(0),
  lutUrl:     z.string().url().optional(),
})

export async function mediaRoutes(app: FastifyInstance): Promise<void> {

  // ── POST /media/presigned-upload ─────────────────────────────
  // Returns a pre-signed R2 URL so the mobile app uploads directly
  // (no bytes pass through our servers — critical for performance)
  app.post('/presigned-upload', {
    preHandler: [authenticate],
    schema: { tags: ['Media'], summary: 'Get pre-signed URL for direct R2 upload' },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = PresignedUrlSchema.parse(request.body)

    const ext      = dto.filename.split('.').pop() ?? 'mp4'
    const key      = `uploads/${request.user.sub}/${nanoid()}.${ext}`
    const assetId  = nanoid()

    // Generate a pre-signed PUT URL (valid 15 minutes)
    const presignedUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket:      config.R2_BUCKET_NAME,
        Key:         key,
        ContentType: dto.contentType,
      }),
      { expiresIn: 900 }
    )

    // Pre-create the asset record (status will be set on upload completion callback)
    await prisma.mediaAsset.create({
      data: {
        id:           assetId,
        userId:       request.user.sub,
        filename:     key,
        originalName: dto.filename,
        mimeType:     dto.contentType,
        sizeBytes:    BigInt(dto.size),
        url:          `${config.R2_PUBLIC_URL}/${key}`,
      },
    })

    return reply.send({
      success: true,
      data: {
        presignedUrl,
        assetId,
        publicUrl:  `${config.R2_PUBLIC_URL}/${key}`,
        expiresIn:  900,
      },
    })
  })

  // ── POST /media/:assetId/upload-complete ─────────────────────
  // Called by mobile after upload succeeds to trigger thumbnail gen
  app.post('/:assetId/upload-complete', {
    preHandler: [authenticate],
    schema: { tags: ['Media'], summary: 'Confirm asset upload and trigger post-processing' },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { assetId } = request.params as { assetId: string }
    const asset = await prisma.mediaAsset.findFirst({
      where: { id: assetId, userId: request.user.sub },
    })

    if (!asset) {
      return reply.status(404).send({ success: false, error: { code: 'SRV_002', message: 'Asset not found' } })
    }

    // Queue thumbnail generation (if video/image)
    if (asset.mimeType.startsWith('video/') || asset.mimeType.startsWith('image/')) {
      await enqueueThumbnail(asset.id, asset.url)
    }

    return reply.send({ success: true, data: { message: 'Processing started', assetId: asset.id } })
  })

  // ── GET /media — List user's media assets ─────────────────────
  app.get('/', {
    preHandler: [authenticate],
    schema: { tags: ['Media'], summary: 'List all media assets for user' },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { page = '1', limit = '20', type } = request.query as any
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where: any = { userId: request.user.sub }
    if (type) where.mimeType = { startsWith: type }

    const [assets, total] = await Promise.all([
      prisma.mediaAsset.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.mediaAsset.count({ where }),
    ])

    return reply.send({
      success: true,
      data: assets,
      meta: { page: parseInt(page), limit: parseInt(limit), total, hasNextPage: skip + assets.length < total },
    })
  })

  // ── DELETE /media/:assetId ────────────────────────────────────
  app.delete('/:assetId', {
    preHandler: [authenticate],
    schema: { tags: ['Media'], summary: 'Delete a media asset' },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { assetId } = request.params as { assetId: string }
    const asset = await prisma.mediaAsset.findFirst({
      where: { id: assetId, userId: request.user.sub },
    })
    if (!asset) return reply.status(404).send({ success: false, error: { code: 'SRV_002', message: 'Not found' } })

    // Delete from R2
    const key = asset.url.replace(`${config.R2_PUBLIC_URL}/`, '')
    await s3.send(new DeleteObjectCommand({ Bucket: config.R2_BUCKET_NAME, Key: key }))
      .catch(err => logger.warn({ err }, 'Failed to delete from R2'))

    await prisma.mediaAsset.delete({ where: { id: asset.id } })

    return reply.send({ success: true, data: { message: 'Asset deleted' } })
  })
}

// ─── Projects ─────────────────────────────────────────────────
export async function projectRoutes(app: FastifyInstance): Promise<void> {

  // ── POST /projects ────────────────────────────────────────────
  app.post('/', {
    preHandler: [authenticate],
    schema: { tags: ['Projects'], summary: 'Create a new editing project' },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = CreateProjectSchema.parse(request.body)

    const project = await prisma.project.create({
      data: {
        userId:      request.user.sub,
        title:       dto.title,
        description: dto.description,
        resolution:  dto.resolution,
        fps:         dto.fps,
        aspectRatio: dto.aspectRatio,
      },
    })

    return reply.status(201).send({ success: true, data: project })
  })

  // ── GET /projects ─────────────────────────────────────────────
  app.get('/', {
    preHandler: [authenticate],
    schema: { tags: ['Projects'], summary: 'List all projects' },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const projects = await prisma.project.findMany({
      where:   { userId: request.user.sub, status: { not: 'ARCHIVED' } },
      include: { exports: { where: { status: 'DONE' }, take: 1 } },
      orderBy: { updatedAt: 'desc' },
    })
    return reply.send({ success: true, data: projects })
  })

  // ── GET /projects/:id ─────────────────────────────────────────
  app.get('/:projectId', {
    preHandler: [authenticate],
    schema: { tags: ['Projects'], summary: 'Get project with full timeline' },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = request.params as { projectId: string }
    const project = await prisma.project.findFirst({
      where:   { id: projectId, userId: request.user.sub },
      include: { clips: { orderBy: { startTime: 'asc' } }, exports: { orderBy: { createdAt: 'desc' } } },
    })

    if (!project) {
      return reply.status(404).send({ success: false, error: { code: 'SRV_002', message: 'Project not found' } })
    }

    return reply.send({ success: true, data: project })
  })

  // ── POST /projects/:id/clips ──────────────────────────────────
  app.post('/:projectId/clips', {
    preHandler: [authenticate],
    schema: { tags: ['Projects'], summary: 'Add a clip to the timeline' },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = request.params as { projectId: string }
    const dto = AddClipSchema.parse(request.body)

    const clip = await prisma.clip.create({
      data: {
        projectId,
        assetId:    dto.assetId,
        assetUrl:   dto.assetUrl,
        trackIndex: dto.trackIndex,
        startTime:  dto.startTime,
        endTime:    dto.endTime,
        trimIn:     dto.trimIn,
        trimOut:    dto.trimOut,
      },
    })

    return reply.status(201).send({ success: true, data: clip })
  })

  // ── POST /projects/:id/export ─────────────────────────────────
  app.post('/:projectId/export', {
    preHandler: [authenticate],
    schema: { tags: ['Projects'], summary: 'Export project to video file' },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = request.params as { projectId: string }
    const dto     = ExportSchema.parse(request.body)
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: request.user.sub },
    })

    if (!project) {
      return reply.status(404).send({ success: false, error: { code: 'SRV_002', message: 'Project not found' } })
    }

    // Create export record
    const exportRecord = await prisma.export.create({
      data: {
        projectId:    project.id,
        format:       dto.format as any,
        resolution:   dto.resolution ?? project.resolution ?? '1920x1080',
        fps:          dto.fps ?? project.fps ?? 30,
        videoBitrate: dto.videoBitrate,
        audioBitrate: dto.audioBitrate,
        status:       'PENDING',
      },
    })

    // Enqueue export job
    const jobId = await enqueueExport({
      projectId:    project.id,
      exportId:     exportRecord.id,
      userId:       request.user.sub,
      format:       dto.format,
      resolution:   exportRecord.resolution,
      fps:          exportRecord.fps,
      videoBitrate: dto.videoBitrate,
      audioBitrate: dto.audioBitrate,
    })

    await prisma.export.update({
      where: { id: exportRecord.id },
      data:  { jobId },
    })

    return reply.status(202).send({
      success: true,
      data: {
        exportId: exportRecord.id,
        jobId,
        message: 'Export job queued',
      },
    })
  })

  // ── GET /projects/:id/exports/:exportId ───────────────────────
  app.get('/:projectId/exports/:exportId', {
    preHandler: [authenticate],
    schema: { tags: ['Projects'], summary: 'Get export job status and download URL' },
  }, async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { projectId, exportId } = request.params as {
      projectId: string
      exportId: string
    }
    const exportRecord = await prisma.export.findFirst({
      where: { id: exportId, projectId },
    })

    if (!exportRecord) {
      return reply.status(404).send({ success: false, error: { code: 'SRV_002', message: 'Export not found' } })
    }

    return reply.send({ success: true, data: exportRecord })
  })

  // ── POST /projects/:id/trim ───────────────────────────────────
  app.post('/:projectId/trim', {
    preHandler: [authenticate],
    schema: { tags: ['Projects'], summary: 'Trim a clip on the timeline' },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = request.params as { projectId: string }
    const dto = TrimSchema.parse(request.body)

    const jobId = await enqueueTranscode('trim', {
      clipId:    dto.clipId,
      projectId,
      userId:    request.user.sub,
      start:     dto.start,
      end:       dto.end,
    })

    return reply.status(202).send({ success: true, data: { jobId, message: 'Trim job queued' } })
  })

  // ── POST /projects/:id/color-grade ───────────────────────────
  app.post('/:projectId/color-grade', {
    preHandler: [authenticate],
    schema: { tags: ['Projects'], summary: 'Apply color grading to a clip' },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = ColorGradeSchema.parse(request.body)

    const jobId = await enqueueTranscode('color-grade', {
      ...dto,
      userId: request.user.sub,
    })

    return reply.status(202).send({ success: true, data: { jobId, message: 'Color grade job queued' } })
  })
}
