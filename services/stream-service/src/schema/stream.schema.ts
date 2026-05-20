// ============================================================
//  Stream Service — Zod Validation Schemas
// ============================================================

import { z } from 'zod'

// ─── Stream ───────────────────────────────────────────────────
export const CreateStreamSchema = z.object({
  title:       z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
})

export const UpdateStreamSchema = z.object({
  title:        z.string().min(1).max(100).optional(),
  description:  z.string().max(500).optional(),
  thumbnailUrl: z.string().url().optional(),
})

export type CreateStreamDto = z.infer<typeof CreateStreamSchema>
export type UpdateStreamDto = z.infer<typeof UpdateStreamSchema>

// ─── Destination ──────────────────────────────────────────────
export const CreateDestinationSchema = z.object({
  platform:  z.enum(['YOUTUBE', 'TWITCH', 'FACEBOOK', 'TIKTOK', 'INSTAGRAM', 'CUSTOM']),
  label:     z.string().min(1).max(50),
  rtmpUrl:   z.string().url('Must be a valid RTMP URL'),
  streamKey: z.string().min(1, 'Stream key is required'),
})

export type CreateDestinationDto = z.infer<typeof CreateDestinationSchema>

// ─── Scene ────────────────────────────────────────────────────
export const CreateSceneSchema = z.object({
  name:  z.string().min(1).max(50),
  order: z.number().int().min(0).optional().default(0),
})

export const UpdateSceneSchema = z.object({
  name:  z.string().min(1).max(50).optional(),
  order: z.number().int().min(0).optional(),
})

export type CreateSceneDto = z.infer<typeof CreateSceneSchema>
export type UpdateSceneDto = z.infer<typeof UpdateSceneSchema>

// ─── Source ───────────────────────────────────────────────────
export const SourceTransformSchema = z.object({
  x:        z.number().min(0).max(1).default(0),
  y:        z.number().min(0).max(1).default(0),
  width:    z.number().min(0).max(1).default(1),
  height:   z.number().min(0).max(1).default(1),
  rotation: z.number().min(-360).max(360).default(0),
  opacity:  z.number().min(0).max(1).default(1),
  zIndex:   z.number().int().min(0).default(0),
  locked:   z.boolean().default(false),
  visible:  z.boolean().default(true),
  filters:  z.array(z.object({
    type:    z.enum(['chroma_key', 'color_correction', 'blur', 'sharpen', 'noise', 'lut']),
    params:  z.record(z.union([z.number(), z.string(), z.boolean()])),
    enabled: z.boolean().default(true),
  })).default([]),
})

export const CreateSourceSchema = z.object({
  type:      z.enum(['CAMERA', 'SCREEN', 'IMAGE', 'VIDEO', 'TEXT', 'BROWSER', 'AUDIO']),
  label:     z.string().min(1).max(50),
  order:     z.number().int().min(0).optional().default(0),
  assetUrl:  z.string().url().optional(),
  config:    SourceTransformSchema.optional().default({}),
})

export const UpdateSourceSchema = z.object({
  label:     z.string().min(1).max(50).optional(),
  order:     z.number().int().min(0).optional(),
  isVisible: z.boolean().optional(),
  assetUrl:  z.string().url().optional(),
  config:    SourceTransformSchema.partial().optional(),
})

export const ReorderSourcesSchema = z.object({
  orderedIds: z.array(z.string()).min(1),
})

export type CreateSourceDto    = z.infer<typeof CreateSourceSchema>
export type UpdateSourceDto    = z.infer<typeof UpdateSourceSchema>
export type ReorderSourcesDto  = z.infer<typeof ReorderSourcesSchema>
