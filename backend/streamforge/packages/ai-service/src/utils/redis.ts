import IORedis from 'ioredis'
import { config } from './config'
import { logger } from './logger'

export const redis = new IORedis(config.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: false,
})

redis.on('connect', () => logger.info('Redis connected'))
redis.on('error',   (err) => logger.error({ err }, 'Redis error'))

// ─── AI-specific key namespaces ───────────────────────────────
export const AiKeys = {
  rateLimit:    (userId: string) => `ai:rl:${userId}`,
  jobResult:    (jobId: string)  => `ai:result:${jobId}`,
  ocrCache:     (hash: string)   => `ai:ocr:${hash}`,
  detectCache:  (hash: string)   => `ai:detect:${hash}`,
  translateCache: (hash: string) => `ai:translate:${hash}`,
} as const

export const AiTTL = {
  RATE_LIMIT:  60,           // 1 minute window
  JOB_RESULT:  60 * 60 * 24, // 24 hours
  OCR_CACHE:   60 * 60 * 24, // 24 hours — same image = same text
  DETECT_CACHE: 60 * 60 * 6, // 6 hours
  TRANSLATE_CACHE: 60 * 60 * 48, // 48 hours
} as const
