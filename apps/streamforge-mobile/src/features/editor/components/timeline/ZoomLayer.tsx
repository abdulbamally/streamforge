import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useEditorStore } from '../../store/editorStore'
import {
  EditorColors,
  EditorRadius,
  EditorSpacing,
  EditorTypography,
} from '../../theme/editorTokens'

export function ZoomLayer() {
  const zoomLevel = useEditorStore((state) => state.timeline.zoomLevel)

  return (
    <View pointerEvents="none" style={styles.badge}>
      <Text style={styles.text}>{zoomLevel.toFixed(1)}x</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: EditorSpacing.md,
    bottom: EditorSpacing.md,
    borderRadius: EditorRadius.full,
    backgroundColor: EditorColors.surface,
    borderWidth: 1,
    borderColor: EditorColors.border,
    paddingHorizontal: EditorSpacing.sm,
    paddingVertical: EditorSpacing.xs,
  },
  text: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.micro,
    fontWeight: '800',
  },
})
