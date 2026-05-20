// ============================================================
//  Redis — Stream state, session registry, pub/sub
// ============================================================

import IORedis from "ioredis";
import { config } from "./config";
import type { LiveStreamState, RtmpSession } from "../types";

export const redis = new IORedis(config.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: false,
});

// Separate pub/sub connections (Redis requires dedicated connections)
export const redisSub = new IORedis(config.REDIS_URL, { lazyConnect: false });
export const redisPub = new IORedis(config.REDIS_URL, { lazyConnect: false });

// ─── Key namespaces ───────────────────────────────────────────
export const StreamKeys = {
  liveState: (streamId: string) => `stream:state:${streamId}`,
  rtmpSession: (streamKey: string) => `rtmp:session:${streamKey}`,
  activeStreams: () => "stream:active", // sorted set
  userStream: (userId: string) => `stream:user:${userId}`,
  viewers: (streamId: string) => `stream:viewers:${streamId}`,
  statsChannel: (streamId: string) => `stream:stats:${streamId}`,
  ffmpegPids: (streamId: string) => `stream:pids:${streamId}`,
} as const;

// ─── TTLs ─────────────────────────────────────────────────────
const TTL = {
  LIVE_STATE: 60 * 60 * 12, // 12 hours max stream
  RTMP_SESSION: 60 * 60 * 12,
};

// ─── Typed helpers ────────────────────────────────────────────
export const streamRedis = {
  // ── Live stream state ───────────────────────────────────────
  async setLiveState(streamId: string, state: LiveStreamState): Promise<void> {
    await redis.setex(
      StreamKeys.liveState(streamId),
      TTL.LIVE_STATE,
      JSON.stringify(state),
    );
    await redis.zadd(StreamKeys.activeStreams(), Date.now(), streamId);
  },

  async getLiveState(streamId: string): Promise<LiveStreamState | null> {
    const raw = await redis.get(StreamKeys.liveState(streamId));
    return raw ? JSON.parse(raw) : null;
  },

  async updateLiveState(
    streamId: string,
    update: Partial<LiveStreamState>,
  ): Promise<void> {
    const current = await streamRedis.getLiveState(streamId);
    if (!current) return;
    await streamRedis.setLiveState(streamId, { ...current, ...update });
  },

  async deleteLiveState(streamId: string): Promise<void> {
    await redis.del(StreamKeys.liveState(streamId));
    await redis.zrem(StreamKeys.activeStreams(), streamId);
  },

  // ── RTMP session registry ───────────────────────────────────
  async setRtmpSession(streamKey: string, session: RtmpSession): Promise<void> {
    await redis.setex(
      StreamKeys.rtmpSession(streamKey),
      TTL.RTMP_SESSION,
      JSON.stringify(session),
    );
  },

  async getRtmpSession(streamKey: string): Promise<RtmpSession | null> {
    const raw = await redis.get(StreamKeys.rtmpSession(streamKey));
    return raw ? JSON.parse(raw) : null;
  },

  async deleteRtmpSession(streamKey: string): Promise<void> {
    await redis.del(StreamKeys.rtmpSession(streamKey));
  },

  // ── Active user stream lookup ───────────────────────────────
  async setUserActiveStream(userId: string, streamId: string): Promise<void> {
    await redis.setex(StreamKeys.userStream(userId), TTL.LIVE_STATE, streamId);
  },

  async getUserActiveStream(userId: string): Promise<string | null> {
    return redis.get(StreamKeys.userStream(userId));
  },

  async clearUserActiveStream(userId: string): Promise<void> {
    await redis.del(StreamKeys.userStream(userId));
  },

  // ── FFmpeg PID tracking (for graceful kill on stream end) ───
  async addFFmpegPid(streamId: string, pid: number): Promise<void> {
    await redis.sadd(StreamKeys.ffmpegPids(streamId), pid.toString());
    await redis.expire(StreamKeys.ffmpegPids(streamId), TTL.LIVE_STATE);
  },

  async getFFmpegPids(streamId: string): Promise<number[]> {
    const pids = await redis.smembers(StreamKeys.ffmpegPids(streamId));
    return pids.map(Number);
  },

  async removeFFmpegPid(streamId: string, pid: number): Promise<void> {
    await redis.srem(StreamKeys.ffmpegPids(streamId), pid.toString());
  },

  async clearFFmpegPids(streamId: string): Promise<void> {
    await redis.del(StreamKeys.ffmpegPids(streamId));
  },

  // ── Stats pub/sub ───────────────────────────────────────────
  async publishStats(streamId: string, stats: object): Promise<void> {
    await redisPub.publish(
      StreamKeys.statsChannel(streamId),
      JSON.stringify(stats),
    );
  },

  async subscribeToStats(
    streamId: string,
    onMessage: (stats: object) => void,
  ): Promise<void> {
    await redisSub.subscribe(StreamKeys.statsChannel(streamId));
    redisSub.on("message", (channel, message) => {
      if (channel === StreamKeys.statsChannel(streamId)) {
        onMessage(JSON.parse(message));
      }
    });
  },

  async unsubscribeFromStats(streamId: string): Promise<void> {
    await redisSub.unsubscribe(StreamKeys.statsChannel(streamId));
  },

  // ── All active stream IDs ───────────────────────────────────
  async getActiveStreamIds(): Promise<string[]> {
    return redis.zrange(StreamKeys.activeStreams(), 0, -1);
  },
};
