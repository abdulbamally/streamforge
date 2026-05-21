import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { usePreviewOverlay } from '../../hooks/usePreviewOverlay'
import { SafeAreaOverlay } from './SafeAreaOverlay'
import { TransformOverlay } from './TransformOverlay'

export function PreviewOverlay() {
  const overlay = usePreviewOverlay()

  return (
    <View pointerEvents="none" style={styles.root}>
      {overlay.showSafeArea ? <SafeAreaOverlay /> : null}
      {overlay.visible && overlay.clip ? (
        <>
          <TransformOverlay clip={overlay.clip} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{overlay.clip.name}</Text>
          </View>
        </>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
  },
  badge: {
    position: 'absolute',
    left: '20%',
    top: '20%',
    transform: [{ translateY: -28 }],
    borderRadius: 999,
    backgroundColor: 'rgba(17,24,39,0.72)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
})
