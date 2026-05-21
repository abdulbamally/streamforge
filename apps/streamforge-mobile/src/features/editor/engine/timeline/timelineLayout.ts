import type {
  TimelineClipLayout,
  TimelineMetrics,
  TimelineTrackLayout,
} from '../../types/timeline.types'
import type { TimelineTrack } from '../../types/track.types'
import {
  CLIP_MIN_WIDTH,
  RULER_HEIGHT,
  TIMELINE_SIDE_PADDING,
  TRACK_GAP,
} from './timelineConstants'
import { durationToWidth, getClipEndTime, timeToX } from './timelineMath'

export function getTimelineContentHeight(tracks: TimelineTrack[]): number {
  if (!tracks.length) return RULER_HEIGHT
  const tracksHeight = tracks.reduce((total, track) => total + track.height, 0)
  const gaps = Math.max(0, tracks.length - 1) * TRACK_GAP
  return RULER_HEIGHT + TIMELINE_SIDE_PADDING + tracksHeight + gaps + TIMELINE_SIDE_PADDING
}

export function getTimelineContentWidth(duration: number, pixelsPerSecond: number): number {
  return Math.max(0, duration * pixelsPerSecond + TIMELINE_SIDE_PADDING * 2)
}

export function layoutTracks(tracks: TimelineTrack[]): TimelineTrackLayout[] {
  let y = RULER_HEIGHT + TIMELINE_SIDE_PADDING
  return tracks.map((track) => {
    const layout = { track, y, height: track.height }
    y += track.height + TRACK_GAP
    return layout
  })
}

export function layoutClips(
  tracks: TimelineTrack[],
  metrics: TimelineMetrics,
): TimelineClipLayout[] {
  return layoutTracks(tracks).flatMap(({ track, y, height }) =>
    track.clips.map((clip) => {
      const x = TIMELINE_SIDE_PADDING + timeToX(
        clip.startTime,
        metrics.pixelsPerSecond,
        metrics.scrollOffsetX,
      )
      const width = Math.max(
        durationToWidth(clip.duration, metrics.pixelsPerSecond),
        CLIP_MIN_WIDTH,
      )
      const clipEnd = getClipEndTime(clip)
      const isVisible =
        clipEnd >= metrics.visibleStartTime &&
        clip.startTime <= metrics.visibleEndTime &&
        x + width >= 0 &&
        x <= metrics.viewportWidth

      return {
        clip,
        track,
        x,
        y,
        width,
        height: height - 10,
        isVisible,
      }
    }),
  )
}
