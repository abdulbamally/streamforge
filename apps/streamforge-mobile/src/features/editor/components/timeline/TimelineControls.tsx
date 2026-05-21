import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Minus, Plus } from 'lucide-react-native'
import { useEditorStore } from '../../store/editorStore'
import {
  EditorColors,
  EditorRadius,
  EditorSpacing,
  EditorTypography,
} from '../../theme/editorTokens'

export function TimelineControls() {
  const zoomLevel = useEditorStore((state) => state.timeline.zoomLevel)
  const isSnappingEnabled = useEditorStore((state) => state.timeline.isSnappingEnabled)
  const setZoomLevel = useEditorStore((state) => state.setZoomLevel)
  const setSnappingEnabled = useEditorStore((state) => state.setSnappingEnabled)

  return (
    <View style={styles.root}>
      <View style={styles.zoomGroup}>
        <Pressable style={styles.iconButton} onPress={() => setZoomLevel(zoomLevel / 1.2)}>
          <Minus size={16} color={EditorColors.textPrimary} />
        </Pressable>
        <Text style={styles.zoomText}>{zoomLevel.toFixed(1)}x</Text>
        <Pressable style={styles.iconButton} onPress={() => setZoomLevel(zoomLevel * 1.2)}>
          <Plus size={16} color={EditorColors.textPrimary} />
        </Pressable>
      </View>
      <Pressable
        style={[styles.snapButton, isSnappingEnabled && styles.snapButtonActive]}
        onPress={() => setSnappingEnabled(!isSnappingEnabled)}
      >
        <Text style={[styles.snapText, isSnappingEnabled && styles.snapTextActive]}>Snap</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: EditorSpacing.sm,
  },
  zoomGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EditorSpacing.xs,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: EditorColors.border,
    backgroundColor: EditorColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomText: {
    minWidth: 42,
    textAlign: 'center',
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.xs,
    fontWeight: '800',
  },
  snapButton: {
    borderRadius: EditorRadius.full,
    borderWidth: 1,
    borderColor: EditorColors.border,
    paddingHorizontal: EditorSpacing.md,
    paddingVertical: EditorSpacing.sm,
  },
  snapButtonActive: {
    borderColor: EditorColors.accent,
    backgroundColor: EditorColors.accentSoft,
  },
  snapText: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.xs,
    fontWeight: '800',
  },
  snapTextActive: {
    color: EditorColors.accent,
  },
})
