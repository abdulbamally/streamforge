import React from 'react'
import { StyleSheet, View } from 'react-native'

export function OverlayLayer() {
  return (
    <View pointerEvents="none" style={styles.root}>
      <View style={styles.safeFrame} />
      <View style={[styles.guide, styles.guideVertical]} />
      <View style={[styles.guide, styles.guideHorizontal]} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
  },
  safeFrame: {
    position: 'absolute',
    left: '7%',
    right: '7%',
    top: '10%',
    bottom: '10%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 14,
  },
  guide: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  guideVertical: {
    top: '10%',
    bottom: '10%',
    left: '50%',
    width: 1,
  },
  guideHorizontal: {
    left: '7%',
    right: '7%',
    top: '50%',
    height: 1,
  },
})
