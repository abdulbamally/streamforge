// ============================================================
//  Media Service Tests
//  Covers: presigned upload, asset list/delete,
//          project CRUD, clip management, export queuing
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Fastify, { type FastifyInstance } from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'

// ─── Mock all external dependencies ──────────────────────────
vi.mock('../utils/prisma', () => ({
  prisma: {
    mediaAsset: {
      create:     vi.fn(),
      findMany:   vi.fn(),
      findFirst:  vi.fn(),
      update:     vi.fn(),
      delete:     vi.fn(),
      count:      vi.fn(),
    },
    project: {
      create:   vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update:   vi.fn(),
    },
    clip: {
      create:   vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update:   vi.fn(),
    },
    export: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client:           vi.fn().mockImplementation(() => ({ send: vi.fn().mockResolvedValue({}) })),
  PutObjectCommand:   vi.fn(),
  DeleteObjectCommand: vi.fn(),
}))

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://r2.example.com/presigned?sig=abc'),
}))

vi.mock('../workers', () => ({
  enqueueExport:    vi.fn().mockResolvedValue('job-123'),
  enqueueTranscode: vi.fn().mockResolvedValue('job-456'),
  enqueueThumbnail: vi.fn().mockResolvedValue(undefined),
  closeWorkers:     vi.fn().mockResolvedValue(undefined),
}))

import { prisma }          from '../utils/prisma'
import { enqueueExport, enqueueThumbnail } from '../workers'
import { mediaRoutes, projectRoutes }      from '../routes/media.routes'

const TEST_SECRET = 'test-secret-at-least-32-characters-long!!'

async function buildTestApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false })

  await app.register(fastifyCors,      { origin: true })
  await app.register(fastifyJwt,       { secret: TEST_SECRET })
  await app.register(fastifyMultipart, { limits: { fileSize: 100 * 1024 * 1024 } })

  app.addHook('onRequest', async (request) => {
    const auth = request.headers.authorization
    if (auth?.startsWith('Bearer ')) {
      try { request.user = app.jwt.verify(auth.replace('Bearer ', '')) as any }
      catch {}
    }
  })

  await app.register(async (api) => {
    await api.register(mediaRoutes,   { prefix: '/media' })
    await api.register(projectRoutes, { prefix: '/projects' })
  }, { prefix: '/api/v1' })

  return app
}

function makeToken(app: FastifyInstance, overrides = {}) {
  return app.jwt.sign({
    sub: 'user-123', email: 'test@sf.app', username: 'tester',
    plan: 'PRO', emailVerified: true, ...overrides,
  })
}

// ─── Presigned Upload ─────────────────────────────────────────
describe('POST /api/v1/media/presigned-upload', () => {
  let app: FastifyInstance

  beforeEach(async () => { app = await buildTestApp() })
  afterEach(async  () => { await app.close() })

  it('returns presigned URL and assetId', async () => {
    ;(prisma.mediaAsset.create as any).mockResolvedValue({ id: 'asset-1' })

    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/media/presigned-upload',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
      payload: {
        filename:    'myvideo.mp4',
        contentType: 'video/mp4',
        size:        1024 * 1024 * 500,
      },
    })

    expect(res.statusCode).toBe(200)
    const { data } = res.json()
    expect(data.presignedUrl).toContain('presigned')
    expect(data.assetId).toBeDefined()
    expect(data.expiresIn).toBe(900)
  })

  it('rejects non-media content types', async () => {
    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/media/presigned-upload',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
      payload: {
        filename:    'malware.exe',
        contentType: 'application/octet-stream',
        size:        1024,
      },
    })
    expect(res.statusCode).toBe(400)
  })

  it('rejects unauthenticated request', async () => {
    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/media/presigned-upload',
      payload: { filename: 'video.mp4', contentType: 'video/mp4', size: 100 },
    })
    expect(res.statusCode).toBe(401)
  })
})

