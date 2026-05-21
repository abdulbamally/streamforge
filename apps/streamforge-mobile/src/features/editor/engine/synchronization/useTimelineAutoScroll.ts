import { useEffect } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { timeToX } from '../timeline/timelineMath'

export function useTimelineAutoScroll() {
  const currentTime = useEditorStore((state) => state.playback.currentTime)
  const isPlaying = useEditorStore((state) => state.playback.isPlaying)
  const timeline = useEditorStore((state) => state.timeline)
  const setScrollOffsetX = useEditorStore((state) => state.setScrollOffsetX)

  useEffect(() => {
    if (!isPlaying || !timeline.autoScrollEnabled || !timeline.followPlayhead) return
    if (timeline.timelineWidth <= 0) return

    const playheadX = timeToX(
      currentTime,
      timeline.pixelsPerSecond,
      timeline.scrollOffsetX,
    )

    if (timeline.playheadLockedToCenter) {
      setScrollOffsetX(currentTime * timeline.pixelsPerSecond - timeline.timelineWidth / 2)
      return
    }

    if (playheadX > timeline.timelineWidth * 0.75) {
      setScrollOffsetX(
        currentTime * timeline.pixelsPerSecond - timeline.timelineWidth * 0.5,
      )
    } else if (playheadX < timeline.timelineWidth * 0.25) {
      setScrollOffsetX(
        currentTime * timeline.pixelsPerSecond - timeline.timelineWidth * 0.25,
      )
    }
  }, [currentTime, isPlaying, setScrollOffsetX, timeline])
}
