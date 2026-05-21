import React, { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { RotateCcw, X } from 'lucide-react-native'
import { useEditorStore } from '../../store/editorStore'
import type { EditorRecoveryEntry } from '../../services/editorSnapshotPersistence'
import { EditorColors, EditorRadius, EditorSpacing, EditorTypography } from '../../theme/editorTokens'

export function RecoveryBanner() {
  const [entry, setEntry] = useState<EditorRecoveryEntry | null>(null)
  const getRecoveryEntry = useEditorStore((state) => state.getRecoveryEntry)
  const restoreRecoverySnapshot = useEditorStore((state) => state.restoreRecoverySnapshot)
  const clearRecoverySnapshot = useEditorStore((state) => state.clearRecoverySnapshot)

  useEffect(() => {
    setEntry(getRecoveryEntry())
  }, [getRecoveryEntry])

  if (!entry) return null

  const handleRestore = () => {
    const restored = restoreRecoverySnapshot()
    if (restored) setEntry(null)
  }

  const handleDismiss = () => {
    clearRecoverySnapshot()
    setEntry(null)
  }

  return (
    <View style={styles.root}>
      <RotateCcw size={18} color={EditorColors.accent} />
      <View style={styles.copy}>
        <Text style={styles.title}>Recovery snapshot available</Text>
        <Text style={styles.meta}>Saved {new Date(entry.savedAt).toLocaleString()}</Text>
      </View>
      <Pressable onPress={handleRestore} style={styles.action}>
        <Text style={styles.actionText}>Restore</Text>
      </Pressable>
      <Pressable onPress={handleDismiss} style={styles.iconButton}>
        <X size={16} color={EditorColors.textSecondary} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EditorSpacing.sm,
    borderRadius: EditorRadius.md,
    borderWidth: 1,
    borderColor: EditorColors.accentMuted,
    backgroundColor: EditorColors.accentSoft,
    padding: EditorSpacing.md,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.sm,
    fontWeight: '900',
  },
  meta: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.xs,
    fontWeight: '700',
    marginTop: 2,
  },
  action: {
    borderRadius: EditorRadius.full,
    backgroundColor: EditorColors.accent,
    paddingHorizontal: EditorSpacing.md,
    paddingVertical: EditorSpacing.sm,
  },
  actionText: {
    color: EditorColors.white,
    fontSize: EditorTypography.xs,
    fontWeight: '900',
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
