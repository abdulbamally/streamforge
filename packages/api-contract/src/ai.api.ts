// ============================================================
//  StreamForge API Contract — AI Service
//  Base: /api/v1/ai
//  Requires PRO plan or higher
// ============================================================

import { apiFetch } from './client'
import type {
  DetectionResult,
  OcrResult,
  TranslationResult,
  BatchTranslationResult,
  SceneDescriptionResult,
} from './types'

// ─── Request DTOs ─────────────────────────────────────────────
export type DetectionFeature =
  | 'OBJECT_DETECTION'
  | 'LABEL_DETECTION'
  | 'FACE_DETECTION'
  | 'SAFE_SEARCH'

export interface DetectDto {
  imageUrl: string
  features: DetectionFeature[]
}

export interface OcrDto {
  imageUrl:  string
  language?: string  // ISO 639-1 hint e.g. 'en', 'ja', 'zh'
}

export interface TranslateDto {
  text:            string | string[]  // single string or batch array
  targetLanguage:  string             // ISO 639-1 e.g. 'es', 'fr', 'de'
  sourceLanguage?: string             // omit for auto-detect
}

export interface SceneDescribeDto {
  imageUrl:  string
  context?:  string  // e.g. 'gaming stream' to guide the AI
}

export interface SuggestTitlesDto {
  description: string
  platform?:   string  // 'YouTube' | 'Twitch' | 'TikTok' etc.
}

// ─── AI API ───────────────────────────────────────────────────
export const aiApi = {

  /**
   * Detect objects, labels, faces in an image or video frame.
   * Results are cached for 6 hours per unique image.
   * Requires PRO plan or above.
   */
  detect: (dto: DetectDto): Promise<DetectionResult> =>
    apiFetch('/api/v1/ai/detect', { method: 'POST', body: JSON.stringify(dto) }),

  /**
   * Extract text from an image or video frame (OCR).
   * Results are cached 24 hours per unique image.
   * Requires PRO plan or above.
   */
  extractText: (dto: OcrDto): Promise<OcrResult> =>
    apiFetch('/api/v1/ai/ocr', { method: 'POST', body: JSON.stringify(dto) }),

  /**
   * Translate text to a target language.
   * Pass an array of strings for batch translation.
   * Results are cached 48 hours.
   * Requires PRO plan or above.
   */
  translate: (dto: TranslateDto): Promise<TranslationResult | BatchTranslationResult> =>
    apiFetch('/api/v1/ai/translate', { method: 'POST', body: JSON.stringify(dto) }),

  /**
   * Detect the language of a text string.
   */
  detectLanguage: (text: string): Promise<{ language: string; confidence: number }> =>
    apiFetch('/api/v1/ai/detect-language', {
      method: 'POST',
      body:   JSON.stringify({ text }),
    }),

  /**
   * Get supported translation languages.
   * No auth required.
   */
  getSupportedLanguages: (): Promise<{ languages: string[] }> =>
    apiFetch('/api/v1/ai/languages'),

  /**
   * Get AI description of a scene from an image URL.
   * Returns description, tags, mood, and a suggested stream title.
   * Requires PRO plan or above.
   */
  describeScene: (dto: SceneDescribeDto): Promise<SceneDescriptionResult> =>
    apiFetch('/api/v1/ai/scene/describe', { method: 'POST', body: JSON.stringify(dto) }),

  /**
   * Generate stream title suggestions from a scene description.
   * Requires PRO plan or above.
   */
  suggestTitles: (dto: SuggestTitlesDto): Promise<{ titles: string[] }> =>
    apiFetch('/api/v1/ai/scene/suggest-titles', {
      method: 'POST',
      body:   JSON.stringify(dto),
    }),

  /**
   * Get AI feature access info per plan.
   * No auth required.
   */
  getPlansInfo: (): Promise<{
    allowedPlans: string[]
    rateLimits:   Record<string, string>
  }> =>
    apiFetch('/api/v1/ai/plans'),
}
