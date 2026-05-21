import React from 'react'
import { StyleSheet, View } from 'react-native'
import { EditorColors, EditorRadius } from '../../theme/editorTokens'

type TrimHandleOverlayProps = {
  visible: boolean
}

export function TrimHandleOverlay({ visible }: TrimHandleOverlayProps) {
  if (!visible) return null
  return (
    <View pointerEvents="none" style={styles.root}>
      <View style={styles.handle} />
      <View style={styles.handle} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 3,
  },
  handle: {
    width: 8,
    borderRadius: EditorRadius.sm,
    backgroundColor: EditorColors.accent,
    opacity: 0.88,
  },
})

