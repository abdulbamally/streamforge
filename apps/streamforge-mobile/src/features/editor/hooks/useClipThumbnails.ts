import { useMemo } from 'react'
import type { TimelineClip } from '../types/clip.types'
import type { MediaAsset } from '../types/media.types'
import { getThumbnailDensity } from '../engine/media/thumbnailService'

export function useClipThumbnails(
  clip: TimelineClip | null,
  asset: MediaAsset | null,
  clipWidth: number,
  zoomLevel: number,
) {
  return useMemo(() => {
    if (!clip) return []
    const density = getThumbnailDensity(clipWidth, zoomLevel)
    const source = clip.thumbnailUris?.length
      ? clip.thumbnailUris
      : asset?.thumbnailUri
        ? [asset.thumbnailUri]
        : []
    if (!source.length) return []
    return Array.from({ length: density.count }, (_, index) => source[index % source.length])
  }, [asset?.thumbnailUri, clip, clipWidth, zoomLevel])
}
