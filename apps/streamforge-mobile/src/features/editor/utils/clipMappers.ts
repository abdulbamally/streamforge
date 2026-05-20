import type { Clip } from '@streamforge/api-contract'
import type { TimelineClip } from '../engine/types'

export function apiClipToTimeline(clip: Clip): TimelineClip {
  const trimOut = clip.trimOut ?? clip.endTime - clip.startTime + clip.trimIn
  const duration = trimOut - clip.trimIn
  return {
    id: clip.id,
    sourceUri: clip.assetUrl,
    sourceStart: clip.trimIn,
    sourceEnd: trimOut,
    timelineStart: clip.startTime,
    duration,
    trackIndex: clip.trackIndex,
    speed: clip.speed,
  }
}

export function timelineClipsFromApi(clips: Clip[]): TimelineClip[] {
  return clips.map(apiClipToTimeline)
}
