// ============================================================
//  Stream Service — Domain Types
// ============================================================

export type StreamStatus = "IDLE" | "LIVE" | "ENDED" | "ERROR";
export type Platform =
  | "YOUTUBE"
  | "TWITCH"
  | "FACEBOOK"
  | "TIKTOK"
  | "INSTAGRAM"
  | "CUSTOM";
export type SourceType =
  | "CAMERA"
  | "SCREEN"
  | "IMAGE"
  | "VIDEO"
  | "TEXT"
  | "BROWSER"
  | "AUDIO";

// ─── Source Transform / Layout ────────────────────────────────
export interface SourceTransform {
  x: number; // 0-1 normalized position
  y: number;
  width: number; // 0-1 normalized size
  height: number;
  rotation: number; // degrees
  opacity: number; // 0-1
  zIndex: number;
  locked: boolean;
  visible: boolean;
  filters: SourceFilter[];
}

export interface SourceFilter {
  type:
    | "chroma_key"
    | "color_correction"
    | "blur"
    | "sharpen"
    | "noise"
    | "lut";
  params: Record<string, number | string | boolean>;
  enabled: boolean;
}

// ─── Live Stream State ────────────────────────────────────────
export interface LiveStreamState {
  streamId: string;
  userId: string;
  status: StreamStatus;
  activeSceneId: string | null;
  startedAt: Date | null;
  viewerCount: number;
  bitrate: number; // kbps
  droppedFrames: number;
  fps: number;
  destinations: DestinationState[];
}

export interface DestinationState {
  destinationId: string;
  platform: Platform;
  label: string;
  status: "connecting" | "live" | "error" | "ended";
  error?: string;
  startedAt?: Date;
  ffmpegPid?: number;
}

// ─── RTMP Session ─────────────────────────────────────────────
export interface RtmpSession {
  id: string;
  streamKey: string;
  userId: string;
  streamId: string;
  connectTime: Date;
  publishTime?: Date;
  ip: string;
  videoWidth: number;
  videoHeight: number;
  videoFps: number;
  videoBitrate: number;
  audioBitrate: number;
}

// ─── WebSocket Messages (Client ↔ Server) ─────────────────────
export type WsMessageType =
  | "PING"
  | "PONG"
  | "STREAM_STATE"
  | "SCENE_SWITCH"
  | "SOURCE_UPDATE"
  | "STREAM_STATS"
  | "DESTINATION_STATUS"
  | "ERROR"
  | "VIEWER_COUNT";

export interface WsMessage<T = unknown> {
  type: WsMessageType;
  streamId?: string;
  payload: T;
  ts: number;
}

export interface StreamStatsPayload {
  bitrate: number;
  fps: number;
  droppedFrames: number;
  viewerCount: number;
  destinations: DestinationState[];
  duration: number; // seconds
}

// ─── BullMQ Job Payloads ──────────────────────────────────────
export interface MulticastJobData {
  streamId: string;
  userId: string;
  streamKey: string;
  destinations: Array<{
    destinationId: string;
    rtmpUrl: string;
    streamKey: string;
    platform: Platform;
  }>;
}

export interface RecordingJobData {
  streamId: string;
  userId: string;
  streamKey: string;
  outputPath: string;
}

export interface RecordingUploadJobData {
  streamId: string;
  userId: string;
  localPath: string;
  filename: string;
}

// ─── Plan limits for streaming ────────────────────────────────
export const STREAM_PLAN_LIMITS = {
  FREE: { maxDestinations: 1, maxResolution: "720p", hasPvr: false },
  PRO: { maxDestinations: 3, maxResolution: "1080p", hasPvr: true },
  CREATOR: { maxDestinations: 10, maxResolution: "4K", hasPvr: true },
  ENTERPRISE: { maxDestinations: -1, maxResolution: "4K", hasPvr: true },
} as const;
