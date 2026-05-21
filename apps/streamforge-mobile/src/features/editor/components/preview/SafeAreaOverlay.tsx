import React from 'react'
import { StyleSheet, View } from 'react-native'

export function SafeAreaOverlay() {
  return (
    <View pointerEvents="none" style={styles.root}>
      <View style={styles.safeFrame} />
      <View style={styles.verticalSafe} />
      <View style={styles.squareSafe} />
      <View style={[styles.guide, styles.guideVertical]} />
      <View style={[styles.guide, styles.guideHorizontal]} />
      <View style={[styles.guide, styles.thirdOne]} />
      <View style={[styles.guide, styles.thirdTwo]} />
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
  verticalSafe: {
    position: 'absolute',
    left: '31%',
    right: '31%',
    top: '6%',
    bottom: '6%',
    borderWidth: 1,
    borderColor: 'rgba(112,215,208,0.22)',
    borderRadius: 12,
  },
  squareSafe: {
    position: 'absolute',
    left: '22%',
    right: '22%',
    top: '22%',
    bottom: '22%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 10,
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
  thirdOne: {
    top: '10%',
    bottom: '10%',
    left: '33.33%',
    width: 1,
  },
  thirdTwo: {
    top: '10%',
    bottom: '10%',
    left: '66.66%',
    width: 1,
  },
})
