// ============================================================
//  OcrService — Text extraction from images and video frames
//  Provider: Google Cloud Vision (DOCUMENT_TEXT_DETECTION)
//  Caching:  Redis 24hr — same image always gives same text
// ============================================================

import { ImageAnnotatorClient } from "@google-cloud/vision";
import { createHash } from "crypto";
import { config } from "../utils/config";
import { logger } from "../utils/logger";
import { redis, AiKeys, AiTTL } from "../utils/redis";
import { AiErrors } from "../utils/errors";
import type { OcrResult, TextBlock, BoundingBox } from "../types";

export class OcrService {
  private client: ImageAnnotatorClient;

  constructor() {
    this.client = new ImageAnnotatorClient({
      keyFilename: config.GOOGLE_APPLICATION_CREDENTIALS,
      projectId: config.GOOGLE_CLOUD_PROJECT_ID,
    });
  }

  // ─── Extract text from image URL ──────────────────────────────
  async extractText(
    imageUrl: string,
    languageHint?: string,
  ): Promise<OcrResult> {
    const cacheKey = AiKeys.ocrCache(
      createHash("md5")
        .update(`${imageUrl}:${languageHint ?? ""}`)
        .digest("hex"),
    );

    // Serve from cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      logger.debug({ imageUrl }, "OCR result served from cache");
      return { ...JSON.parse(cached), cached: true };
    }

    try {
      const [response] = await this.client.annotateImage({
        image: { source: { imageUri: imageUrl } },
        features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
        imageContext: languageHint
          ? { languageHints: [languageHint] }
          : undefined,
      });

      const fullText = response.fullTextAnnotation?.text ?? "";
      const pages = response.fullTextAnnotation?.pages ?? [];
      const blocks = this.parseBlocks(pages);
      const language =
        response.fullTextAnnotation?.pages?.[0]?.property
          ?.detectedLanguages?.[0]?.languageCode ?? null;
      const confidence = this.averageConfidence(blocks);

      const result: OcrResult = {
        fullText,
        blocks,
        confidence,
        language,
        processedAt: new Date().toISOString(),
      };

      await redis.setex(cacheKey, AiTTL.OCR_CACHE, JSON.stringify(result));

      logger.info(
        { imageUrl, charCount: fullText.length, blockCount: blocks.length },
        "OCR completed",
      );
      return result;
    } catch (err: any) {
      logger.error({ err, imageUrl }, "OCR API error");
      throw AiErrors.ocrFailed(err.message);
    }
  }

  // ─── Extract text from a video frame (base64) ────────────────
  async extractFromBase64(
    base64Image: string,
    mimeType = "image/jpeg",
  ): Promise<OcrResult> {
    try {
      const [response] = await this.client.annotateImage({
        image: { content: base64Image },
        features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
      });

      const fullText = response.fullTextAnnotation?.text ?? "";
      const pages = response.fullTextAnnotation?.pages ?? [];
      const blocks = this.parseBlocks(pages);

      return {
        fullText,
        blocks,
        confidence: this.averageConfidence(blocks),
        language: null,
        processedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      throw AiErrors.ocrFailed(err.message);
    }
  }

  // ─── Parse Vision API pages into TextBlocks ───────────────────
  private parseBlocks(pages: any[]): TextBlock[] {
    const blocks: TextBlock[] = [];

    for (const page of pages) {
      for (const block of page.blocks ?? []) {
        const text =
          block.paragraphs
            ?.flatMap((p: any) => p.words ?? [])
            .flatMap((w: any) => w.symbols ?? [])
            .map((s: any) => s.text ?? "")
            .join("") ?? "";

        const language =
          block.property?.detectedLanguages?.[0]?.languageCode ?? null;

        blocks.push({
          text,
          confidence: block.confidence ?? 0,
          boundingBox: this.parseBoundingBox(block.boundingBox),
          language,
        });
      }
    }

    return blocks;
  }

  private parseBoundingBox(box: any): BoundingBox {
    if (!box?.vertices?.length) return { x: 0, y: 0, width: 0, height: 0 };
    const verts = box.vertices;
    const xs = verts.map((v: any) => v.x ?? 0);
    const ys = verts.map((v: any) => v.y ?? 0);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    return {
      x: minX,
      y: minY,
      width: Math.max(...xs) - minX,
      height: Math.max(...ys) - minY,
    };
  }

  private averageConfidence(blocks: TextBlock[]): number {
    if (!blocks.length) return 0;
    return blocks.reduce((sum, b) => sum + b.confidence, 0) / blocks.length;
  }
}
