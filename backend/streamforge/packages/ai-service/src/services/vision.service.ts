// ============================================================
//  VisionService — Object detection, labels, faces, safe search
//  Provider: Google Cloud Vision API
//  Caching: Redis (6hr TTL per image hash)
// ============================================================

import { ImageAnnotatorClient } from '@google-cloud/vision'
import { createHash }  from 'crypto'
import { config }      from '../utils/config'
import { logger }      from '../utils/logger'
import { redis, AiKeys, AiTTL } from '../utils/redis'
import { AiErrors }    from '../utils/errors'
import type {
  DetectionResult,
  DetectedObject,
  DetectedLabel,
  DetectedFace,
  SafeSearchResult,
  BoundingBox,
} from '../types'

type VisionFeature = 'OBJECT_DETECTION' | 'LABEL_DETECTION' | 'FACE_DETECTION' | 'SAFE_SEARCH'

export class VisionService {
  private client: ImageAnnotatorClient

  constructor() {
    this.client = new ImageAnnotatorClient({
      keyFilename: config.GOOGLE_APPLICATION_CREDENTIALS,
      projectId:   config.GOOGLE_CLOUD_PROJECT_ID,
    })
  }

  // ─── Main detection method ────────────────────────────────────
  async detect(imageUrl: string, features: VisionFeature[]): Promise<DetectionResult> {
    // Cache key based on URL hash + requested features
    const cacheKey = AiKeys.detectCache(
      createHash('md5').update(`${imageUrl}:${features.sort().join(',')}`).digest('hex')
    )

    // Return cached result if available
    const cached = await redis.get(cacheKey)
    if (cached) {
      logger.debug({ imageUrl }, 'Vision result served from cache')
      return { ...JSON.parse(cached), cached: true }
    }

    try {
      const requests = this.buildRequests(imageUrl, features)
      const [response] = await this.client.annotateImage(requests)

      const result: DetectionResult = {
        objects:     this.parseObjects(response.localizedObjectAnnotations ?? []),
        labels:      this.parseLabels(response.labelAnnotations ?? []),
        faces:       this.parseFaces(response.faceAnnotations ?? []),
        safeSearch:  this.parseSafeSearch(response.safeSearchAnnotation),
        processedAt: new Date().toISOString(),
      }

      // Cache the result
      await redis.setex(cacheKey, AiTTL.DETECT_CACHE, JSON.stringify(result))

      logger.info({ imageUrl, objectCount: result.objects.length, labelCount: result.labels.length }, 'Vision detection completed')
      return result

    } catch (err: any) {
      logger.error({ err, imageUrl }, 'Vision API error')
      throw AiErrors.visionFailed(err.message)
    }
  }

  // ─── Build Vision API request ─────────────────────────────────
  private buildRequests(imageUrl: string, features: VisionFeature[]) {
    const featureMap: Record<VisionFeature, object> = {
      OBJECT_DETECTION: { type: 'OBJECT_LOCALIZATION', maxResults: config.VISION_MAX_RESULTS },
      LABEL_DETECTION:  { type: 'LABEL_DETECTION',     maxResults: config.VISION_MAX_RESULTS },
      FACE_DETECTION:   { type: 'FACE_DETECTION',      maxResults: config.VISION_MAX_RESULTS },
      SAFE_SEARCH:      { type: 'SAFE_SEARCH_DETECTION' },
    }

    return {
      image:    { source: { imageUri: imageUrl } },
      features: features.map(f => featureMap[f]),
    }
  }

  // ─── Parsers ──────────────────────────────────────────────────
  private parseObjects(annotations: any[]): DetectedObject[] {
    return annotations.map(obj => ({
      name:        obj.name,
      confidence:  obj.score ?? 0,
      category:    obj.name,
      boundingBox: this.normalizeBoundingPoly(obj.boundingPoly),
    }))
  }

  private parseLabels(annotations: any[]): DetectedLabel[] {
    return annotations.map(label => ({
      name:        label.description,
      confidence:  label.score ?? 0,
      topicality:  label.topicality ?? 0,
    }))
  }

  private parseFaces(annotations: any[]): DetectedFace[] {
    return annotations.map(face => ({
      confidence:          face.detectionConfidence ?? 0,
      boundingBox:         this.normalizeBoundingPoly(face.boundingPoly),
      joyLikelihood:       face.joyLikelihood ?? 'UNKNOWN',
      sorrowLikelihood:    face.sorrowLikelihood ?? 'UNKNOWN',
      angerLikelihood:     face.angerLikelihood ?? 'UNKNOWN',
      surpriseLikelihood:  face.surpriseLikelihood ?? 'UNKNOWN',
    }))
  }

  private parseSafeSearch(annotation: any): SafeSearchResult {
    return {
      adult:    annotation?.adult    ?? 'UNKNOWN',
      violence: annotation?.violence ?? 'UNKNOWN',
      racy:     annotation?.racy     ?? 'UNKNOWN',
    }
  }

  private normalizeBoundingPoly(poly: any): BoundingBox {
    if (!poly?.normalizedVertices?.length) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }
    const verts = poly.normalizedVertices
    const xs = verts.map((v: any) => v.x ?? 0)
    const ys = verts.map((v: any) => v.y ?? 0)
    const minX = Math.min(...xs)
    const minY = Math.min(...ys)
    return {
      x:      minX,
      y:      minY,
      width:  Math.max(...xs) - minX,
      height: Math.max(...ys) - minY,
    }
  }
}
