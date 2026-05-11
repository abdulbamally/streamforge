// ============================================================
//  StreamForge API Contract — Media Service
//  Base: /api/v1/media  &  /api/v1/projects
// ============================================================

import { apiFetch, buildQuery } from "./client";
import type {
  MediaAsset,
  Project,
  ProjectWithTimeline,
  Clip,
  Export,
  ExportFormat,
} from "./types";

// ─── Request DTOs ─────────────────────────────────────────────
export interface PresignedUploadDto {
  filename: string;
  contentType: string; // 'video/mp4' | 'audio/mp3' | 'image/jpeg' etc.
  size: number; // bytes
}

export interface PresignedUploadResponse {
  presignedUrl: string; // PUT directly to this URL from the mobile app
  assetId: string; // Call upload-complete with this ID when done
  publicUrl: string; // Final R2 URL of the asset
  expiresIn: number; // seconds (900 = 15 min)
}

export interface CreateProjectDto {
  title: string;
  description?: string;
  resolution?: string; // e.g. '1920x1080'
  fps?: number;
  aspectRatio?: string; // e.g. '16:9'
}

export interface UpdateProjectDto {
  title?: string;
  description?: string;
  resolution?: string;
  fps?: number;
  aspectRatio?: string;
}

export interface AddClipDto {
  assetId?: string;
  assetUrl: string;
  trackIndex?: number; // 0 = primary, 1+ = overlay tracks
  startTime: number; // position on timeline (seconds)
  endTime: number;
  trimIn?: number; // trim start within source (seconds)
  trimOut?: number; // trim end within source
}

export interface UpdateClipDto {
  startTime?: number;
  endTime?: number;
  trimIn?: number;
  trimOut?: number;
  trackIndex?: number;
  volume?: number; // 0-2
  opacity?: number; // 0-1
  speed?: number; // 0.1-10
}

export interface ExportDto {
  format?: ExportFormat; // default 'MP4'
  resolution?: string; // override project resolution
  fps?: number; // override project fps
  videoBitrate?: number; // kbps
  audioBitrate?: number; // kbps
}

export interface TrimDto {
  clipId: string;
  start: number; // seconds
  end: number;
}

export interface ColorGradeDto {
  clipId: string;
  brightness: number; // -1 to 1
  contrast: number; // 0 to 3
  saturation: number; // 0 to 3
  hue: number; // -180 to 180
  lutUrl?: string; // URL to a .cube LUT file
}

export interface ExtractAudioDto {
  assetId: string;
  format: "mp3" | "aac" | "wav";
}

export interface ListAssetsQuery {
  page?: number;
  limit?: number;
  type?: "video" | "audio" | "image";
}

// ─── Media API ────────────────────────────────────────────────
export const mediaApi = {
  /**
   * STEP 1 — Get a pre-signed URL to upload directly to R2.
   * The mobile app PUTs the file to `presignedUrl` directly.
   * This avoids routing large files through our server.
   */
  getPresignedUploadUrl: (
    dto: PresignedUploadDto,
  ): Promise<PresignedUploadResponse> =>
    apiFetch("/api/v1/media/presigned-upload", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /**
   * STEP 2 — Call this after the file has been uploaded to R2.
   * Triggers thumbnail generation and post-processing.
   */
  confirmUpload: (
    assetId: string,
  ): Promise<{ message: string; assetId: string }> =>
    apiFetch(`/api/v1/media/${assetId}/upload-complete`, { method: "POST" }),

  /**
   * List all media assets for the current user.
   */
  listAssets: (query?: ListAssetsQuery): Promise<MediaAsset[]> =>
    apiFetch(
      `/api/v1/media${buildQuery((query ?? {}) as Record<string, string | number | boolean | undefined>)}`,
    ),

  /**
   * Delete a media asset (removes from R2 + DB).
   */
  deleteAsset: (assetId: string): Promise<{ message: string }> =>
    apiFetch(`/api/v1/media/${assetId}`, { method: "DELETE" }),
};

// ─── Project API ──────────────────────────────────────────────
export const projectApi = {
  /**
   * Create a new video editing project.
   */
  create: (dto: CreateProjectDto): Promise<Project> =>
    apiFetch("/api/v1/projects", { method: "POST", body: JSON.stringify(dto) }),

  /**
   * List all projects (excludes ARCHIVED).
   */
  list: (): Promise<Project[]> => apiFetch("/api/v1/projects"),

  /**
   * Get a project with full timeline (clips + exports).
   */
  getById: (projectId: string): Promise<ProjectWithTimeline> =>
    apiFetch(`/api/v1/projects/${projectId}`),

  /**
   * Add a clip to the project timeline.
   */
  addClip: (projectId: string, dto: AddClipDto): Promise<Clip> =>
    apiFetch(`/api/v1/projects/${projectId}/clips`, {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /**
   * Queue a project export job.
   * Returns immediately with exportId — poll getExport() for status.
   */
  export: (
    projectId: string,
    dto?: ExportDto,
  ): Promise<{ exportId: string; jobId: string; message: string }> =>
    apiFetch(`/api/v1/projects/${projectId}/export`, {
      method: "POST",
      body: JSON.stringify(dto ?? {}),
    }),

  /**
   * Get export job status and download URL when complete.
   * Poll this every 2-3 seconds until status === 'DONE' or 'FAILED'.
   */
  getExport: (projectId: string, exportId: string): Promise<Export> =>
    apiFetch(`/api/v1/projects/${projectId}/exports/${exportId}`),

  /**
   * Queue a trim operation on a clip.
   * Returns a jobId — result updates the clip's assetUrl when done.
   */
  trimClip: (
    projectId: string,
    dto: TrimDto,
  ): Promise<{ jobId: string; message: string }> =>
    apiFetch(`/api/v1/projects/${projectId}/trim`, {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /**
   * Apply color grading to a clip.
   * PRO plan and above only.
   */
  colorGrade: (
    projectId: string,
    dto: ColorGradeDto,
  ): Promise<{ jobId: string; message: string }> =>
    apiFetch(`/api/v1/projects/${projectId}/color-grade`, {
      method: "POST",
      body: JSON.stringify(dto),
    }),
};
