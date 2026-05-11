// ============================================================
//  StatsService — Collects and broadcasts stream metrics
//  Runs a polling loop per active stream, publishes via Redis
// ============================================================

import ffmpeg from 'fluent-ffmpeg'
import { streamRedis } from '../utils/redis'
import { prisma } from '../utils/prisma'
import { logger } from '../utils/logger'
import { config } from '../utils/config'
import type { StreamStatsPayload } from '../types'

const STATS_INTERVAL_MS = 3000  // Poll every 3 seconds

export class StatsService {
  private intervals = new Map<string, NodeJS.Timeout>()
  private streamStartTimes = new Map<string, Date>()

  startTracking(streamId: string): void {
    if (this.intervals.has(streamId)) return
    this.streamStartTimes.set(streamId, new Date())

    const interval = setInterval(async () => {
      await this.collectAndPublish(streamId)
    }, STATS_INTERVAL_MS)

    this.intervals.set(streamId, interval)
    logger.debug({ streamId }, 'Stats tracking started')
  }

  stopTracking(streamId: string): void {
    const interval = this.intervals.get(streamId)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(streamId)
      this.streamStartTimes.delete(streamId)
    }
  }

  private async collectAndPublish(streamId: string): Promise<void> {
    try {
      const state = await streamRedis.getLiveState(streamId)
      if (!state || state.status !== 'LIVE') {
        this.stopTracking(streamId)
        return
      }

      const startTime = this.streamStartTimes.get(streamId) ?? new Date()
      const duration  = (Date.now() - startTime.getTime()) / 1000

      const stats: StreamStatsPayload = {
        bitrate:       state.bitrate,
        fps:           state.fps,
        droppedFrames: state.droppedFrames,
        viewerCount:   state.viewerCount,
        destinations:  state.destinations,
        duration,
      }

      // Publish to Redis pub/sub for WebSocket relay
      await streamRedis.publishStats(streamId, stats)

      // Persist analytics snapshot to DB (sampled — not every tick)
      await prisma.streamAnalytic.create({
        data: {
          streamId,
          viewerCount:   stats.viewerCount,
          bitrate:       stats.bitrate,
          droppedFrames: stats.droppedFrames,
        },
      }).catch(() => {}) // Non-fatal

    } catch (err) {
      logger.error({ err, streamId }, 'Error collecting stream stats')
    }
  }

  // Update viewer count (called from WebSocket server)
  async updateViewerCount(streamId: string, delta: number): Promise<void> {
    const state = await streamRedis.getLiveState(streamId)
    if (!state) return

    const newCount = Math.max(0, state.viewerCount + delta)
    await streamRedis.updateLiveState(streamId, {
      viewerCount: newCount,
    })

    // Update peak viewers in DB if exceeded
    if (newCount > (state.viewerCount ?? 0)) {
      await prisma.stream.updateMany({
        where: { id: streamId, peakViewers: { lt: newCount } },
        data:  { viewerCount: newCount, peakViewers: newCount },
      }).catch(() => {})
    }
  }
}
