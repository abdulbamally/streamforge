import type { TimelineTrack } from '../../types/track.types'
import type { TimelineHitResult, TimelineMetrics } from '../../types/timeline.types'
import {
  RULER_HEIGHT,
  TRACK_LABEL_WIDTH,
  TRIM_HANDLE_WIDTH,
} from './timelineConstants'
import { layoutClips, layoutTracks } from './timelineLayout'
import { xToTime } from './timelineMath'

export function findClipAtPoint(
  x: number,
  y: number,
  tracks: TimelineTrack[],
  metrics: TimelineMetrics,
): TimelineHitResult {
  const time = Math.max(0, xToTime(x, metrics.pixelsPerSecond, metrics.scrollOffsetX))

  if (y <= RULER_HEIGHT) {
    return { type: 'ruler', time }
  }

  if (x <= TRACK_LABEL_WIDTH) {
    const trackControl = layoutTracks(tracks).find(
      (layout) => y >= layout.y && y <= layout.y + layout.height,
    )
    if (trackControl) return { type: 'track-control', track: trackControl.track }
  }

  const clip = layoutClips(tracks, metrics)
    .filter((layout) => layout.isVisible)
    .find(
      (layout) =>
        x >= layout.x &&
        x <= layout.x + layout.width &&
        y >= layout.y &&
        y <= layout.y + layout.height,
    )

  if (clip) {
    if (x <= clip.x + TRIM_HANDLE_WIDTH) {
      return { type: 'trim-left', clip: clip.clip, track: clip.track }
    }
    if (x >= clip.x + clip.width - TRIM_HANDLE_WIDTH) {
      return { type: 'trim-right', clip: clip.clip, track: clip.track }
    }
    return { type: 'clip', clip: clip.clip, track: clip.track }
  }

  const track = layoutTracks(tracks).find(
    (layout) => y >= layout.y && y <= layout.y + layout.height,
  )

  if (track) {
    return { type: 'track', track: track.track }
  }

  return {
    type: 'empty',
    time,
  }
}
