import React from 'react'
import { StyleSheet, View } from 'react-native'

export function TransformControls() {
  return (
    <View pointerEvents="none" style={styles.root}>
      <View style={[styles.handle, styles.topLeft]} />
      <View style={[styles.handle, styles.topRight]} />
      <View style={[styles.handle, styles.bottomLeft]} />
      <View style={[styles.handle, styles.bottomRight]} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: '20%',
    right: '20%',
    top: '20%',
    bottom: '24%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 12,
  },
  handle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  topLeft: {
    top: -5,
    left: -5,
  },
  topRight: {
    top: -5,
    right: -5,
  },
  bottomLeft: {
    bottom: -5,
    left: -5,
  },
  bottomRight: {
    bottom: -5,
    right: -5,
  },
})
