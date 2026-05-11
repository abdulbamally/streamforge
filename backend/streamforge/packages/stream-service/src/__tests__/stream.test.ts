// ============================================================
//  Stream Service Tests
//  Tests: stream CRUD, scene management, destination limits,
//         stream key endpoint, force-end stream
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Fastify, { type FastifyInstance } from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCors from '@fastify/cors'

// ─── Mock heavy dependencies before imports ───────────────────
vi.mock('../utils/prisma', () => ({
  prisma: {
    stream:            { create: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    scene:             { create: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn() },
    source:            { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
    destination:       { create: vi.fn(), count: vi.fn() },
    streamDestination: { create: vi.fn(), deleteMany: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    streamAnalytic:    { create: vi.fn() },
  },
}))

vi.mock('../utils/redis', () => ({
  redis:       { quit: vi.fn() },
  redisSub:    { subscribe: vi.fn(), unsubscribe: vi.fn(), on: vi.fn() },
  redisPub:    { publish: vi.fn() },
  streamRedis: {
    getLiveState:           vi.fn(),
    setLiveState:           vi.fn(),
    updateLiveState:        vi.fn(),
    deleteLiveState:        vi.fn(),
    getUserActiveStream:    vi.fn(),
    setUserActiveStream:    vi.fn(),
    clearUserActiveStream:  vi.fn(),
    setRtmpSession:         vi.fn(),
    getRtmpSession:         vi.fn(),
    deleteRtmpSession:      vi.fn(),
    clearFFmpegPids:        vi.fn(),
    addFFmpegPid:           vi.fn(),
  },
}))

vi.mock('../services/multicast.service', () => ({
  MulticastService: vi.fn().mockImplementation(() => ({
    startMulticast: vi.fn().mockResolvedValue(undefined),
    stopMulticast:  vi.fn().mockResolvedValue(undefined),
  })),
}))

vi.mock('../services/scene.service', () => ({
  SceneService: vi.fn().mockImplementation(() => ({
    createScene:        vi.fn(),
    getScenesForStream: vi.fn(),
    switchActiveScene:  vi.fn(),
    createSource:       vi.fn(),
    updateSource:       vi.fn(),
  })),
}))

import { prisma }           from '../utils/prisma'
import { streamRedis }      from '../utils/redis'
import { MulticastService } from '../services/multicast.service'
import { SceneService }     from '../services/scene.service'
import { streamRoutes }     from '../routes/stream.routes'

// ─── Test app builder ─────────────────────────────────────────
const TEST_SECRET = 'test-secret-at-least-32-characters-long!!'

async function buildTestApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false })

  await app.register(fastifyCors,   { origin: true })
  await app.register(fastifyJwt,    { secret: TEST_SECRET })

  // Attach mock user to every request (simulate authenticate middleware)
  app.addHook('onRequest', async (request) => {
    const auth = request.headers.authorization
    if (auth?.startsWith('Bearer ')) {
      try {
        request.user = app.jwt.verify(auth.replace('Bearer ', '')) as any
      } catch {}
    }
  })

  const multicast    = new MulticastService()
  const sceneService = new SceneService()

  await app.register(
    async (api) => {
      await api.register(
        (router: any) => streamRoutes(router, { multicast, sceneService }),
        { prefix: '/streams' }
      )
    },
    { prefix: '/api/v1' }
  )

  return app
}

function makeToken(app: FastifyInstance, overrides = {}) {
  return app.jwt.sign({
    sub:           'user-123',
    email:         'test@streamforge.app',
    username:      'testuser',
    plan:          'PRO',
    emailVerified: true,
    ...overrides,
  })
}

// ─── Stream CRUD ──────────────────────────────────────────────
describe('POST /api/v1/streams', () => {
  let app: FastifyInstance

  beforeEach(async () => { app = await buildTestApp() })
  afterEach(async  () => { await app.close() })

  it('creates a stream and default scene', async () => {
    const mockStream = { id: 'stream-1', userId: 'user-123', title: 'My Stream', streamKey: 'key-abc', status: 'IDLE', createdAt: new Date() }
    ;(prisma.stream.create as any).mockResolvedValue(mockStream)
    ;(prisma.scene.create  as any).mockResolvedValue({ id: 'scene-1', name: 'Main Scene' })

    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/streams',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
      payload: { title: 'My Stream' },
    })

    expect(res.statusCode).toBe(201)
    expect(res.json().data.title).toBe('My Stream')
    expect(prisma.scene.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ name: 'Main Scene' }) })
    )
  })

  it('rejects unauthenticated request', async () => {
    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/streams',
      payload: { title: 'My Stream' },
    })
    expect(res.statusCode).toBe(401)
  })

  it('rejects empty title', async () => {
    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/streams',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
      payload: { title: '' },
    })
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/v1/streams', () => {
  let app: FastifyInstance

  beforeEach(async () => { app = await buildTestApp() })
  afterEach(async  () => { await app.close() })

  it('returns list of streams for authenticated user', async () => {
    const mockStreams = [
      { id: 'stream-1', title: 'Stream 1', status: 'IDLE' },
      { id: 'stream-2', title: 'Stream 2', status: 'ENDED' },
    ]
    ;(prisma.stream.findMany as any).mockResolvedValue(mockStreams)

    const res = await app.inject({
      method:  'GET',
      url:     '/api/v1/streams',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json().data).toHaveLength(2)
  })
})

