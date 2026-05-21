import React from 'react'
import { StyleSheet, View } from 'react-native'
import { EditorColors } from '../../theme/editorTokens'

export function Scrubber() {
  return <View pointerEvents="none" style={styles.root} />
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    bottom: 12,
    left: '50%',
    width: 1,
    backgroundColor: EditorColors.accent,
    opacity: 0.16,
  },
})
