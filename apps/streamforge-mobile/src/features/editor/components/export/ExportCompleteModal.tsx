import React from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useEditorStore } from '../../store/editorStore'
import { EditorColors, EditorRadius, EditorShadows, EditorSpacing, EditorTypography } from '../../theme/editorTokens'

export function ExportCompleteModal() {
  const exportState = useEditorStore((state) => state.export)
  const dismissExportComplete = useEditorStore((state) => state.dismissExportComplete)
  const activeJob = exportState.activeJobId ? exportState.renderJobs[exportState.activeJobId] : null
  const output = activeJob?.output

  return (
    <Modal visible={exportState.exportCompleteOpen && !!output} animationType="fade" transparent>
      <View style={styles.scrim}>
        <View style={styles.card}>
          <Text style={styles.title}>Export Complete</Text>
          <Text style={styles.fileName}>{output?.fileName}</Text>
          <View style={styles.metaGrid}>
            <Text style={styles.meta}>{output?.width}x{output?.height}</Text>
            <Text style={styles.meta}>{output?.fps} FPS</Text>
            <Text style={styles.meta}>{output?.format.toUpperCase()}</Text>
            <Text style={styles.meta}>{output?.duration?.toFixed(1)}s</Text>
          </View>
          <Text style={styles.uri} numberOfLines={2}>{output?.uri}</Text>
          <Pressable style={styles.secondary}>
            <Text style={styles.secondaryText}>Save / Share</Text>
          </Pressable>
          <Pressable onPress={dismissExportComplete} style={styles.primary}>
            <Text style={styles.primaryText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: EditorSpacing.xl,
    backgroundColor: 'rgba(17, 19, 24, 0.32)',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: EditorRadius.lg,
    backgroundColor: EditorColors.surface,
    padding: EditorSpacing.xl,
    gap: EditorSpacing.md,
    ...EditorShadows.panel,
  },
  title: {
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.xl,
    fontWeight: '900',
  },
  fileName: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.sm,
    fontWeight: '800',
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: EditorSpacing.xs,
  },
  meta: {
    borderRadius: EditorRadius.full,
    backgroundColor: EditorColors.surfaceSoft,
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.xs,
    fontWeight: '800',
    paddingHorizontal: EditorSpacing.md,
    paddingVertical: EditorSpacing.xs,
  },
  uri: {
    color: EditorColors.textTertiary,
    fontSize: EditorTypography.xs,
    fontWeight: '600',
  },
  secondary: {
    alignItems: 'center',
    borderRadius: EditorRadius.full,
    borderWidth: 1,
    borderColor: EditorColors.border,
    paddingVertical: EditorSpacing.md,
  },
  secondaryText: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.sm,
    fontWeight: '900',
  },
  primary: {
    alignItems: 'center',
    borderRadius: EditorRadius.full,
    backgroundColor: EditorColors.accent,
    paddingVertical: EditorSpacing.md,
  },
  primaryText: {
    color: EditorColors.white,
    fontSize: EditorTypography.sm,
    fontWeight: '900',
  },
})
