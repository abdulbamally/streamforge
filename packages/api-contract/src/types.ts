// ============================================================
//  StreamForge API Contract — Shared Types
//  These types are used across ALL services
// ============================================================

// ─── Base API Response ────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── Plans ───────────────────────────────────────────────────
export type Plan = "FREE" | "PRO" | "CREATOR" | "ENTERPRISE";

export interface PlanLimits {
  maxDestinations: number; // -1 = unlimited
  maxResolution: string; // '720p' | '1080p' | '4K'
  maxStorageGB: number; // -1 = unlimited
  maxProjectsCount: number;
  hasWatermark: boolean;
  hasAIFeatures: boolean;
  hasColorGrading: boolean;
  maxExportFormats: string[];
}

// ─── User ────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  emailVerified: boolean;
  plan: Plan;
  createdAt: string;
}

export interface UserWithSubscription extends User {
  subscription: {
    status: string;
    plan: Plan;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
}

// ─── Auth Tokens ─────────────────────────────────────────────
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string; // Only present when using body (not cookie)
  expiresIn: number; // seconds
}

// ─── Platform ────────────────────────────────────────────────
export type Platform =
  | "YOUTUBE"
  | "TWITCH"
  | "FACEBOOK"
  | "TIKTOK"
  | "INSTAGRAM"
  | "CUSTOM";

// ─── Stream ──────────────────────────────────────────────────
export type StreamStatus = "IDLE" | "LIVE" | "ENDED" | "ERROR";

export interface Stream {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  status: StreamStatus;
  streamKey: string;
  ingestUrl: string | null;
  viewerCount: number;
  peakViewers: number;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StreamWithDetails extends Stream {
  destinations: StreamDestination[];
  scenes: Scene[];
  recording: Recording | null;
  liveState: LiveStreamState | null;
}

// ─── Destination ─────────────────────────────────────────────
export interface Destination {
  id: string;
  userId: string;
  platform: Platform;
  label: string;
  rtmpUrl: string;
  streamKey: string;
  isActive: boolean;
  createdAt: string;
}

export interface StreamDestination {
  destinationId: string;
  destination: Destination;
  status: "pending" | "live" | "error" | "ended";
  error: string | null;
  startedAt: string | null;
}

// ─── Scene & Source ───────────────────────────────────────────
export type SourceType =
  | "CAMERA"
  | "SCREEN"
  | "IMAGE"
  | "VIDEO"
  | "TEXT"
  | "BROWSER"
  | "AUDIO";

export interface Scene {
  id: string;
  streamId: string;
  name: string;
  order: number;
  isActive: boolean;
  thumbnail: string | null;
  sources: Source[];
  createdAt: string;
}

export interface Source {
  id: string;
  sceneId: string;
  type: SourceType;
  label: string;
  order: number;
  isVisible: boolean;
  config: SourceConfig;
  assetUrl: string | null;
  createdAt: string;
}

export interface SourceConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  filters: SourceFilter[];
}

export interface SourceFilter {
  type: string;
  params: Record<string, number | string | boolean>;
  enabled: boolean;
}

// ─── Live Stream State (from Redis) ──────────────────────────
export interface LiveStreamState {
  streamId: string;
  userId: string;
  status: StreamStatus;
  activeSceneId: string | null;
  startedAt: string | null;
  viewerCount: number;
  bitrate: number;
  droppedFrames: number;
  fps: number;
  destinations: LiveDestinationState[];
}

export interface LiveDestinationState {
  destinationId: string;
  platform: Platform;
  label: string;
  status: "connecting" | "live" | "error" | "ended";
  error?: string;
  startedAt?: string;
}

// ─── Recording ────────────────────────────────────────────────
export interface Recording {
  id: string;
  streamId: string;
  url: string;
  duration: number | null;
  sizeBytes: number | null;
  format: string;
  createdAt: string;
}

// ─── Media Asset ─────────────────────────────────────────────
export interface MediaAsset {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  thumbnailUrl: string | null;
  duration: number | null;
  width: number | null;
  height: number | null;
  createdAt: string;
}

// ─── Project ─────────────────────────────────────────────────
export type ProjectStatus = "DRAFT" | "PROCESSING" | "READY" | "ARCHIVED";

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  resolution: string | null;
  fps: number | null;
  aspectRatio: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithTimeline extends Project {
  clips: Clip[];
  exports: Export[];
}

