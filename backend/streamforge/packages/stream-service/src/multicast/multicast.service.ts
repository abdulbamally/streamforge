// ============================================================
//  MulticastService — Fan-out RTMP to N platforms via FFmpeg
//
//  Architecture:
//    OBS/Mobile → RTMP Ingest → FFmpeg (re-stream) → YouTube
//                                                   → Twitch
//                                                   → Facebook
//                                                   → TikTok
//
//  One FFmpeg process per destination. Processes supervised
//  with auto-restart on failure (up to MAX_RETRIES).
// ============================================================

import ffmpeg from 'fluent-ffmpeg'
import { EventEmitter } from 'events'
import { config } from '../utils/config'
import { streamRedis } from '../utils/redis'
import { prisma } from '../utils/prisma'
import { logger } from '../utils/logger'
import type { MulticastJobData, DestinationState, Platform } from '../types'

const MAX_RETRIES  = 3
const RETRY_DELAY  = 5000 // ms

interface ManagedProcess {
  destinationId: string
  platform:      Platform
  label:         string
  command:       ffmpeg.FfmpegCommand
  retries:       number
  startedAt:     Date
}

export class MulticastService extends EventEmitter {
  // streamId → Map<destinationId, ManagedProcess>
  private processes = new Map<string, Map<string, ManagedProcess>>()

  constructor() {
    super()
    ffmpeg.setFfmpegPath(config.FFMPEG_PATH)
    ffmpeg.setFfprobePath(config.FFPROBE_PATH)
  }

  // ─── Start multicast for all destinations ──────────────────
  async startMulticast(job: MulticastJobData): Promise<void> {
    logger.info(
      { streamId: job.streamId, count: job.destinations.length },
      'Starting multicast'
    )

    const processMap = new Map<string, ManagedProcess>()
    this.processes.set(job.streamId, processMap)

    // Launch FFmpeg process per destination (parallel)
    await Promise.allSettled(
      job.destinations.map(dest =>
        this.startDestination(job.streamId, job.streamKey, dest, processMap)
      )
    )
  }

  // ─── Start a single destination process ────────────────────
  private async startDestination(
    streamId:   string,
    streamKey:  string,
    dest:       MulticastJobData['destinations'][0],
    processMap: Map<string, ManagedProcess>,
    retries = 0
  ): Promise<void> {
    const ingestUrl  = `${config.RTMP_INGEST_URL}/${streamKey}`
    const outputUrl  = `${dest.rtmpUrl}/${dest.streamKey}`

    logger.info({ streamId, platform: dest.platform, outputUrl: dest.rtmpUrl }, 'Starting FFmpeg relay')

    return new Promise((resolve) => {
      const cmd = ffmpeg(ingestUrl)
        // Input options
        .inputOptions([
          '-re',             // Read at native frame rate
          '-fflags nobuffer',
          '-flags low_delay',
          '-analyzeduration 1000000',
          '-probesize 1000000',
        ])
        // Video passthrough (no re-encode = zero latency)
        .videoCodec('copy')
        // Audio passthrough
        .audioCodec('copy')
        // Output options
        .outputOptions([
          '-f flv',
          '-flvflags no_duration_filesize',
          // Reconnect on network hiccups
          '-reconnect 1',
          '-reconnect_streamed 1',
          '-reconnect_delay_max 5',
        ])
        .output(outputUrl)

      const managed: ManagedProcess = {
        destinationId: dest.destinationId,
        platform:      dest.platform,
        label:         dest.platform,
        command:       cmd,
        retries,
        startedAt:     new Date(),
      }
      processMap.set(dest.destinationId, managed)

      cmd
        .on('start', async (cmdLine) => {
          logger.debug({ cmdLine }, 'FFmpeg started')

          // Update destination status in Redis
          const state = await streamRedis.getLiveState(streamId)
          if (state) {
            const destinations = state.destinations.map(d =>
              d.destinationId === dest.destinationId
                ? { ...d, status: 'live' as const, startedAt: new Date() }
                : d
            )
            await streamRedis.updateLiveState(streamId, { destinations })
          }

          // Update DB
          await prisma.streamDestination.update({
            where: {
              streamId_destinationId: {
                streamId,
                destinationId: dest.destinationId,
              },
            },
            data: { status: 'live', startedAt: new Date() },
          })

          resolve()
        })
        .on('error', async (err) => {
          logger.error({ err, platform: dest.platform, retries }, 'FFmpeg relay error')

          // Auto-restart with backoff
          if (retries < MAX_RETRIES) {
            logger.info({ platform: dest.platform, attempt: retries + 1 }, 'Retrying FFmpeg relay')
            await this.updateDestinationStatus(streamId, dest.destinationId, 'connecting')
            setTimeout(() => {
              this.startDestination(streamId, streamKey, dest, processMap, retries + 1)
            }, RETRY_DELAY * (retries + 1))
          } else {
            logger.error({ platform: dest.platform }, 'Max retries reached — destination failed')
            await this.updateDestinationStatus(streamId, dest.destinationId, 'error', err.message)
            processMap.delete(dest.destinationId)
          }
        })
        .on('end', async () => {
          logger.info({ platform: dest.platform }, 'FFmpeg relay ended cleanly')
          processMap.delete(dest.destinationId)
          await this.updateDestinationStatus(streamId, dest.destinationId, 'ended')
        })

      cmd.run()
    })
  }

