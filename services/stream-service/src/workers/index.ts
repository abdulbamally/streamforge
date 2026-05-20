// ============================================================
//  Stream Service — BullMQ Workers
//  Queues:
//    multicast-queue  → spin up / tear down FFmpeg relay jobs
//    recording-queue  → start / stop / upload recording jobs
// ============================================================

import { Worker, Queue } from 'bullmq'
import IORedis from 'ioredis'
import { config } from '../utils/config'
import { MulticastService } from '../services/multicast.service'
import { RecordingService } from '../services/recording.service'
import { logger } from '../utils/logger'
import { prisma } from '../utils/prisma'
import type { MulticastJobData, RecordingJobData, RecordingUploadJobData } from '../types'

// ─── Dedicated Redis connection for BullMQ ────────────────────
// BullMQ requires maxRetriesPerRequest: null
const connection = new IORedis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck:     false,
})

// ─── Singleton services ───────────────────────────────────────
const multicastService = new MulticastService()
const recordingService = new RecordingService()

// ─── Queue definitions (used by other modules to enqueue) ─────
export const multicastQueue = new Queue('multicast-queue', { connection })
export const recordingQueue = new Queue('recording-queue', { connection })

// ─── Multicast Worker ─────────────────────────────────────────
const multicastWorker = new Worker<MulticastJobData>(
  'multicast-queue',
  async (job) => {
    logger.info({ jobId: job.id, jobName: job.name, streamId: job.data.streamId }, 'Processing multicast job')

    switch (job.name) {

      case 'start': {
        await multicastService.startMulticast(job.data)

        // Update all destination statuses to 'live' in DB
        for (const dest of job.data.destinations) {
          await prisma.streamDestination.update({
            where: {
              streamId_destinationId: {
                streamId:      job.data.streamId,
                destinationId: dest.destinationId,
              },
            },
            data: { status: 'live', startedAt: new Date() },
          }).catch(() => {}) // Non-fatal — may not exist yet
        }

        logger.info({ streamId: job.data.streamId }, 'Multicast started successfully')
        return { started: true, destinations: job.data.destinations.length }
      }

      case 'stop': {
        const { streamId } = job.data
        await multicastService.stopMulticast(streamId)

        // Mark all destinations ended in DB
        await prisma.streamDestination.updateMany({
          where: { streamId, status: 'live' },
          data:  { status: 'ended' },
        }).catch(() => {})

        logger.info({ streamId }, 'Multicast stopped successfully')
        return { stopped: true }
      }

      default:
        throw new Error(`Unknown multicast job: ${job.name}`)
    }
  },
  {
    connection,
    // Only 1 concurrent multicast controller — prevents race conditions
    concurrency: 1,
  }
)

// ─── Recording Worker ─────────────────────────────────────────
const recordingWorker = new Worker<RecordingJobData | RecordingUploadJobData>(
  'recording-queue',
  async (job) => {
    logger.info({ jobId: job.id, jobName: job.name }, 'Processing recording job')

    switch (job.name) {

      case 'start': {
        const data = job.data as RecordingJobData
        await recordingService.startRecording(data)
        logger.info({ streamId: data.streamId }, 'Recording started')
        return { recording: true }
      }

      case 'stop': {
        const { streamId } = job.data as RecordingJobData
        await recordingService.stopRecording(streamId)
        logger.info({ streamId }, 'Recording stopped')
        return { stopped: true }
      }

      default:
        throw new Error(`Unknown recording job: ${job.name}`)
    }
  },
  {
    connection,
    concurrency: 3, // Up to 3 concurrent recordings
  }
)

// ─── Worker event handlers ─────────────────────────────────────
for (const [name, worker] of [
  ['multicast', multicastWorker],
  ['recording', recordingWorker],
] as const) {
  worker.on('completed', (job) => {
    logger.info({ jobId: job.id, queue: name }, 'Job completed')
  })

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, queue: name, err: err.message }, 'Job failed')
  })

  worker.on('stalled', (jobId) => {
    logger.warn({ jobId, queue: name }, 'Job stalled — will retry')
  })

  worker.on('error', (err) => {
    logger.error({ queue: name, err: err.message }, 'Worker error')
  })
}

// ─── Enqueue helpers ──────────────────────────────────────────
export async function enqueueMulticastStart(data: MulticastJobData): Promise<string> {
  const job = await multicastQueue.add('start', data, {
    attempts:         2,
    backoff:          { type: 'fixed', delay: 3000 },
    removeOnComplete: 50,
    removeOnFail:     20,
  })
  logger.info({ jobId: job.id, streamId: data.streamId }, 'Multicast start job enqueued')
  return job.id!
}

export async function enqueueMulticastStop(streamId: string, userId: string): Promise<string> {
  const job = await multicastQueue.add(
    'stop',
    { streamId, userId, streamKey: '', destinations: [] } satisfies MulticastJobData,
    {
      attempts:         3,
      backoff:          { type: 'fixed', delay: 2000 },
      removeOnComplete: 50,
    }
  )
  logger.info({ jobId: job.id, streamId }, 'Multicast stop job enqueued')
  return job.id!
}

export async function enqueueRecordingStart(data: RecordingJobData): Promise<string> {
  const job = await recordingQueue.add('start', data, {
    attempts:         2,
    backoff:          { type: 'fixed', delay: 3000 },
    removeOnComplete: 50,
    removeOnFail:     20,
  })
  logger.info({ jobId: job.id, streamId: data.streamId }, 'Recording start job enqueued')
  return job.id!
}

export async function enqueueRecordingStop(streamId: string): Promise<string> {
  const job = await recordingQueue.add(
    'stop',
    { streamId, userId: '', streamKey: '', outputPath: '' } satisfies RecordingJobData,
    {
      attempts: 3,
      removeOnComplete: 50,
    }
  )
  logger.info({ jobId: job.id, streamId }, 'Recording stop job enqueued')
  return job.id!
}

// ─── Graceful shutdown ────────────────────────────────────────
export async function closeStreamWorkers(): Promise<void> {
  logger.info('Closing stream workers...')
  await Promise.all([
    multicastWorker.close(),
    recordingWorker.close(),
    connection.quit(),
  ])
  logger.info('Stream workers closed')
}