// ─── Upload Complete ──────────────────────────────────────────
describe('POST /api/v1/media/:assetId/upload-complete', () => {
  let app: FastifyInstance

  beforeEach(async () => { app = await buildTestApp() })
  afterEach(async  () => { await app.close() })

  it('triggers thumbnail generation for video assets', async () => {
    ;(prisma.mediaAsset.findFirst as any).mockResolvedValue({
      id: 'asset-1', userId: 'user-123', mimeType: 'video/mp4', url: 'https://r2.example.com/video.mp4',
    })

    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/media/asset-1/upload-complete',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
    })

    expect(res.statusCode).toBe(200)
    expect(enqueueThumbnail).toHaveBeenCalledWith('asset-1', 'https://r2.example.com/video.mp4')
  })

  it('returns 404 for unknown asset', async () => {
    ;(prisma.mediaAsset.findFirst as any).mockResolvedValue(null)

    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/media/unknown-asset/upload-complete',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
    })
    expect(res.statusCode).toBe(404)
  })
})

// ─── List Assets ──────────────────────────────────────────────
describe('GET /api/v1/media', () => {
  let app: FastifyInstance

  beforeEach(async () => { app = await buildTestApp() })
  afterEach(async  () => { await app.close() })

  it('returns paginated asset list', async () => {
    const mockAssets = [
      { id: 'asset-1', originalName: 'video1.mp4', mimeType: 'video/mp4' },
      { id: 'asset-2', originalName: 'video2.mp4', mimeType: 'video/mp4' },
    ]
    ;(prisma.mediaAsset.findMany as any).mockResolvedValue(mockAssets)
    ;(prisma.mediaAsset.count   as any).mockResolvedValue(2)

    const res = await app.inject({
      method:  'GET',
      url:     '/api/v1/media?page=1&limit=20',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
    })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data).toHaveLength(2)
    expect(body.meta.total).toBe(2)
    expect(body.meta.hasNextPage).toBe(false)
  })
})

// ─── Delete Asset ─────────────────────────────────────────────
describe('DELETE /api/v1/media/:assetId', () => {
  let app: FastifyInstance

  beforeEach(async () => { app = await buildTestApp() })
  afterEach(async  () => { await app.close() })

  it('deletes asset from DB', async () => {
    ;(prisma.mediaAsset.findFirst as any).mockResolvedValue({
      id: 'asset-1', userId: 'user-123', url: 'https://r2.example.com/uploads/user-123/video.mp4',
    })
    ;(prisma.mediaAsset.delete as any).mockResolvedValue({})

    const res = await app.inject({
      method:  'DELETE',
      url:     '/api/v1/media/asset-1',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
    })

    expect(res.statusCode).toBe(200)
    expect(prisma.mediaAsset.delete).toHaveBeenCalledWith({ where: { id: 'asset-1' } })
  })

  it('returns 404 if asset not owned by user', async () => {
    ;(prisma.mediaAsset.findFirst as any).mockResolvedValue(null)

    const res = await app.inject({
      method:  'DELETE',
      url:     '/api/v1/media/not-mine',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
    })
    expect(res.statusCode).toBe(404)
  })
})

// ─── Projects ─────────────────────────────────────────────────
describe('POST /api/v1/projects', () => {
  let app: FastifyInstance

  beforeEach(async () => { app = await buildTestApp() })
  afterEach(async  () => { await app.close() })

  it('creates a project with defaults', async () => {
    const mockProject = {
      id: 'proj-1', title: 'My Film', resolution: '1920x1080', fps: 30, status: 'DRAFT',
    }
    ;(prisma.project.create as any).mockResolvedValue(mockProject)

    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/projects',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
      payload: { title: 'My Film' },
    })

    expect(res.statusCode).toBe(201)
    expect(res.json().data.title).toBe('My Film')
    expect(res.json().data.resolution).toBe('1920x1080')
  })

  it('accepts custom resolution and fps', async () => {
    ;(prisma.project.create as any).mockResolvedValue({
      id: 'proj-2', title: '4K Project', resolution: '3840x2160', fps: 60,
    })

    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/projects',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
      payload: { title: '4K Project', resolution: '3840x2160', fps: 60 },
    })

    expect(res.statusCode).toBe(201)
  })
})

