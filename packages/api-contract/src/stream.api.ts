// ============================================================
//  StreamForge API Contract — Stream Service
//  Base: /api/v1/streams
// ============================================================

import { apiFetch, buildQuery } from "./client";
import type {
  Stream,
  StreamWithDetails,
  Destination,
  Scene,
  Source,
  SourceConfig,
  Platform,
  SourceType,
} from "./types";

// ─── Request DTOs ─────────────────────────────────────────────
export interface CreateStreamDto {
  title: string;
  description?: string;
}

export interface UpdateStreamDto {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
}

export interface CreateDestinationDto {
  platform: Platform;
  label: string;
  rtmpUrl: string;
  streamKey: string;
}

export interface CreateSceneDto {
  name: string;
  order?: number;
}

export interface UpdateSceneDto {
  name?: string;
  order?: number;
}

export interface CreateSourceDto {
  type: SourceType;
  label: string;
  order?: number;
  assetUrl?: string;
  config?: Partial<SourceConfig>;
}

export interface UpdateSourceDto {
  label?: string;
  order?: number;
  isVisible?: boolean;
  assetUrl?: string;
  config?: Partial<SourceConfig>;
}

export interface ReorderSourcesDto {
  orderedIds: string[];
}

// ─── Response DTOs ────────────────────────────────────────────
export interface StreamKeyResponse {
  streamKey: string;
  ingestUrl: string;
  serverUrl: string;
  fullUrl: string;
}

// ─── Stream API ───────────────────────────────────────────────
export const streamApi = {
  // ── Streams ──────────────────────────────────────────────────

  /**
   * Create a new stream.
   * Automatically creates a default "Main Scene".
   */
  create: (dto: CreateStreamDto): Promise<Stream> =>
    apiFetch("/api/v1/streams", { method: "POST", body: JSON.stringify(dto) }),

  /**
   * List all streams for the authenticated user.
   */
  list: (): Promise<StreamWithDetails[]> => apiFetch("/api/v1/streams"),

  /**
   * Get a single stream by ID with full details + live state.
   */
  getById: (streamId: string): Promise<StreamWithDetails> =>
    apiFetch(`/api/v1/streams/${streamId}`),

  /**
   * Get the RTMP stream key and ingest URL.
   * Used to configure OBS or the mobile streaming client.
   */
  getStreamKey: (streamId: string): Promise<StreamKeyResponse> =>
    apiFetch(`/api/v1/streams/${streamId}/key`),

  /**
   * Force-end an active stream and clean up all resources.
   */
  end: (streamId: string): Promise<{ message: string }> =>
    apiFetch(`/api/v1/streams/${streamId}/end`, { method: "POST" }),

  // ── Destinations ─────────────────────────────────────────────

  /**
   * Add a streaming destination to a stream.
   * Plan limits enforced — FREE = 1, PRO = 3, CREATOR = 10.
   */
  addDestination: (
    streamId: string,
    dto: CreateDestinationDto,
  ): Promise<Destination> =>
    apiFetch(`/api/v1/streams/${streamId}/destinations`, {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /**
   * Remove a destination from a stream.
   */
  removeDestination: (
    streamId: string,
    destinationId: string,
  ): Promise<{ message: string }> =>
    apiFetch(`/api/v1/streams/${streamId}/destinations/${destinationId}`, {
      method: "DELETE",
    }),

  // ── Scenes ───────────────────────────────────────────────────

  /**
   * Get all scenes for a stream, ordered by position.
   */
  getScenes: (streamId: string): Promise<Scene[]> =>
    apiFetch(`/api/v1/streams/${streamId}/scenes`),

  /**
   * Create a new scene.
   */
  createScene: (streamId: string, dto: CreateSceneDto): Promise<Scene> =>
    apiFetch(`/api/v1/streams/${streamId}/scenes`, {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /**
   * Switch the active scene during a live stream.
   * Takes effect immediately via WebSocket broadcast.
   */
  switchScene: (
    streamId: string,
    sceneId: string,
  ): Promise<{ message: string }> =>
    apiFetch(`/api/v1/streams/${streamId}/scenes/${sceneId}/switch`, {
      method: "POST",
    }),

  // ── Sources ───────────────────────────────────────────────────

  /**
   * Add a source (camera, image, video, text etc.) to a scene.
   */
  addSource: (
    streamId: string,
    sceneId: string,
    dto: CreateSourceDto,
  ): Promise<Source> =>
    apiFetch(`/api/v1/streams/${streamId}/scenes/${sceneId}/sources`, {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /**
   * Update a source's transform, visibility, or asset.
   * During live stream — changes are broadcast via WebSocket instantly.
   */
  updateSource: (
    streamId: string,
    sceneId: string,
    sourceId: string,
    dto: UpdateSourceDto,
  ): Promise<Source> =>
    apiFetch(
      `/api/v1/streams/${streamId}/scenes/${sceneId}/sources/${sourceId}`,
      {
        method: "PATCH",
        body: JSON.stringify(dto),
      },
    ),
};

// ─── WebSocket Client ─────────────────────────────────────────
export interface StreamWsOptions {
  streamId: string;
  token: string;
  baseWsUrl: string; // e.g. 'wss://stream.streamforge.app'
  onState: (state: import("./types").LiveStreamState) => void;
  onStats: (stats: import("./types").StreamStats) => void;
  onSceneSwitch: (sceneId: string) => void;
  onSourceUpdate: (source: Source) => void;
  onError: (message: string) => void;
  onClose: () => void;
}

/**
 * Connect to the stream WebSocket for real-time control and stats.
 * Returns a handle with send methods and a close() function.
 */
export function connectStreamWs(options: StreamWsOptions) {
  const url = `${options.baseWsUrl}/ws?streamId=${options.streamId}&token=${options.token}`;
  const ws = new WebSocket(url);

  ws.onopen = () => {
    // Start keepalive ping every 30s
    const ping = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "PING", payload: {}, ts: Date.now() }));
      } else {
        clearInterval(ping);
      }
    }, 30000);
  };

  ws.onmessage = (event: MessageEvent) => {
    try {
      const msg = JSON.parse(event.data);
      switch (msg.type) {
        case "STREAM_STATE":
          options.onState(msg.payload);
          break;
        case "STREAM_STATS":
          options.onStats(msg.payload);
          break;
        case "SCENE_SWITCH":
          options.onSceneSwitch(msg.payload.sceneId);
          break;
        case "SOURCE_UPDATE":
          options.onSourceUpdate(msg.payload);
          break;
        case "ERROR":
          options.onError(msg.payload.message);
          break;
      }
    } catch {}
  };

  ws.onerror = () => options.onError("WebSocket connection error");
  ws.onclose = () => options.onClose();

  return {
    switchScene: (sceneId: string) =>
      ws.send(
        JSON.stringify({
          type: "SCENE_SWITCH",
          payload: { sceneId },
          ts: Date.now(),
        }),
      ),
    updateSource: (sourceId: string, update: object) =>
      ws.send(
        JSON.stringify({
          type: "SOURCE_UPDATE",
          payload: { sourceId, update },
          ts: Date.now(),
        }),
      ),
    close: () => ws.close(),
    get readyState() {
      return ws.readyState;
    },
  };
}