// ─── Clip ────────────────────────────────────────────────────
export interface Clip {
  id: string;
  projectId: string;
  assetId: string | null;
  assetUrl: string;
  trackIndex: number;
  startTime: number;
  endTime: number;
  trimIn: number;
  trimOut: number | null;
  volume: number;
  opacity: number;
  speed: number;
  effects: object[];
  colorGrade: object;
  audioConfig: object;
  transform: object;
  createdAt: string;
}

// ─── Export ──────────────────────────────────────────────────
export type ExportFormat = "MP4" | "MOV" | "WEBM" | "MKV" | "GIF" | "MP3";
export type JobStatus =
  | "PENDING"
  | "PROCESSING"
  | "DONE"
  | "FAILED"
  | "CANCELLED";

export interface Export {
  id: string;
  projectId: string;
  format: ExportFormat;
  resolution: string;
  fps: number;
  videoBitrate: number | null;
  audioBitrate: number | null;
  status: JobStatus;
  progress: number;
  outputUrl: string | null;
  sizeBytes: number | null;
  error: string | null;
  jobId: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

// ─── Subscription ─────────────────────────────────────────────
export interface Subscription {
  id: string;
  userId: string;
  plan: Plan;
  status: "ACTIVE" | "CANCELLED" | "PAST_DUE" | "TRIALING";
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
}

export interface PlanInfo {
  id: Plan;
  name: string;
  price: number | null; // cents, null = contact sales
  priceId: string | null;
  limits: PlanLimits;
  popular?: boolean;
}

// ─── Stream Stats (WebSocket) ─────────────────────────────────
export interface StreamStats {
  bitrate: number;
  fps: number;
  droppedFrames: number;
  viewerCount: number;
  destinations: LiveDestinationState[];
  duration: number;
}

// ─── AI Types ────────────────────────────────────────────────
export interface DetectedObject {
  name: string;
  confidence: number;
  boundingBox: BoundingBox;
  category: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectionResult {
  objects: DetectedObject[];
  labels: { name: string; confidence: number; topicality: number }[];
  faces: { confidence: number; boundingBox: BoundingBox }[];
  safeSearch: { adult: string; violence: string; racy: string };
  processedAt: string;
}

export interface OcrResult {
  fullText: string;
  blocks: {
    text: string;
    confidence: number;
    boundingBox: BoundingBox;
    language: string | null;
  }[];
  confidence: number;
  language: string | null;
  processedAt: string;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  processedAt: string;
}

export interface BatchTranslationResult extends Array<TranslationResult> {}

export interface SceneDescriptionResult {
  description: string;
  tags: string[];
  mood: string;
  suggestedTitle: string | null;
  processedAt: string;
}

// ─── WebSocket Message Types ──────────────────────────────────
export type WsMessageType =
  | "PING"
  | "PONG"
  | "STREAM_STATE"
  | "SCENE_SWITCH"
  | "SOURCE_UPDATE"
  | "STREAM_STATS"
  | "DESTINATION_STATUS"
  | "VIEWER_COUNT"
  | "ERROR";

export interface WsMessage<T = unknown> {
  type: WsMessageType;
  payload: T;
  ts: number;
}

// ─── Error Codes ─────────────────────────────────────────────
export const API_ERROR_CODES = {
  INVALID_CREDENTIALS: "AUTH_001",
  EMAIL_NOT_VERIFIED: "AUTH_002",
  TOKEN_EXPIRED: "AUTH_003",
  TOKEN_INVALID: "AUTH_004",
  EMAIL_ALREADY_EXISTS: "AUTH_005",
  USERNAME_TAKEN: "AUTH_006",
  ACCOUNT_DISABLED: "AUTH_007",
  UNAUTHORIZED: "AUTHZ_001",
  FORBIDDEN: "AUTHZ_002",
  PLAN_LIMIT_REACHED: "AUTHZ_003",
  VALIDATION_ERROR: "VAL_001",
  INTERNAL_ERROR: "SRV_001",
  NOT_FOUND: "SRV_002",
  RATE_LIMITED: "SRV_003",
  AI_PLAN_REQUIRED: "AUTHZ_003",
  AI_RATE_LIMITED: "SRV_003",
} as const;