describe('GET /api/v1/projects', () => {
  let app: FastifyInstance

  beforeEach(async () => { app = await buildTestApp() })
  afterEach(async  () => { await app.close() })

  it('lists all non-archived projects', async () => {
    ;(prisma.project.findMany as any).mockResolvedValue([
      { id: 'proj-1', title: 'Draft 1', status: 'DRAFT', exports: [] },
      { id: 'proj-2', title: 'Ready',   status: 'READY', exports: [] },
    ])

    const res = await app.inject({
      method:  'GET',
      url:     '/api/v1/projects',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json().data).toHaveLength(2)
  })
})

// ─── Clips ────────────────────────────────────────────────────
describe('POST /api/v1/projects/:projectId/clips', () => {
  let app: FastifyInstance

  beforeEach(async () => { app = await buildTestApp() })
  afterEach(async  () => { await app.close() })

  it('adds a clip to the timeline', async () => {
    ;(prisma.clip.create as any).mockResolvedValue({
      id: 'clip-1', startTime: 0, endTime: 30, trackIndex: 0,
    })

    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/projects/proj-1/clips',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
      payload: {
        assetUrl:   'https://r2.example.com/video.mp4',
        startTime:  0,
        endTime:    30,
        trackIndex: 0,
      },
    })

    expect(res.statusCode).toBe(201)
    expect(res.json().data.startTime).toBe(0)
  })

  it('rejects clip with missing assetUrl', async () => {
    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/projects/proj-1/clips',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
      payload: { startTime: 0, endTime: 30 },
    })
    expect(res.statusCode).toBe(400)
  })
})

// ─── Export ───────────────────────────────────────────────────
describe('POST /api/v1/projects/:projectId/export', () => {
  let app: FastifyInstance

  beforeEach(async () => { app = await buildTestApp() })
  afterEach(async  () => { await app.close() })

  it('queues an export job and returns exportId', async () => {
    ;(prisma.project.findFirst as any).mockResolvedValue({
      id: 'proj-1', userId: 'user-123', resolution: '1920x1080', fps: 30,
    })
    ;(prisma.export.create as any).mockResolvedValue({
      id: 'export-1', status: 'PENDING', format: 'MP4', resolution: '1920x1080', fps: 30,
    })
    ;(prisma.export.update as any).mockResolvedValue({})

    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/projects/proj-1/export',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
      payload: { format: 'MP4' },
    })

    expect(res.statusCode).toBe(202)
    const { data } = res.json()
    expect(data.exportId).toBe('export-1')
    expect(data.jobId).toBe('job-123')
    expect(enqueueExport).toHaveBeenCalled()
  })

  it('returns 404 for unknown project', async () => {
    ;(prisma.project.findFirst as any).mockResolvedValue(null)

    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/projects/bad-proj/export',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
      payload: { format: 'MP4' },
    })
    expect(res.statusCode).toBe(404)
  })
})

// ─── Export Status ────────────────────────────────────────────
describe('GET /api/v1/projects/:projectId/exports/:exportId', () => {
  let app: FastifyInstance

  beforeEach(async () => { app = await buildTestApp() })
  afterEach(async  () => { await app.close() })

  it('returns export status and download URL when done', async () => {
    ;(prisma.export.findFirst as any).mockResolvedValue({
      id:         'export-1',
      status:     'DONE',
      outputUrl:  'https://r2.example.com/exports/video.mp4',
      progress:   100,
      format:     'MP4',
    })

    const res = await app.inject({
      method:  'GET',
      url:     '/api/v1/projects/proj-1/exports/export-1',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
    })

    expect(res.statusCode).toBe(200)
    const { data } = res.json()
    expect(data.status).toBe('DONE')
    expect(data.outputUrl).toContain('r2.example.com')
    expect(data.progress).toBe(100)
  })
})
