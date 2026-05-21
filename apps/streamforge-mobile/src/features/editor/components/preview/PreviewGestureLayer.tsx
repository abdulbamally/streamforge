import React, { useMemo, useRef, useState } from 'react'
import { PanResponder, StyleSheet, View, type LayoutChangeEvent } from 'react-native'
import type { TimelineClip } from '../../types/clip.types'
import { clampNormalizedPosition } from '../../engine/preview/previewCoordinateUtils'
import { useEditorStore } from '../../store/editorStore'

type PreviewGestureLayerProps = {
  clip: TimelineClip
}

export function PreviewGestureLayer({ clip }: PreviewGestureLayerProps) {
  const updateSelectedClipTransform = useEditorStore((state) => state.updateSelectedClipTransform)
  const setActiveTransformGesture = useEditorStore((state) => state.setActiveTransformGesture)
  const [size, setSize] = useState({ width: 1, height: 1 })
  const start = useRef({ x: clip.transform?.x ?? 0, y: clip.transform?.y ?? 0 })

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          start.current = {
            x: clip.transform?.x ?? 0,
            y: clip.transform?.y ?? 0,
          }
          setActiveTransformGesture('drag')
        },
        onPanResponderRelease: (_event, gesture) => {
          const next = clampNormalizedPosition({
            x: start.current.x + (gesture.dx / Math.max(1, size.width)) * 2,
            y: start.current.y + (gesture.dy / Math.max(1, size.height)) * 2,
          })
          updateSelectedClipTransform(next, true)
          setActiveTransformGesture('none')
        },
        onPanResponderTerminate: () => {
          setActiveTransformGesture('none')
        },
      }),
    [clip.transform?.x, clip.transform?.y, setActiveTransformGesture, size.height, size.width, updateSelectedClipTransform],
  )

  function handleLayout(event: LayoutChangeEvent) {
    setSize({
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    })
  }

  return <View style={styles.root} onLayout={handleLayout} {...panResponder.panHandlers} />
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
  },
})
