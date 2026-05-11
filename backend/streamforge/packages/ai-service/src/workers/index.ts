// ============================================================
//  AI Service — BullMQ Workers
//  Queue: ai-queue — handles async detection, OCR, translation
// ============================================================

import { Worker, Queue } from 'bullmq'
import IORedis from 'ioredis'
import { config }          from '../utils/config'
import { logger }          from '../utils/logger'
import { redis, AiKeys, AiTTL } from '../utils/redis'
import { VisionService }   from '../services/vision.service'
import { OcrService }      from '../services/ocr.service'
import { TranslationService } from '../services/translation.service'
import { SceneService }    from '../services/scene.service'
import type { DetectionJobData, OcrJobData, TranslationJobData, SceneDescriptionJobData } from '../types'

const connection = new IORedis(config.REDIS_URL, { maxRetriesPerRequest: null, enableReadyCheck: false })

const vision      = new VisionService()
const ocr         = new OcrService()
const translation = new TranslationService()
const scene       = new SceneService()

export const aiQueue = new Queue('ai-queue', { connection })

// ─── AI Worker ────────────────────────────────────────────────
const aiWorker = new Worker(
  'ai-queue',
  async (job) => {
    logger.info({ jobId: job.id, name: job.name }, 'Processing AI job')

    switch (job.name) {
      case 'detect': {
        const data   = job.data as DetectionJobData
        const result = await vision.detect(data.imageUrl, data.features)
        await redis.setex(AiKeys.jobResult(data.jobId), AiTTL.JOB_RESULT, JSON.stringify({ status: 'done', data: result }))
        return result
      }

      case 'ocr': {
        const data   = job.data as OcrJobData
        const result = await ocr.extractText(data.imageUrl, data.language)
        await redis.setex(AiKeys.jobResult(data.jobId), AiTTL.JOB_RESULT, JSON.stringify({ status: 'done', data: result }))
        return result
      }

      case 'translate': {
        const data = job.data as TranslationJobData
        const result = Array.isArray(data.text)
          ? await translation.translateBatch(data.text, data.targetLanguage, data.sourceLanguage)
          : await translation.translate(data.text, data.targetLanguage, data.sourceLanguage)
        await redis.setex(AiKeys.jobResult(data.jobId), AiTTL.JOB_RESULT, JSON.stringify({ status: 'done', data: result }))
        return result
      }

      case 'scene-describe': {
        const data   = job.data as SceneDescriptionJobData
        const result = await scene.describe(data.imageUrl, data.context)
        await redis.setex(AiKeys.jobResult(data.jobId), AiTTL.JOB_RESULT, JSON.stringify({ status: 'done', data: result }))
        return result
      }

      default:
        throw new Error(`Unknown AI job type: ${job.name}`)
    }
  },
  {
    connection,
    concurrency: 5,
    limiter: { max: 50, duration: 60_000 },
  }
)

aiWorker.on('completed', (job) => logger.info({ jobId: job.id }, 'AI job completed'))
aiWorker.on('failed',    (job, err) => logger.error({ jobId: job?.id, err: err.message }, 'AI job failed'))

// ─── Enqueue helpers ──────────────────────────────────────────
export async function enqueueDetection(data: DetectionJobData): Promise<string> {
  const job = await aiQueue.add('detect', data, { attempts: 2, backoff: { type: 'fixed', delay: 2000 } })
  await redis.setex(AiKeys.jobResult(data.jobId), AiTTL.JOB_RESULT, JSON.stringify({ status: 'pending' }))
  return job.id!
}

export async function enqueueOcr(data: OcrJobData): Promise<string> {
  const job = await aiQueue.add('ocr', data, { attempts: 2, backoff: { type: 'fixed', delay: 2000 } })
  await redis.setex(AiKeys.jobResult(data.jobId), AiTTL.JOB_RESULT, JSON.stringify({ status: 'pending' }))
  return job.id!
}

export async function enqueueTranslation(data: TranslationJobData): Promise<string> {
  const job = await aiQueue.add('translate', data, { attempts: 2 })
  await redis.setex(AiKeys.jobResult(data.jobId), AiTTL.JOB_RESULT, JSON.stringify({ status: 'pending' }))
  return job.id!
}

export async function closeAiWorkers(): Promise<void> {
  await aiWorker.close()
  await connection.quit()
}
