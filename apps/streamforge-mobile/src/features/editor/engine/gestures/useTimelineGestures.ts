import { useMemo } from 'react'
import { Gesture } from 'react-native-gesture-handler'
import type { TimelineMetrics } from '../../types/timeline.types'
import { selectAtTimelinePoint, useClipDragGesture } from './useClipDragGesture'
import { usePinchZoomGesture } from './usePinchZoomGesture'

export function useTimelineGestures(metrics: TimelineMetrics) {
  const pan = useClipDragGesture(metrics)
  const pinch = usePinchZoomGesture()

  const tap = useMemo(
    () =>
      Gesture.Tap()
        .runOnJS(true)
        .maxDuration(220)
        .onEnd((event) => {
          selectAtTimelinePoint(event.x, event.y, metrics)
        }),
    [metrics],
  )

  return useMemo(
    () => Gesture.Simultaneous(pinch, Gesture.Exclusive(pan, tap)),
    [pan, pinch, tap],
  )
}
