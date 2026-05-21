import React from 'react'
import { StyleSheet, View } from 'react-native'

export function SafeAreaGuide() {
  return <View pointerEvents="none" style={styles.frame} />
}

const styles = StyleSheet.create({
  frame: {
    ...StyleSheet.absoluteFillObject,
    margin: '8%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 14,
  },
})
