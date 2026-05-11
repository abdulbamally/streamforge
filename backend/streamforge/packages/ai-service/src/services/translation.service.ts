// ============================================================
//  TranslationService — Real-time text translation
//  Provider: Google Cloud Translation API v2
//  Caching:  Redis 48hr — same text+lang = same translation
// ============================================================

import { Translate } from '@google-cloud/translate/build/src/v2'
import { createHash } from 'crypto'
import { config }     from '../utils/config'
import { logger }     from '../utils/logger'
import { redis, AiKeys, AiTTL } from '../utils/redis'
import { AiErrors }   from '../utils/errors'
import type { TranslationResult, BatchTranslationResult } from '../types'

export class TranslationService {
  private client: Translate
  private supportedLangs: Set<string>

  constructor() {
    this.client = new Translate({
      keyFilename: config.GOOGLE_APPLICATION_CREDENTIALS,
      projectId:   config.GOOGLE_CLOUD_PROJECT_ID,
    })
    this.supportedLangs = new Set(config.TRANSLATE_SUPPORTED_LANGS.split(','))
  }

  // ─── Translate a single string ────────────────────────────────
  async translate(
    text:           string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<TranslationResult> {
    this.validateLanguage(targetLanguage)

    const cacheKey = AiKeys.translateCache(
      createHash('md5').update(`${text}:${targetLanguage}:${sourceLanguage ?? 'auto'}`).digest('hex')
    )

    const cached = await redis.get(cacheKey)
    if (cached) {
      logger.debug({ targetLanguage }, 'Translation served from cache')
      return JSON.parse(cached)
    }

    try {
      const options: any = { to: targetLanguage }
      if (sourceLanguage) options.from = sourceLanguage

      const [translation, metadata] = await this.client.translate(text, options)

      const result: TranslationResult = {
        originalText:   text,
        translatedText: translation,
        sourceLanguage: (metadata as any)?.data?.translations?.[0]?.detectedSourceLanguage
          ?? sourceLanguage
          ?? 'unknown',
        targetLanguage,
        confidence:     1.0,
        processedAt:    new Date().toISOString(),
      }

      await redis.setex(cacheKey, AiTTL.TRANSLATE_CACHE, JSON.stringify(result))

      logger.info({ targetLanguage, charCount: text.length }, 'Translation completed')
      return result

    } catch (err: any) {
      logger.error({ err, targetLanguage }, 'Translation API error')
      throw AiErrors.translateFailed(err.message)
    }
  }

  // ─── Translate multiple strings in one API call ───────────────
  async translateBatch(
    texts:          string[],
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<BatchTranslationResult> {
    this.validateLanguage(targetLanguage)

    const totalCharacters = texts.reduce((sum, t) => sum + t.length, 0)

    try {
      const options: any = { to: targetLanguage }
      if (sourceLanguage) options.from = sourceLanguage

      const [translations] = await this.client.translate(texts, options)

      const results: TranslationResult[] = texts.map((original, i) => ({
        originalText:   original,
        translatedText: Array.isArray(translations) ? translations[i] : translations,
        sourceLanguage: sourceLanguage ?? 'auto',
        targetLanguage,
        confidence:     1.0,
        processedAt:    new Date().toISOString(),
      }))

      logger.info({ targetLanguage, count: texts.length, totalCharacters }, 'Batch translation completed')

      return { results, totalCharacters, processedAt: new Date().toISOString() }

    } catch (err: any) {
      logger.error({ err }, 'Batch translation error')
      throw AiErrors.translateFailed(err.message)
    }
  }

  // ─── Detect language of a string ──────────────────────────────
  async detectLanguage(text: string): Promise<{ language: string; confidence: number }> {
    try {
      const [detection] = await this.client.detect(text)
      const result = Array.isArray(detection) ? detection[0] : detection
      return {
        language:   result.language,
        confidence: result.confidence ?? 1.0,
      }
    } catch (err: any) {
      throw AiErrors.translateFailed(err.message)
    }
  }

  // ─── Get supported languages ──────────────────────────────────
  getSupportedLanguages(): string[] {
    return Array.from(this.supportedLangs)
  }

  private validateLanguage(lang: string): void {
    if (!this.supportedLangs.has(lang)) {
      throw AiErrors.translateFailed(
        `Language '${lang}' is not supported. Supported: ${this.getSupportedLanguages().join(', ')}`
      )
    }
  }
}