  // ─── Stop all processes for a stream ──────────────────────
  async stopMulticast(streamId: string): Promise<void> {
    const processMap = this.processes.get(streamId)
    if (!processMap) return

    logger.info({ streamId, count: processMap.size }, 'Stopping multicast processes')

    const kills = Array.from(processMap.values()).map(async (managed) => {
      try {
        managed.command.kill('SIGTERM')
        logger.debug({ platform: managed.platform }, 'Sent SIGTERM to FFmpeg')
      } catch (err) {
        logger.warn({ err }, 'Error killing FFmpeg process')
      }
    })

    await Promise.allSettled(kills)
    this.processes.delete(streamId)

    // Clean up PID tracking
    await streamRedis.clearFFmpegPids(streamId)
  }

  // ─── Stop a single destination (user triggered) ────────────
  async stopDestination(streamId: string, destinationId: string): Promise<void> {
    const processMap = this.processes.get(streamId)
    const managed    = processMap?.get(destinationId)
    if (!managed) return

    managed.command.kill('SIGTERM')
    processMap!.delete(destinationId)
    await this.updateDestinationStatus(streamId, destinationId, 'ended')
  }

  // ─── Add destination to running stream ─────────────────────
  async addDestination(
    streamId:   string,
    streamKey:  string,
    dest:       MulticastJobData['destinations'][0]
  ): Promise<void> {
    let processMap = this.processes.get(streamId)
    if (!processMap) {
      processMap = new Map()
      this.processes.set(streamId, processMap)
    }
    await this.startDestination(streamId, streamKey, dest, processMap)
  }

  // ─── Get live process count ─────────────────────────────────
  getActiveProcessCount(streamId: string): number {
    return this.processes.get(streamId)?.size ?? 0
  }

  // ─── Helper: update destination status ─────────────────────
  private async updateDestinationStatus(
    streamId:      string,
    destinationId: string,
    status:        DestinationState['status'],
    error?:        string
  ): Promise<void> {
    const state = await streamRedis.getLiveState(streamId)
    if (!state) return

    const destinations = state.destinations.map(d =>
      d.destinationId === destinationId ? { ...d, status, error } : d
    )
    await streamRedis.updateLiveState(streamId, { destinations })

    await prisma.streamDestination.update({
      where: {
        streamId_destinationId: { streamId, destinationId },
      },
      data: { status, error: error ?? null },
    }).catch(() => {}) // Non-fatal
  }
}
