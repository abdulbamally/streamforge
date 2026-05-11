// ============================================================
//  Media Service — Zod Validation Schemas
// ============================================================

import { z } from 'zod'

// ─── Media Asset ──────────────────────────────────────────────
export const PresignedUploadSchema = z.object({
  filename:    z.string().min(1),
  contentType: z.string().regex(/^(video|audio|image)\//, 'Must be a video, audio or image type'),
  size:        z.number().int().positive().max(10 * 1024 * 1024 * 1024, 'Max 10GB'),
})

export type PresignedUploadDto = z.infer<typeof PresignedUploadSchema>

// ─── Project ──────────────────────────────────────────────────
export const CreateProjectSchema = z.object({
  title:       z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  resolution:  z.string().regex(/^\d+x\d+$/, 'Format must be WxH e.g. 1920x1080').optional().default('1920x1080'),
  fps:         z.number().int().min(1).max(120).optional().default(30),
  aspectRatio: z.string().optional().default('16:9'),
})

export const UpdateProjectSchema = z.object({
  title:       z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  resolution:  z.string().regex(/^\d+x\d+$/).optional(),
  fps:         z.number().int().min(1).max(120).optional(),
  aspectRatio: z.string().optional(),
})

export type CreateProjectDto = z.infer<typeof CreateProjectSchema>
export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>

// ─── Clip ─────────────────────────────────────────────────────
export const AddClipSchema = z.object({
  assetId:    z.string().optional(),
  assetUrl:   z.string().url('Must be a valid URL'),
  trackIndex: z.number().int().min(0).optional().default(0),
  startTime:  z.number().min(0),
  endTime:    z.number().min(0),
  trimIn:     z.number().min(0).optional().default(0),
  trimOut:    z.number().min(0).optional(),
})

export const UpdateClipSchema = z.object({
  startTime:  z.number().min(0).optional(),
  endTime:    z.number().min(0).optional(),
  trimIn:     z.number().min(0).optional(),
  trimOut:    z.number().min(0).optional(),
  trackIndex: z.number().int().min(0).optional(),
  volume:     z.number().min(0).max(2).optional(),
  opacity:    z.number().min(0).max(1).optional(),
  speed:      z.number().min(0.1).max(10).optional(),
})

export type AddClipDto    = z.infer<typeof AddClipSchema>
export type UpdateClipDto = z.infer<typeof UpdateClipSchema>

// ─── Export ───────────────────────────────────────────────────
export const ExportSchema = z.object({
  format:       z.enum(['MP4', 'MOV', 'WEBM', 'MKV', 'GIF', 'MP3']).default('MP4'),
  resolution:   z.string().regex(/^\d+x\d+$/).optional(),
  fps:          z.number().int().min(1).max(120).optional(),
  videoBitrate: z.number().int().min(100).max(50000).optional(),
  audioBitrate: z.number().int().min(32).max(320).optional(),
})

export type ExportDto = z.infer<typeof ExportSchema>

// ─── Editing operations ───────────────────────────────────────
export const TrimSchema = z.object({
  clipId: z.string().min(1),
  start:  z.number().min(0),
  end:    z.number().min(0),
}).refine(d => d.end > d.start, { message: 'end must be greater than start' })

export const ColorGradeSchema = z.object({
  clipId:     z.string().min(1),
  brightness: z.number().min(-1).max(1).default(0),
  contrast:   z.number().min(0).max(3).default(1),
  saturation: z.number().min(0).max(3).default(1),
  hue:        z.number().min(-180).max(180).default(0),
  lutUrl:     z.string().url().optional(),
})

export const ExtractAudioSchema = z.object({
  assetId: z.string().min(1),
  format:  z.enum(['mp3', 'aac', 'wav']).default('mp3'),
})

export type TrimDto         = z.infer<typeof TrimSchema>
export type ColorGradeDto   = z.infer<typeof ColorGradeSchema>
export type ExtractAudioDto = z.infer<typeof ExtractAudioSchema>
