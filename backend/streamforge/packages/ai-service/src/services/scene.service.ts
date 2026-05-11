// ============================================================
//  SceneService — AI scene description via OpenAI Vision
//  Gives content creators instant scene summaries, tags, mood
// ============================================================

import { config }   from '../utils/config'
import { logger }   from '../utils/logger'
import { AiErrors } from '../utils/errors'
import type { SceneDescriptionResult } from '../types'

export class SceneService {

  // ─── Describe a scene from an image URL ──────────────────────
  async describe(imageUrl: string, context?: string): Promise<SceneDescriptionResult> {
    const systemPrompt = `You are an AI assistant helping video content creators understand their stream scenes.
Analyse the image and respond ONLY with a valid JSON object — no markdown, no backticks.
JSON shape: { "description": string, "tags": string[], "mood": string, "suggestedTitle": string | null }`

    const userPrompt = context
      ? `Describe this stream scene. Context: "${context}". Keep description under 100 words.`
      : 'Describe this stream scene. Keep description under 100 words.'

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model:      config.OPENAI_MODEL,
          max_tokens: config.OPENAI_MAX_TOKENS,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role:    'user',
              content: [
                { type: 'text',      text: userPrompt },
                { type: 'image_url', image_url: { url: imageUrl, detail: 'low' } },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        const err = await response.text()
        throw new Error(`OpenAI API error ${response.status}: ${err}`)
      }

      const data = await response.json() as any
      const raw  = data.choices?.[0]?.message?.content ?? '{}'

      let parsed: any
      try {
        parsed = JSON.parse(raw)
      } catch {
        // Fallback if model returns non-JSON
        parsed = { description: raw, tags: [], mood: 'unknown', suggestedTitle: null }
      }

      const result: SceneDescriptionResult = {
        description:    parsed.description   ?? '',
        tags:           parsed.tags          ?? [],
        mood:           parsed.mood          ?? 'neutral',
        suggestedTitle: parsed.suggestedTitle ?? null,
        processedAt:    new Date().toISOString(),
      }

      logger.info({ imageUrl, tagCount: result.tags.length }, 'Scene description completed')
      return result

    } catch (err: any) {
      logger.error({ err, imageUrl }, 'Scene description error')
      throw AiErrors.visionFailed(err.message)
    }
  }

  // ─── Generate stream title suggestions ───────────────────────
  async suggestTitles(description: string, platform: string): Promise<string[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model:      config.OPENAI_MODEL,
          max_tokens: 200,
          messages: [
            {
              role:    'system',
              content: 'You are a creative stream title generator. Return ONLY a JSON array of 5 title strings. No markdown.',
            },
            {
              role:    'user',
              content: `Generate 5 catchy ${platform} stream titles for: "${description}"`,
            },
          ],
        }),
      })

      const data = await response.json() as any
      const raw  = data.choices?.[0]?.message?.content ?? '[]'

      try {
        const titles = JSON.parse(raw)
        return Array.isArray(titles) ? titles.slice(0, 5) : []
      } catch {
        return []
      }
    } catch (err: any) {
      logger.error({ err }, 'Title suggestion error')
      return []
    }
  }
}
