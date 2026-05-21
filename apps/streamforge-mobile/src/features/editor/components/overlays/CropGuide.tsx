import React from 'react'
import { StyleSheet, View } from 'react-native'

export function CropGuide() {
  return (
    <View pointerEvents="none" style={styles.root}>
      <View style={styles.vertical} />
      <View style={styles.horizontal} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
  },
  vertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  horizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
})
