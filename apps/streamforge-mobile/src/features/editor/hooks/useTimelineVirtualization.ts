import { useMemo } from 'react'
import { getVisibleClips, getVisibleTracks } from '../engine/timeline/timelineVirtualization'
import type { TimelineMetrics } from '../types/timeline.types'
import type { TimelineTrack } from '../types/track.types'

export function useTimelineVirtualization(tracks: TimelineTrack[], metrics: TimelineMetrics) {
  return useMemo(
    () => ({
      visibleTracks: getVisibleTracks(tracks, metrics.scrollOffsetY, metrics.viewportHeight),
      visibleClips: getVisibleClips(tracks, metrics.visibleStartTime, metrics.visibleEndTime),
    }),
    [tracks, metrics.scrollOffsetY, metrics.viewportHeight, metrics.visibleStartTime, metrics.visibleEndTime],
  )
}
