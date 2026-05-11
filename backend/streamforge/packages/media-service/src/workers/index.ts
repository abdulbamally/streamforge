// ============================================================
//  BullMQ Workers — Async job processing
//  Queues: export-queue, transcode-queue, thumbnail-queue
// ============================================================

import { Worker, Queue, QueueEvents } from 'bullmq'
import IORedis from 'ioredis'
import { config } from '../utils/config'
import { EditorService } from '../services/editor.service'
import { logger } from '../utils/logger'
import { prisma } from '../utils/prisma'
import type { ExportJob, TrimJob, ExtractAudioJob, ColorGradeJob, ThumbnailJob } from '../services/editor.service'

const connection = new IORedis(config.REDIS_URL, { maxRetriesPerRequest: null })

const editorService = new EditorService()

// ─── Queue definitions ────────────────────────────────────────
export const exportQueue     = new Queue('export-queue',     { connection })
export const transcodeQueue  = new Queue('transcode-queue',  { connection })
export const thumbnailQueue  = new Queue('thumbnail-queue',  { connection })

// ─── Export Worker ───────────────────────────────────────────
const exportWorker = new Worker<ExportJob>(
  'export-queue',
  async (job) => {
    logger.info({ jobId: job.id, exportId: job.data.exportId }, 'Processing export job')

    // Update progress callback
    const updateProgress = async (progress: number) => {
      await job.updateProgress(progress)
      await prisma.export.update({
        where: { id: job.data.exportId },
        data:  { progress },
      })
    }

    await updateProgress(5)
    const url = await editorService.exportProject(job.data)
    await updateProgress(100)

    return { url }
  },
  {
    connection,
    concurrency: 2,                // Max 2 exports at once per worker
    limiter: {
      max:      5,
      duration: 60_000,           // Max 5 exports per minute globally
    },
  }
)

// ─── Transcode Worker ─────────────────────────────────────────
const transcodeWorker = new Worker<TrimJob | ColorGradeJob | ExtractAudioJob>(
  'transcode-queue',
  async (job) => {
    logger.info({ jobId: job.id, jobName: job.name }, 'Processing transcode job')

    switch (job.name) {
      case 'trim':
        return editorService.trimClip(job.data as TrimJob)

      case 'color-grade':
        return editorService.applyColorGrade(job.data as ColorGradeJob)

      case 'extract-audio':
        return editorService.extractAudio(job.data as ExtractAudioJob)

      default:
        throw new Error(`Unknown job type: ${job.name}`)
    }
  },
  { connection, concurrency: 4 }
)

// ─── Thumbnail Worker ─────────────────────────────────────────
const thumbnailWorker = new Worker<{ assetUrl: string; assetId: string; timestamp?: number }>(
  'thumbnail-queue',
  async (job) => {
    const url = await editorService.generateThumbnail(job.data.assetUrl, job.data.timestamp)

    await prisma.mediaAsset.update({
      where: { id: job.data.assetId },
      data:  { thumbnailUrl: url },
    })

    return { url }
  },
  { connection, concurrency: 10 }
)

// ─── Worker event handlers ────────────────────────────────────
for (const [name, worker] of [
  ['export', exportWorker],
  ['transcode', transcodeWorker],
  ['thumbnail', thumbnailWorker],
] as const) {
  worker.on('completed', (job) => {
    logger.info({ jobId: job.id, queue: name }, 'Job completed')
  })

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, queue: name, err }, 'Job failed')
  })

  worker.on('stalled', (jobId) => {
    logger.warn({ jobId, queue: name }, 'Job stalled')
  })
}

// ─── Queue helper — enqueue an export ────────────────────────
export async function enqueueExport(data: ExportJob): Promise<string> {
  const job = await exportQueue.add('export', data, {
    attempts:  3,
    backoff:   { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail:     50,
  })
  logger.info({ jobId: job.id, exportId: data.exportId }, 'Export job enqueued')
  return job.id!
}

export async function enqueueTranscode(
  name: 'trim' | 'color-grade' | 'extract-audio',
  data: TrimJob | ColorGradeJob | ExtractAudioJob
): Promise<string> {
  const job = await transcodeQueue.add(name, data, {
    attempts: 2,
    backoff:  { type: 'fixed', delay: 3000 },
  })
  return job.id!
}

export async function enqueueThumbnail(assetId: string, assetUrl: string): Promise<void> {
  await thumbnailQueue.add('thumbnail', { assetId, assetUrl }, {
    priority: 1, // Low priority
    attempts: 2,
  })
}

// ─── Graceful shutdown ────────────────────────────────────────
export async function closeWorkers(): Promise<void> {
  await Promise.all([
    exportWorker.close(),
    transcodeWorker.close(),
    thumbnailWorker.close(),
    connection.quit(),
  ])
}