describe('GET /api/v1/streams/:streamId', () => {
  let app: FastifyInstance

  beforeEach(async () => { app = await buildTestApp() })
  afterEach(async  () => { await app.close() })

  it('returns stream with live state from Redis', async () => {
    const mockStream = {
      id: 'stream-1', title: 'Live Now', status: 'LIVE',
      destinations: [], scenes: [], recording: null,
    }
    const mockLiveState = { streamId: 'stream-1', status: 'LIVE', viewerCount: 42 }

    ;(prisma.stream.findFirst     as any).mockResolvedValue(mockStream)
    ;(streamRedis.getLiveState    as any).mockResolvedValue(mockLiveState)

    const res = await app.inject({
      method:  'GET',
      url:     '/api/v1/streams/stream-1',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json().data.liveState.viewerCount).toBe(42)
  })

  it('returns 404 for unknown stream', async () => {
    ;(prisma.stream.findFirst as any).mockResolvedValue(null)

    const res = await app.inject({
      method:  'GET',
      url:     '/api/v1/streams/nonexistent',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
    })

    expect(res.statusCode).toBe(404)
    expect(res.json().error.code).toBe('SRV_002')
  })
})

// ─── Stream Key ───────────────────────────────────────────────
describe('GET /api/v1/streams/:streamId/key', () => {
  let app: FastifyInstance

  beforeEach(async () => { app = await buildTestApp() })
  afterEach(async  () => { await app.close() })

  it('returns stream key and ingest URL', async () => {
    ;(prisma.stream.findFirst as any).mockResolvedValue({ id: 'stream-1', streamKey: 'abc123' })

    const res = await app.inject({
      method:  'GET',
      url:     '/api/v1/streams/stream-1/key',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
    })

    expect(res.statusCode).toBe(200)
    const { data } = res.json()
    expect(data.streamKey).toBe('abc123')
    expect(data.fullUrl).toContain('abc123')
  })
})

// ─── Destinations ─────────────────────────────────────────────
describe('POST /api/v1/streams/:streamId/destinations', () => {
  let app: FastifyInstance

  beforeEach(async () => { app = await buildTestApp() })
  afterEach(async  () => { await app.close() })

  it('adds a destination within plan limit', async () => {
    ;(prisma.destination.count  as any).mockResolvedValue(0) // 0 existing
    ;(prisma.destination.create as any).mockResolvedValue({ id: 'dest-1', platform: 'YOUTUBE' })
    ;(prisma.streamDestination.create as any).mockResolvedValue({})

    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/streams/stream-1/destinations',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
      payload: {
        platform:  'YOUTUBE',
        label:     'My YouTube',
        rtmpUrl:   'rtmp://a.rtmp.youtube.com/live2',
        streamKey: 'xxxx-xxxx-xxxx',
      },
    })

    expect(res.statusCode).toBe(201)
    expect(res.json().data.platform).toBe('YOUTUBE')
  })

  it('blocks FREE plan exceeding 1 destination', async () => {
    ;(prisma.destination.count as any).mockResolvedValue(1) // Already at limit

    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/streams/stream-1/destinations',
      headers: { Authorization: `Bearer ${makeToken(app, { plan: 'FREE' })}` },
      payload: {
        platform:  'TWITCH',
        label:     'My Twitch',
        rtmpUrl:   'rtmp://live.twitch.tv/app',
        streamKey: 'live_xxxx',
      },
    })

    expect(res.statusCode).toBe(403)
    expect(res.json().error.code).toBe('AUTHZ_003')
  })
})

// ─── Force End Stream ─────────────────────────────────────────
describe('POST /api/v1/streams/:streamId/end', () => {
  let app: FastifyInstance

  beforeEach(async () => { app = await buildTestApp() })
  afterEach(async  () => { await app.close() })

  it('ends stream and cleans up Redis state', async () => {
    ;(prisma.stream.findFirst  as any).mockResolvedValue({ id: 'stream-1', userId: 'user-123' })
    ;(prisma.stream.update     as any).mockResolvedValue({})
    ;(streamRedis.deleteLiveState       as any).mockResolvedValue(undefined)
    ;(streamRedis.clearUserActiveStream as any).mockResolvedValue(undefined)

    const multicast = new MulticastService()

    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/streams/stream-1/end',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
    })

    expect(res.statusCode).toBe(200)
    expect(multicast.stopMulticast).toHaveBeenCalledWith('stream-1')
    expect(streamRedis.deleteLiveState).toHaveBeenCalledWith('stream-1')
  })

  it('returns 404 for stream not owned by user', async () => {
    ;(prisma.stream.findFirst as any).mockResolvedValue(null)

    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/streams/not-mine/end',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
    })

    expect(res.statusCode).toBe(404)
  })
})

// ─── Scene Management ─────────────────────────────────────────
describe('POST /api/v1/streams/:streamId/scenes', () => {
  let app: FastifyInstance

  beforeEach(async () => { app = await buildTestApp() })
  afterEach(async  () => { await app.close() })

  it('creates a scene', async () => {
    const sceneService = new SceneService()
    ;(sceneService.createScene as any).mockResolvedValue({ id: 'scene-2', name: 'Gaming Scene', order: 1 })

    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/streams/stream-1/scenes',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
      payload: { name: 'Gaming Scene', order: 1 },
    })

    expect(res.statusCode).toBe(201)
  })
})

describe('POST /api/v1/streams/:streamId/scenes/:sceneId/switch', () => {
  let app: FastifyInstance

  beforeEach(async () => { app = await buildTestApp() })
  afterEach(async  () => { await app.close() })

  it('switches active scene', async () => {
    const sceneService = new SceneService()
    ;(sceneService.switchActiveScene as any).mockResolvedValue(undefined)

    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/streams/stream-1/scenes/scene-2/switch',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
    })

    expect(res.statusCode).toBe(200)
    expect(sceneService.switchActiveScene).toHaveBeenCalledWith('stream-1', 'user-123', 'scene-2')
  })
})
