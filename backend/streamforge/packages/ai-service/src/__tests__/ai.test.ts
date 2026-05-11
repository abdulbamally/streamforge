// ============================================================
//  AI Service Tests
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Fastify, { type FastifyInstance } from 'fastify'
import fastifyJwt  from '@fastify/jwt'
import fastifyCors from '@fastify/cors'

vi.mock('../utils/redis', () => ({
  redis:  { get: vi.fn(), setex: vi.fn(), incr: vi.fn().mockResolvedValue(1), expire: vi.fn(), quit: vi.fn() },
  AiKeys: { rateLimit: (id: string) => `ai:rl:${id}`, detectCache: (h: string) => `ai:detect:${h}`, ocrCache: (h: string) => `ai:ocr:${h}`, translateCache: (h: string) => `ai:translate:${h}`, jobResult: (id: string) => `ai:result:${id}` },
  AiTTL:  { RATE_LIMIT: 60, JOB_RESULT: 86400, OCR_CACHE: 86400, DETECT_CACHE: 21600, TRANSLATE_CACHE: 172800 },
}))

vi.mock('../services/vision.service', () => ({
  VisionService: vi.fn().mockImplementation(() => ({
    detect: vi.fn().mockResolvedValue({
      objects: [{ name: 'Person', confidence: 0.98, boundingBox: { x: 0.1, y: 0.1, width: 0.3, height: 0.6 }, category: 'Person' }],
      labels:  [{ name: 'Gaming', confidence: 0.95, topicality: 0.9 }],
      faces:   [],
      safeSearch: { adult: 'VERY_UNLIKELY', violence: 'VERY_UNLIKELY', racy: 'UNLIKELY' },
      processedAt: new Date().toISOString(),
    }),
  })),
}))

vi.mock('../services/ocr.service', () => ({
  OcrService: vi.fn().mockImplementation(() => ({
    extractText: vi.fn().mockResolvedValue({
      fullText: 'Hello World',
      blocks: [{ text: 'Hello World', confidence: 0.99, boundingBox: { x: 0, y: 0, width: 0.5, height: 0.1 }, language: 'en' }],
      confidence: 0.99,
      language: 'en',
      processedAt: new Date().toISOString(),
    }),
  })),
}))

vi.mock('../services/translation.service', () => ({
  TranslationService: vi.fn().mockImplementation(() => ({
    translate: vi.fn().mockResolvedValue({
      originalText: 'Hello', translatedText: 'Hola',
      sourceLanguage: 'en', targetLanguage: 'es',
      confidence: 1.0, processedAt: new Date().toISOString(),
    }),
    translateBatch: vi.fn().mockResolvedValue({ results: [], totalCharacters: 0, processedAt: new Date().toISOString() }),
    detectLanguage: vi.fn().mockResolvedValue({ language: 'en', confidence: 0.99 }),
    getSupportedLanguages: vi.fn().mockReturnValue(['en', 'es', 'fr', 'de']),
  })),
}))

vi.mock('../services/scene.service', () => ({
  SceneService: vi.fn().mockImplementation(() => ({
    describe:       vi.fn().mockResolvedValue({ description: 'A gamer at a desk', tags: ['gaming', 'indoor'], mood: 'focused', suggestedTitle: 'Epic Gaming Session', processedAt: new Date().toISOString() }),
    suggestTitles:  vi.fn().mockResolvedValue(['Title 1', 'Title 2', 'Title 3']),
  })),
}))

import { aiRoutes } from '../routes/ai.routes'

const TEST_SECRET = 'test-secret-at-least-32-characters-long!!'

async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false })
  await app.register(fastifyCors,  { origin: true })
  await app.register(fastifyJwt,   { secret: TEST_SECRET })

  app.addHook('onRequest', async (request) => {
    const auth = request.headers.authorization
    if (auth?.startsWith('Bearer ')) {
      try { request.user = app.jwt.verify(auth.replace('Bearer ', '')) as any } catch {}
    }
  })

  await app.register(async (api) => {
    await api.register(aiRoutes, { prefix: '/ai' })
  }, { prefix: '/api/v1' })

  return app
}

