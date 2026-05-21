import { useMemo } from 'react'
import { useEditorStore } from '../store/editorStore'
import type { TimelineMetrics } from '../types/timeline.types'

export function useTimelineMetrics(): TimelineMetrics {
  const timeline = useEditorStore((state) => state.timeline)

  return useMemo(
    () => ({
      viewportWidth: timeline.timelineWidth,
      viewportHeight: timeline.timelineHeight,
      contentWidth: timeline.contentWidth,
      contentHeight: timeline.contentHeight,
      pixelsPerSecond: timeline.pixelsPerSecond,
      scrollOffsetX: timeline.scrollOffsetX,
      scrollOffsetY: timeline.scrollOffsetY,
      visibleStartTime: timeline.visibleStartTime,
      visibleEndTime: timeline.visibleEndTime,
    }),
    [timeline],
  )
}
