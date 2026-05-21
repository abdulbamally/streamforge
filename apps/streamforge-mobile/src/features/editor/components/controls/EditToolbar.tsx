import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Copy, Magnet, Scissors, Trash2 } from 'lucide-react-native'
import { useEditCommands } from '../../hooks/useEditCommands'
import {
  EditorColors,
  EditorRadius,
  EditorSpacing,
  EditorTypography,
} from '../../theme/editorTokens'
import { UndoRedoControls } from './UndoRedoControls'
import { ToolModeSelector } from './ToolModeSelector'

export function EditToolbar() {
  const {
    canDelete,
    canSplit,
    deleteSelected,
    snappingEnabled,
    split,
    toggleSnapping,
  } = useEditCommands()

  return (
    <View style={styles.root}>
      <ToolModeSelector />
      <View style={styles.actions}>
        <UndoRedoControls />
        <Pressable
          onPress={split}
          disabled={!canSplit}
          style={[styles.action, !canSplit && styles.disabled]}
        >
          <Scissors size={15} color={EditorColors.textPrimary} />
          <Text style={styles.actionText}>Split</Text>
        </Pressable>
        <Pressable
          onPress={deleteSelected}
          disabled={!canDelete}
          style={[styles.action, !canDelete && styles.disabled]}
        >
          <Trash2 size={15} color={EditorColors.danger} />
          <Text style={[styles.actionText, styles.danger]}>Delete</Text>
        </Pressable>
        <Pressable disabled style={[styles.action, styles.disabled]}>
          <Copy size={15} color={EditorColors.textSecondary} />
          <Text style={styles.actionText}>Dup</Text>
        </Pressable>
        <Pressable
          onPress={toggleSnapping}
          style={[styles.action, snappingEnabled && styles.actionActive]}
        >
          <Magnet size={15} color={snappingEnabled ? EditorColors.accent : EditorColors.textPrimary} />
          <Text style={[styles.actionText, snappingEnabled && styles.actionTextActive]}>Snap</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    gap: EditorSpacing.sm,
    marginBottom: EditorSpacing.sm,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: EditorSpacing.xs,
  },
  action: {
    minHeight: 34,
    borderRadius: EditorRadius.full,
    borderWidth: 1,
    borderColor: EditorColors.border,
    backgroundColor: EditorColors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: EditorSpacing.sm,
  },
  actionActive: {
    borderColor: EditorColors.accent,
    backgroundColor: EditorColors.accentSoft,
  },
  disabled: {
    opacity: 0.4,
  },
  actionText: {
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.micro,
    fontWeight: '800',
  },
  actionTextActive: {
    color: EditorColors.accent,
  },
  danger: {
    color: EditorColors.danger,
  },
})

