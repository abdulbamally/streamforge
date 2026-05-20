// ============================================================
//  RecordingService — Records live streams to file, uploads to R2
// ============================================================

import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'
import {
  S3Client,
  PutObjectCommand,
  type PutObjectCommandInput,
} from '@aws-sdk/client-s3'
import { config } from '../utils/config'
import { prisma } from '../utils/prisma'
import { logger } from '../utils/logger'
import type { RecordingJobData } from '../types'

interface ActiveRecording {
  streamId:   string
  command:    ffmpeg.FfmpegCommand
  outputPath: string
  startedAt:  Date
}

export class RecordingService {
  private recordings = new Map<string, ActiveRecording>()
  private s3: S3Client

  constructor() {
    ffmpeg.setFfmpegPath(config.FFMPEG_PATH)

    // Cloudflare R2 uses S3-compatible API
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId:     config.R2_ACCESS_KEY_ID,
        secretAccessKey: config.R2_SECRET_ACCESS_KEY,
      },
    })

    // Ensure recording directory exists
    fs.mkdirSync(config.RECORDING_PATH, { recursive: true })
  }

  // ─── Start recording a stream ──────────────────────────────
  async startRecording(job: RecordingJobData): Promise<void> {
    const ingestUrl = `${config.RTMP_INGEST_URL}/${job.streamKey}`

    logger.info({ streamId: job.streamId }, 'Starting recording')

    return new Promise((resolve) => {
      const cmd = ffmpeg(ingestUrl)
        .inputOptions(['-re', '-fflags nobuffer'])
        // Record as high-quality MP4
        .videoCodec('copy')
        .audioCodec('aac')
        .audioBitrate('192k')
        .outputOptions([
          '-f mp4',
          '-movflags frag_keyframe+empty_moov+default_base_moof', // Streamable MP4
          '-reset_timestamps 1',
        ])
        .output(job.outputPath)

      const recording: ActiveRecording = {
        streamId:   job.streamId,
        command:    cmd,
        outputPath: job.outputPath,
        startedAt:  new Date(),
      }
      this.recordings.set(job.streamId, recording)

      cmd
        .on('start', () => {
          logger.debug({ streamId: job.streamId, outputPath: job.outputPath }, 'Recording started')
          resolve()
        })
        .on('error', (err) => {
          logger.error({ err, streamId: job.streamId }, 'Recording error')
          this.recordings.delete(job.streamId)
        })
        .on('end', async () => {
          logger.info({ streamId: job.streamId }, 'Recording ended — uploading to R2')
          this.recordings.delete(job.streamId)
          await this.uploadRecording(job.streamId, job.userId, job.outputPath)
        })

      cmd.run()
    })
  }

  // ─── Stop recording ─────────────────────────────────────────
  async stopRecording(streamId: string): Promise<void> {
    const recording = this.recordings.get(streamId)
    if (!recording) return

    logger.info({ streamId }, 'Stopping recording')

    // Send q (quit) to FFmpeg stdin for clean exit
    try {
      recording.command.kill('SIGTERM')
    } catch (err) {
      logger.warn({ err }, 'Error stopping recording process')
    }

    this.recordings.delete(streamId)
  }

  // ─── Upload completed recording to R2 ──────────────────────
  private async uploadRecording(
    streamId: string,
    userId:   string,
    localPath: string
  ): Promise<void> {
    if (!fs.existsSync(localPath)) {
      logger.warn({ localPath }, 'Recording file not found for upload')
      return
    }

    const stats    = fs.statSync(localPath)
    const filename = path.basename(localPath)
    const r2Key    = `recordings/${userId}/${streamId}/${filename}`

    try {
      logger.info({ r2Key, size: stats.size }, 'Uploading recording to R2')

      const fileStream = fs.createReadStream(localPath)

      const params: PutObjectCommandInput = {
        Bucket:      config.R2_BUCKET_NAME,
        Key:         r2Key,
        Body:        fileStream,
        ContentType: 'video/mp4',
        ContentLength: stats.size,
        Metadata: {
          streamId,
          userId,
        },
      }

      await this.s3.send(new PutObjectCommand(params))

      const publicUrl = `${config.R2_PUBLIC_URL}/${r2Key}`

      // Probe the recording for metadata
      const duration = await this.probeVideoDuration(localPath)

      // Save recording record to DB
      await prisma.recording.create({
        data: {
          streamId,
          url:      publicUrl,
          duration,
          sizeBytes: stats.size,
          format:   'mp4',
        },
      })

      logger.info({ streamId, url: publicUrl }, '✅ Recording uploaded successfully')

      // Clean up local file
      fs.unlinkSync(localPath)

    } catch (err) {
      logger.error({ err, streamId }, 'Failed to upload recording')
    }
  }

  // ─── Probe video duration via FFprobe ──────────────────────
  private probeVideoDuration(filePath: string): Promise<number> {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          resolve(0)
          return
        }
        resolve(metadata.format.duration ?? 0)
      })
    })
  }

  // ─── Check if stream is being recorded ─────────────────────
  isRecording(streamId: string): boolean {
    return this.recordings.has(streamId)
  }
}
