import type { TimelineClip } from '../../types/clip.types'
import type { TimelineTrack } from '../../types/track.types'
import { RULER_HEIGHT, TIMELINE_SIDE_PADDING, TRACK_GAP } from './timelineConstants'
import { getClipEndTime } from './timelineMath'

export function shouldRenderClip(
  clip: TimelineClip,
  visibleStartTime: number,
  visibleEndTime: number,
): boolean {
  return getClipEndTime(clip) >= visibleStartTime && clip.startTime <= visibleEndTime
}

export function getVisibleClips(
  tracks: TimelineTrack[],
  visibleStartTime: number,
  visibleEndTime: number,
): TimelineClip[] {
  return tracks.flatMap((track) =>
    track.clips.filter((clip) => shouldRenderClip(clip, visibleStartTime, visibleEndTime)),
  )
}

export function getVisibleTracks(
  tracks: TimelineTrack[],
  scrollOffsetY: number,
  viewportHeight: number,
): TimelineTrack[] {
  let y = RULER_HEIGHT + TIMELINE_SIDE_PADDING
  return tracks.filter((track) => {
    const top = y
    const bottom = y + track.height
    y = bottom + TRACK_GAP
    return bottom >= scrollOffsetY && top <= scrollOffsetY + viewportHeight
  })
}

export function getVisibleThumbnailRange(
  clip: TimelineClip,
  visibleStartTime: number,
  visibleEndTime: number,
) {
  return {
    start: Math.max(clip.startTime, visibleStartTime),
    end: Math.min(getClipEndTime(clip), visibleEndTime),
  }
}
