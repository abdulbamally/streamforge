import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Copy, Info, Scissors, SlidersHorizontal, Trash2 } from 'lucide-react-native'
import { useEditCommands } from '../../hooks/useEditCommands'
import {
  EditorColors,
  EditorRadius,
  EditorSpacing,
  EditorTypography,
} from '../../theme/editorTokens'

export function ClipActionToolbar() {
  const {
    canDelete,
    canSplit,
    deleteSelected,
    selectedClip,
    split,
  } = useEditCommands()

  if (!selectedClip) return null

  return (
    <View style={styles.root}>
      <Text style={styles.name} numberOfLines={1}>{selectedClip.name}</Text>
      <View style={styles.actions}>
        <Pressable
          onPress={split}
          disabled={!canSplit}
          style={[styles.button, !canSplit && styles.disabled]}
        >
          <Scissors size={14} color={EditorColors.textPrimary} />
          <Text style={styles.label}>Split</Text>
        </Pressable>
        <Pressable
          onPress={deleteSelected}
          disabled={!canDelete}
          style={[styles.button, !canDelete && styles.disabled]}
        >
          <Trash2 size={14} color={EditorColors.danger} />
          <Text style={[styles.label, styles.danger]}>Delete</Text>
        </Pressable>
        <Pressable disabled style={[styles.button, styles.disabled]}>
          <SlidersHorizontal size={14} color={EditorColors.textSecondary} />
          <Text style={styles.label}>Trim</Text>
        </Pressable>
        <Pressable disabled style={[styles.button, styles.disabled]}>
          <Copy size={14} color={EditorColors.textSecondary} />
          <Text style={styles.label}>Dup</Text>
        </Pressable>
        <Pressable disabled style={[styles.iconButton, styles.disabled]}>
          <Info size={14} color={EditorColors.textSecondary} />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    borderRadius: EditorRadius.md,
    borderWidth: 1,
    borderColor: EditorColors.border,
    backgroundColor: EditorColors.surfaceSoft,
    padding: EditorSpacing.sm,
    marginBottom: EditorSpacing.sm,
    gap: EditorSpacing.xs,
  },
  name: {
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.xs,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: EditorSpacing.xs,
  },
  button: {
    minHeight: 30,
    borderRadius: EditorRadius.full,
    borderWidth: 1,
    borderColor: EditorColors.border,
    backgroundColor: EditorColors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: EditorSpacing.sm,
  },
  iconButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: EditorRadius.full,
    borderWidth: 1,
    borderColor: EditorColors.border,
  },
  disabled: {
    opacity: 0.42,
  },
  label: {
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.micro,
    fontWeight: '800',
  },
  danger: {
    color: EditorColors.danger,
  },
})

