// ============================================================
//  RTMP Server — Ingest layer via node-media-server
//  Handles: connect, publish, done events
//  Auth: stream key lookup → user/stream resolution
// ============================================================

import NodeMediaServer from "node-media-server";
import path from "path";
import fs from "fs";
import { config } from "../utils/config";
import { prisma } from "../utils/prisma";
import { streamRedis } from "../utils/redis";
import { MulticastService } from "../services/multicast.service";
import { RecordingService } from "../services/recording.service";
import { logger } from "../utils/logger";
import type { RtmpSession } from "../types";

// ─── Node Media Server config ─────────────────────────────────
const NMS_CONFIG = {
  rtmp: {
    port: config.RTMP_PORT,
    chunk_size: config.RTMP_CHUNK_SIZE,
    gop_cache: config.RTMP_GOP_CACHE,
    ping: config.RTMP_PING,
    ping_timeout: config.RTMP_PING_TIMEOUT,
  },
  http: {
    port: config.HTTP_PORT,
    allow_origin: config.HTTP_ALLOW_ORIGIN,
    mediaroot: "/tmp/media",
  },
  trans: {
    ffmpeg: config.FFMPEG_PATH,
    tasks: config.HLS_ENABLED
      ? [
          {
            app: "live",
            hls: true,
            hlsFlags: `[${config.HLS_FLAGS}]`,
            hlsKeepSegments: 3,
          },
        ]
      : [],
  },
};

export class RtmpServer {
  private nms: NodeMediaServer;
  private multicast: MulticastService;
  private recording: RecordingService;

  constructor(multicast: MulticastService, recording: RecordingService) {
    this.nms = new NodeMediaServer(NMS_CONFIG);
    this.multicast = multicast;
    this.recording = recording;
    this.registerHooks();
  }

  start(): void {
    this.nms.run();
    logger.info(`🎙️  RTMP server listening on port ${config.RTMP_PORT}`);
    logger.info(`📺  HLS server listening on port ${config.HTTP_PORT}`);
  }

  stop(): void {
    this.nms.stop();
  }

  // ─── NMS Hooks ─────────────────────────────────────────────
  private registerHooks(): void {
    // ── preConnect: Reject connections early if needed ────────
    this.nms.on("preConnect", (_id: string, _StreamPath: string, _args: object) => {
      logger.debug("RTMP preConnect");
    });

    // ── prePublish: Authenticate stream key ───────────────────
    this.nms.on(
      "prePublish",
      async (id: string, StreamPath: string, _args: object) => {
        const streamKey = this.extractStreamKey(StreamPath);
        logger.info(
          { id, streamKey },
          "RTMP prePublish — authenticating stream key",
        );

        if (!streamKey) {
          logger.warn({ id }, "Rejected — no stream key in path");

          return false; // Reject connection without stream key
        }

        try {
          const stream = await prisma.stream.findUnique({
            where: { streamKey },
            include: {
              user: { include: { subscription: true } },
              destinations: { include: { destination: true } },
            },
          });

          if (!stream) {
            logger.warn({ streamKey }, "Rejected — stream key not found");

            return false;
          }

          if (!stream.user.isActive) {
            logger.warn({ streamKey }, "Rejected — user account disabled");
            return false;
          }

          // Check for duplicate active stream
          const existingStreamId = await streamRedis.getUserActiveStream(
            stream.userId,
          );
          if (existingStreamId && existingStreamId !== stream.id) {
            logger.warn(
              { userId: stream.userId },
              "Rejected — user already has active stream",
            );

            return false;
          }

          // Auth passed — update stream status and start multicast
          await this.onPublishStart(stream, id);
        } catch (err) {
          logger.error({ err, streamKey }, "Error during RTMP authentication");
          const session = this.nms.getSession(id) as any;
          session?.reject();
        }
      },
    );

    // ── postPublish: Stream is confirmed live ─────────────────
    this.nms.on(
      "postPublish",
      async (id: string, StreamPath: string, _args: object) => {
        logger.info({ id, StreamPath }, "RTMP postPublish — stream is live");
      },
    );

    // ── donePublish: Streamer disconnected ────────────────────
    this.nms.on(
      "donePublish",
      async (id: string, StreamPath: string, _args: object) => {
        const streamKey = this.extractStreamKey(StreamPath);
        if (!streamKey) return;

        logger.info({ id, streamKey }, "RTMP donePublish — stream ended");
        await this.onPublishEnd(streamKey);
      },
    );

    // ── prePlay: HLS viewer connecting ────────────────────────
    this.nms.on(
      "prePlay",
      (_id: string, StreamPath: string, _args: object) => {
        logger.debug({ StreamPath }, "Viewer connecting");
      },
    );
  }

