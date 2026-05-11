// ============================================================
//  AI Service — Zod Validation Schemas
// ============================================================

import { z } from 'zod'

// ─── Object Detection ─────────────────────────────────────────
export const DetectSchema = z.object({
  imageUrl: z.string().url('Must be a valid image URL'),
  features: z.array(
    z.enum(['OBJECT_DETECTION', 'LABEL_DETECTION', 'FACE_DETECTION', 'SAFE_SEARCH'])
  ).min(1).default(['OBJECT_DETECTION', 'LABEL_DETECTION']),
})

export type DetectDto = z.infer<typeof DetectSchema>

// ─── OCR ──────────────────────────────────────────────────────
export const OcrSchema = z.object({
  imageUrl: z.string().url('Must be a valid image URL'),
  language: z.string().length(2).optional(),   // ISO 639-1 hint e.g. "en", "ja"
})

export type OcrDto = z.infer<typeof OcrSchema>

// ─── Translation ──────────────────────────────────────────────
export const TranslateSchema = z.object({
  text:           z.union([
    z.string().min(1).max(5000),
    z.array(z.string().min(1).max(5000)).min(1).max(50),
  ]),
  targetLanguage: z.string().length(2, 'Must be a 2-letter ISO 639-1 language code'),
  sourceLanguage: z.string().length(2).optional(),  // Auto-detect if omitted
})

export type TranslateDto = z.infer<typeof TranslateSchema>

// ─── Scene Description ────────────────────────────────────────
export const SceneDescribeSchema = z.object({
  imageUrl: z.string().url('Must be a valid image URL'),
  context:  z.string().max(200).optional(),  // e.g. "gaming stream" to guide the AI
})

export type SceneDescribeDto = z.infer<typeof SceneDescribeSchema>

// ─── Live frame analysis (mobile streams) ────────────────────
export const LiveAnalyzeSchema = z.object({
  streamId: z.string().min(1),
  imageUrl: z.string().url(),
  features: z.array(
    z.enum(['OBJECT_DETECTION', 'OCR', 'FACE_DETECTION'])
  ).min(1),
})

export type LiveAnalyzeDto = z.infer<typeof LiveAnalyzeSchema>
