import React from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useExportProgress } from '../../hooks/useExportProgress'
import { useEditorStore } from '../../store/editorStore'
import { EditorColors, EditorRadius, EditorShadows, EditorSpacing, EditorTypography } from '../../theme/editorTokens'

export function ExportProgressModal() {
  const { activeJob, progress, currentStep } = useExportProgress()
  const isExporting = useEditorStore((state) => state.export.isExporting)
  const cancelActiveExport = useEditorStore((state) => state.cancelActiveExport)
  const visible = isExporting && activeJob?.status !== 'completed'

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.scrim}>
        <View style={styles.card}>
          <Text style={styles.title}>Exporting</Text>
          <Text style={styles.step}>{currentStep}</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
          <Text style={styles.percent}>{Math.round(progress * 100)}%</Text>
          <Pressable onPress={cancelActiveExport} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel Export</Text>
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
  step: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.sm,
    fontWeight: '700',
  },
  track: {
    height: 10,
    overflow: 'hidden',
    borderRadius: EditorRadius.full,
    backgroundColor: EditorColors.border,
  },
  fill: {
    height: '100%',
    borderRadius: EditorRadius.full,
    backgroundColor: EditorColors.accent,
  },
  percent: {
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.sm,
    fontWeight: '900',
    textAlign: 'right',
  },
  cancel: {
    alignItems: 'center',
    borderRadius: EditorRadius.full,
    borderWidth: 1,
    borderColor: EditorColors.border,
    paddingVertical: EditorSpacing.md,
  },
  cancelText: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.sm,
    fontWeight: '900',
  },
})