function makeToken(app: FastifyInstance, plan = 'PRO') {
  return app.jwt.sign({ sub: 'user-123', email: 'test@sf.app', username: 'tester', plan, emailVerified: true })
}

// ─── Object Detection ─────────────────────────────────────────
describe('POST /api/v1/ai/detect', () => {
  let app: FastifyInstance
  beforeEach(async () => { app = await buildApp() })
  afterEach(async  () => { await app.close() })

  it('detects objects in an image', async () => {
    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/ai/detect',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
      payload: { imageUrl: 'https://example.com/frame.jpg', features: ['OBJECT_DETECTION'] },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().data.objects[0].name).toBe('Person')
    expect(res.json().data.objects[0].confidence).toBe(0.98)
  })

  it('blocks FREE plan users', async () => {
    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/ai/detect',
      headers: { Authorization: `Bearer ${makeToken(app, 'FREE')}` },
      payload: { imageUrl: 'https://example.com/frame.jpg', features: ['OBJECT_DETECTION'] },
    })
    expect(res.statusCode).toBe(403)
    expect(res.json().error.code).toBe('AUTHZ_003')
  })

  it('rejects unauthenticated request', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/v1/ai/detect', payload: { imageUrl: 'https://example.com/frame.jpg' } })
    expect(res.statusCode).toBe(401)
  })

  it('rejects invalid image URL', async () => {
    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/ai/detect',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
      payload: { imageUrl: 'not-a-url', features: ['OBJECT_DETECTION'] },
    })
    expect(res.statusCode).toBe(400)
  })
})

// ─── OCR ──────────────────────────────────────────────────────
describe('POST /api/v1/ai/ocr', () => {
  let app: FastifyInstance
  beforeEach(async () => { app = await buildApp() })
  afterEach(async  () => { await app.close() })

  it('extracts text from an image', async () => {
    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/ai/ocr',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
      payload: { imageUrl: 'https://example.com/frame.jpg' },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().data.fullText).toBe('Hello World')
    expect(res.json().data.language).toBe('en')
  })
})

// ─── Translation ──────────────────────────────────────────────
describe('POST /api/v1/ai/translate', () => {
  let app: FastifyInstance
  beforeEach(async () => { app = await buildApp() })
  afterEach(async  () => { await app.close() })

  it('translates a single string', async () => {
    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/ai/translate',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
      payload: { text: 'Hello', targetLanguage: 'es' },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().data.translatedText).toBe('Hola')
    expect(res.json().data.targetLanguage).toBe('es')
  })

  it('rejects text exceeding 5000 characters', async () => {
    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/ai/translate',
      headers: { Authorization: `Bearer ${makeToken(app)}` },
      payload: { text: 'a'.repeat(5001), targetLanguage: 'es' },
    })
    expect(res.statusCode).toBe(400)
  })
})

// ─── Scene Description ────────────────────────────────────────
describe('POST /api/v1/ai/scene/describe', () => {
  let app: FastifyInstance
  beforeEach(async () => { app = await buildApp() })
  afterEach(async  () => { await app.close() })

  it('returns scene description with tags and mood', async () => {
    const res = await app.inject({
      method:  'POST',
      url:     '/api/v1/ai/scene/describe',
      headers: { Authorization: `Bearer ${makeToken(app, 'CREATOR')}` },
      payload: { imageUrl: 'https://example.com/scene.jpg', context: 'gaming stream' },
    })
    expect(res.statusCode).toBe(200)
    const { data } = res.json()
    expect(data.description).toBeTruthy()
    expect(data.tags).toBeInstanceOf(Array)
    expect(data.mood).toBeTruthy()
  })
})

// ─── Languages ────────────────────────────────────────────────
describe('GET /api/v1/ai/languages', () => {
  let app: FastifyInstance
  beforeEach(async () => { app = await buildApp() })
  afterEach(async  () => { await app.close() })

  it('returns supported language list without auth', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/ai/languages' })
    expect(res.statusCode).toBe(200)
    expect(res.json().data.languages).toBeInstanceOf(Array)
  })
})