  // ─── Publish start lifecycle ──────────────────────────────────
  private async onPublishStart(stream: any, sessionId: string): Promise<void> {
    const now = new Date();

    // Update DB
    await prisma.stream.update({
      where: { id: stream.id },
      data: {
        status: "LIVE",
        startedAt: now,
        ingestUrl: `${config.RTMP_INGEST_URL}/${stream.streamKey}`,
      },
    });

    // Set up Redis live state
    const activeDestinations = stream.destinations
      .filter((sd: any) => sd.destination.isActive)
      .map((sd: any) => ({
        destinationId: sd.destination.id,
        platform: sd.destination.platform,
        label: sd.destination.label,
        status: "connecting" as const,
      }));

    await streamRedis.setLiveState(stream.id, {
      streamId: stream.id,
      userId: stream.userId,
      status: "LIVE",
      activeSceneId: null,
      startedAt: now,
      viewerCount: 0,
      bitrate: 0,
      droppedFrames: 0,
      fps: 0,
      destinations: activeDestinations,
    });

    await streamRedis.setUserActiveStream(stream.userId, stream.id);

    // Store RTMP session metadata
    const rtmpSession: RtmpSession = {
      id: sessionId,
      streamKey: stream.streamKey,
      userId: stream.userId,
      streamId: stream.id,
      connectTime: now,
      ip: "",
      videoWidth: 0,
      videoHeight: 0,
      videoFps: 0,
      videoBitrate: 0,
      audioBitrate: 0,
    };
    await streamRedis.setRtmpSession(stream.streamKey, rtmpSession);

    // Start multicast to all destinations
    const destinations = stream.destinations
      .filter((sd: any) => sd.destination.isActive)
      .map((sd: any) => ({
        destinationId: sd.destination.id,
        rtmpUrl: sd.destination.rtmpUrl,
        streamKey: sd.destination.streamKey,
        platform: sd.destination.platform,
      }));

    if (destinations.length > 0) {
      await this.multicast.startMulticast({
        streamId: stream.id,
        userId: stream.userId,
        streamKey: stream.streamKey,
        destinations,
      });
    }

    // Start recording if enabled
    if (config.RECORDING_ENABLED) {
      await this.recording.startRecording({
        streamId: stream.id,
        userId: stream.userId,
        streamKey: stream.streamKey,
        outputPath: path.join(config.RECORDING_PATH, `${stream.id}.mp4`),
      });
    }

    logger.info(
      { streamId: stream.id, userId: stream.userId },
      "✅ Stream started successfully",
    );
  }

  // ─── Publish end lifecycle ────────────────────────────────────
  private async onPublishEnd(streamKey: string): Promise<void> {
    const session = await streamRedis.getRtmpSession(streamKey);
    if (!session) return;

    const { streamId, userId } = session;

    // Stop all FFmpeg processes
    await this.multicast.stopMulticast(streamId);
    await this.recording.stopRecording(streamId);

    // Update DB
    await prisma.stream.update({
      where: { id: streamId },
      data: { status: "ENDED", endedAt: new Date() },
    });

    // Clean up Redis
    await streamRedis.deleteLiveState(streamId);
    await streamRedis.deleteRtmpSession(streamKey);
    await streamRedis.clearUserActiveStream(userId);
    await streamRedis.clearFFmpegPids(streamId);

    logger.info({ streamId, userId }, "✅ Stream ended and cleaned up");
  }

  // ─── Helpers ─────────────────────────────────────────────────
  private extractStreamKey(streamPath: string): string | null {
    // Path format: /live/<stream-key>
    const parts = streamPath.split("/");
    return parts[2] ?? null;
  }
}
