import type { MediaAsset } from '../../types/media.types'

export type ThumbnailDensity = {
  count: number
  segmentWidth: number
}

export function getThumbnailDensity(clipWidth: number, zoomLevel: number): ThumbnailDensity {
  if (clipWidth < 80 || zoomLevel < 0.8) {
    return { count: 1, segmentWidth: clipWidth }
  }
  const targetWidth = zoomLevel >= 2 ? 54 : 72
  const count = Math.max(1, Math.min(12, Math.floor(clipWidth / targetWidth)))
  return { count, segmentWidth: clipWidth / count }
}

export async function resolveAssetThumbnail(asset: MediaAsset): Promise<string | null> {
  if (asset.thumbnailUri) return asset.thumbnailUri
  if (asset.type === 'image') return asset.uri
  return null
}

export function buildThumbnailStrip(asset: MediaAsset, maxCount = 8): string[] {
  const thumbnail = asset.thumbnailUri ?? (asset.type === 'image' ? asset.uri : undefined)
  if (!thumbnail) return []
  return Array.from({ length: Math.max(1, maxCount) }, () => thumbnail)
}
