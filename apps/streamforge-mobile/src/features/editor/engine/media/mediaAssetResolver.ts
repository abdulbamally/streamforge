import type { MediaAsset } from '../../types/media.types'
import type { TimelineClip } from '../../types/clip.types'

export function resolveClipMediaAsset(
  clip: TimelineClip,
  mediaAssets: Record<string, MediaAsset>,
): MediaAsset | null {
  if (!clip.assetId) return null
  return mediaAssets[clip.assetId] ?? null
}
