import React from 'react'
import { StyleSheet, View } from 'react-native'

export function SelectionGuide() {
  return <View pointerEvents="none" style={styles.root} />
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: '18%',
    right: '18%',
    top: '18%',
    bottom: '22%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 12,
  },
})
