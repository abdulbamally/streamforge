import React from 'react'
import type { LayoutChangeEvent } from 'react-native'
import { StyleSheet, View } from 'react-native'
import { EditorTimelineCanvas } from '../../canvas/EditorTimelineCanvas'
import type { TimelineClip } from '../../engine/types'
import { ClipRenderer } from './ClipRenderer'

type TrackRendererProps = {
  clips: TimelineClip[]
  currentTime: number
  pixelsPerSecond: number
  width: number
  onLayout: (event: LayoutChangeEvent) => void
}

const HEIGHT = 140

export function TrackRenderer({
  clips,
  currentTime,
  pixelsPerSecond,
  width,
  onLayout,
}: TrackRendererProps) {
  return (
    <View style={styles.root} onLayout={onLayout}>
      {width > 0 ? (
        <EditorTimelineCanvas
          clips={clips}
          width={width}
          height={HEIGHT}
          pixelsPerSecond={pixelsPerSecond}
          currentTime={currentTime}
        />
      ) : null}
      <ClipRenderer clips={clips} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    height: HEIGHT,
    overflow: 'hidden',
  },
})
