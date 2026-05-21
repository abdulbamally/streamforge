import React from 'react'
import { StyleSheet, View } from 'react-native'
import { EditorColors } from '../../theme/editorTokens'

type SnapGuideOverlayProps = {
  visible: boolean
}

export function SnapGuideOverlay({ visible }: SnapGuideOverlayProps) {
  if (!visible) return null
  return <View pointerEvents="none" style={styles.guide} />
}

const styles = StyleSheet.create({
  guide: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: EditorColors.accent,
  },
})

