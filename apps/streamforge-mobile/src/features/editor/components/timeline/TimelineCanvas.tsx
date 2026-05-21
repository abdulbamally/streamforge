import React, { useCallback, useMemo } from 'react'
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native'
import { Canvas } from '@shopify/react-native-skia'
import { GestureDetector } from 'react-native-gesture-handler'
import { drawTimeline } from '../../canvas/drawTimeline'
import { useTimelineGestures } from '../../engine/gestures/useTimelineGestures'
import { useTimelineAutoScroll } from '../../engine/synchronization/useTimelineAutoScroll'
import { useTimelineMetrics } from '../../hooks/useTimelineMetrics'
import { useEditorStore } from '../../store/editorStore'
import { EditorColors, EditorRadius } from '../../theme/editorTokens'

export function TimelineCanvas() {
  const tracks = useEditorStore((state) => state.tracks)
  const currentTime = useEditorStore((state) => state.playback.currentTime)
  const selectedClipId = useEditorStore((state) => state.selection.selectedClipId)
  const contentHeight = useEditorStore((state) => state.timeline.contentHeight)
  const activeSnapGuide = useEditorStore((state) => state.timeline.activeSnapGuide)
  const setTimelineSize = useEditorStore((state) => state.setTimelineSize)
  const metrics = useTimelineMetrics()
  const gestures = useTimelineGestures(metrics)
  useTimelineAutoScroll()

  const height = Math.max(260, contentHeight)

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      setTimelineSize(event.nativeEvent.layout.width, height)
    },
    [height, setTimelineSize],
  )

  const nodes = useMemo(
    () =>
      drawTimeline({
        tracks,
        metrics: {
          ...metrics,
          viewportHeight: height,
        },
        currentTime,
        selectedClipId,
        activeSnapGuide,
        font: null,
      }),
    [tracks, metrics, height, currentTime, selectedClipId, activeSnapGuide],
  )

  return (
    <View style={[styles.root, { height }]} onLayout={handleLayout}>
      <GestureDetector gesture={gestures}>
        <Canvas style={styles.canvas}>{nodes}</Canvas>
      </GestureDetector>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    borderRadius: EditorRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: EditorColors.border,
    backgroundColor: EditorColors.surfaceSoft,
  },
  canvas: {
    flex: 1,
  },
})
