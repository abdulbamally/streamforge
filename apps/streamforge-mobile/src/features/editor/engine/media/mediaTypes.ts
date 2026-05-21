import type { MediaAssetType } from '../../types/media.types'
import type { TimelineClipType } from '../../types/clip.types'
import type { TimelineTrackType } from '../../types/track.types'

export const SUPPORTED_MEDIA_TYPES: MediaAssetType[] = ['video', 'audio', 'image']

export function mediaTypeToClipType(type: MediaAssetType): TimelineClipType {
  if (type === 'image') return 'image'
  return type
}

export function mediaTypeToTrackType(type: MediaAssetType): TimelineTrackType {
  if (type === 'audio') return 'audio'
  return 'video'
}

export function isVisualClipType(type: TimelineClipType): boolean {
  return type === 'video' || type === 'image' || type === 'text' || type === 'sticker'
}

export function isCompatibleTrackType(
  assetType: MediaAssetType,
  trackType: TimelineTrackType,
): boolean {
  if (assetType === 'audio') return trackType === 'audio'
  return trackType === 'video' || trackType === 'image'
}
