import type { TimelineTrack } from '../../types/track.types'
import type { PreviewOverlayState } from '../../types/preview.types'
import { isVisualClipType } from '../media/mediaTypes'
import { isClipActiveAtTime } from './transformMath'

type Args = {
  tracks: TimelineTrack[]
  selectedClipId: string | null
  currentTime: number
  showSafeArea: boolean
  showTransform: boolean
}

export function getPreviewOverlayState({
  tracks,
  selectedClipId,
  currentTime,
  showSafeArea,
  showTransform,
}: Args): PreviewOverlayState {
  if (!selectedClipId) {
    return { clip: null, visible: false, showSafeArea, showTransform: false }
  }

  for (const track of tracks) {
    const clip = track.clips.find((item) => item.id === selectedClipId)
    if (!clip) continue
    const visible =
      isVisualClipType(clip.type) &&
      track.isVisible &&
      isClipActiveAtTime(clip, currentTime)
    return {
      clip,
      visible,
      showSafeArea,
      showTransform: showTransform || visible,
    }
  }

  return { clip: null, visible: false, showSafeArea, showTransform: false }
}
