import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { TimelineClip } from '../../types/clip.types'
import { TransformHandle } from './TransformHandle'

type TransformOverlayProps = {
  clip: TimelineClip
}

export function TransformOverlay({ clip }: TransformOverlayProps) {
  const transform = clip.transform
  const scale = Math.max(0.5, Math.min(transform?.scale ?? 1, 2))
  const left = `${50 + (transform?.x ?? 0) * 35}%` as `${number}%`
  const top = `${50 + (transform?.y ?? 0) * 35}%` as `${number}%`
  return (
    <View
      pointerEvents="none"
      style={[
        styles.root,
        {
          left,
          top,
          transform: [
            { translateX: -80 },
            { translateY: -50 },
            { scale },
            { rotate: `${transform?.rotation ?? 0}deg` },
          ],
        },
      ]}
    >
      <TransformHandle position="topLeft" />
      <TransformHandle position="topRight" />
      <TransformHandle position="bottomLeft" />
      <TransformHandle position="bottomRight" />
      <TransformHandle position="rotate" />
      <Text style={styles.moveHint}>move</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    width: 160,
    height: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    borderRadius: 12,
    backgroundColor: 'rgba(79,70,229,0.08)',
  },
  moveHint: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    marginTop: -6,
    color: 'rgba(255,255,255,0.62)',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
})
