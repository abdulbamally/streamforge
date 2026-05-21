import { useMemo } from 'react'
import { Gesture } from 'react-native-gesture-handler'
import { useSharedValue } from 'react-native-reanimated'
import { useEditorStore } from '../../store/editorStore'

export function usePinchZoomGesture() {
  const startZoom = useSharedValue(1)

  return useMemo(
    () =>
      Gesture.Pinch()
        .runOnJS(true)
        .onBegin(() => {
          const state = useEditorStore.getState()
          startZoom.value = state.timeline.zoomLevel
          state.setIsPinching(true)
          state.setActiveGesture('timeline-pinch')
        })
        .onUpdate((event) => {
          useEditorStore.getState().setZoomLevel(startZoom.value * event.scale)
        })
        .onFinalize(() => {
          const state = useEditorStore.getState()
          state.setIsPinching(false)
          state.setActiveGesture('none')
        }),
    [startZoom],
  )
}
