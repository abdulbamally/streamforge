import React from 'react'
import { StyleSheet, View } from 'react-native'

export function GestureLayer() {
  return <View pointerEvents="none" style={styles.root} />
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
  },
})
