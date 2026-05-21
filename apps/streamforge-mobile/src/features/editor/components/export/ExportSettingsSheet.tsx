import React, { useMemo, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { ToggleControl } from '../controls/ToggleControl'
import { useEditorStore } from '../../store/editorStore'
import type { ExportFormat, ExportQuality, ExportResolution } from '../../types/export.types'
import { EditorColors, EditorRadius, EditorShadows, EditorSpacing, EditorTypography } from '../../theme/editorTokens'
import { ExportFormatSelector } from './ExportFormatSelector'
import { ExportQualitySelector } from './ExportQualitySelector'
import { ExportResolutionSelector } from './ExportResolutionSelector'
import { ExportErrorView } from './ExportErrorView'

const FPS_OPTIONS = [24, 30, 60]

export function ExportSettingsSheet() {
  const [warningConfirmed, setWarningConfirmed] = useState(false)
  const exportState = useEditorStore((state) => state.export)
  const updateExportSetting = useEditorStore((state) => state.updateExportSetting)
  const closeExportSettings = useEditorStore((state) => state.closeExportSettings)
  const prepareExport = useEditorStore((state) => state.prepareExport)
  const startActiveExport = useEditorStore((state) => state.startActiveExport)
  const setLastExportError = useEditorStore((state) => state.setLastExportError)
  const activeJob = exportState.activeJobId ? exportState.renderJobs[exportState.activeJobId] : null

  const unsupportedCount = activeJob?.renderPlan?.unsupportedFeatures.length ?? 0
  const validation = exportState.lastValidation
  const hasWarnings = (validation?.warnings.length ?? 0) > 0 || unsupportedCount > 0
  const hasErrors = (validation?.errors.length ?? 0) > 0
  const warnings = useMemo(() => {
    const validationWarnings = validation?.warnings.map((item) => item.message) ?? []
    const planWarnings = activeJob?.renderPlan?.unsupportedFeatures.map((item) => item.message) ?? []
    return Array.from(new Set([...validationWarnings, ...planWarnings])).slice(0, 4)
  }, [activeJob, validation])

  const handleStart = async () => {
    setLastExportError(null)
    const valid = prepareExport()
    const nextState = useEditorStore.getState().export
    const nextJob = nextState.activeJobId ? nextState.renderJobs[nextState.activeJobId] : null
    const nextWarnings =
      (nextState.lastValidation?.warnings.length ?? 0) +
      (nextJob?.renderPlan?.unsupportedFeatures.length ?? 0)

    if (!valid) return
    if (nextWarnings > 0 && !warningConfirmed) {
      setWarningConfirmed(true)
      return
    }
    await startActiveExport()
    setWarningConfirmed(false)
  }

  return (
    <Modal visible={exportState.isExportSettingsOpen} animationType="slide" transparent>
      <View style={styles.scrim}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Export</Text>
              <Text style={styles.subtitle}>Create a Phase 7 render job from the current timeline.</Text>
            </View>
            <Pressable onPress={closeExportSettings} style={styles.textButton}>
              <Text style={styles.textButtonLabel}>Cancel</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resolution</Text>
              <ExportResolutionSelector
                value={exportState.exportSettings.resolution}
                onChange={(value: ExportResolution) => updateExportSetting('resolution', value)}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Frame Rate</Text>
              <View style={styles.optionRow}>
                {FPS_OPTIONS.map((fps) => (
                  <Pressable
                    key={fps}
                    onPress={() => updateExportSetting('fps', fps)}
                    style={[styles.option, exportState.exportSettings.fps === fps && styles.optionActive]}
                  >
                    <Text style={[styles.optionText, exportState.exportSettings.fps === fps && styles.optionTextActive]}>
                      {fps} FPS
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Format</Text>
              <ExportFormatSelector
                value={exportState.exportSettings.format}
                onChange={(value: ExportFormat) => updateExportSetting('format', value)}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quality</Text>
              <ExportQualitySelector
                value={exportState.exportSettings.quality}
                onChange={(value: ExportQuality) => updateExportSetting('quality', value)}
              />
            </View>

            <ToggleControl
              label="Include audio"
              value={exportState.exportSettings.includeAudio}
              onChange={(value: boolean) => updateExportSetting('includeAudio', value)}
            />

            {exportState.lastExportError || hasErrors ? (
              <ExportErrorView error={exportState.lastExportError ?? validation?.errors[0]?.message} />
            ) : null}

            {warningConfirmed && hasWarnings ? (
              <View style={styles.warningBox}>
                <Text style={styles.warningTitle}>Limited export warning</Text>
                {warnings.map((warning) => (
                  <Text key={warning} style={styles.warningText}>{warning}</Text>
                ))}
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable onPress={handleStart} disabled={exportState.isExporting} style={styles.primary}>
              <Text style={styles.primaryText}>
                {warningConfirmed && hasWarnings ? 'Continue Export' : 'Start Export'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17, 19, 24, 0.28)',
  },
  sheet: {
    maxHeight: '86%',
    borderTopLeftRadius: EditorRadius.xl,
    borderTopRightRadius: EditorRadius.xl,
    backgroundColor: EditorColors.surface,
    padding: EditorSpacing.lg,
    ...EditorShadows.panel,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: EditorSpacing.md,
  },
  title: {
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.xl,
    fontWeight: '900',
  },
  subtitle: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.sm,
    fontWeight: '600',
    marginTop: EditorSpacing.xs,
  },
  textButton: {
    paddingHorizontal: EditorSpacing.md,
    paddingVertical: EditorSpacing.sm,
  },
  textButtonLabel: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.sm,
    fontWeight: '800',
  },
  content: {
    gap: EditorSpacing.lg,
    paddingVertical: EditorSpacing.lg,
  },
  section: {
    gap: EditorSpacing.sm,
  },
  sectionTitle: {
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.sm,
    fontWeight: '900',
  },
  optionRow: {
    flexDirection: 'row',
    gap: EditorSpacing.xs,
  },
  option: {
    borderRadius: EditorRadius.full,
    borderWidth: 1,
    borderColor: EditorColors.border,
    paddingHorizontal: EditorSpacing.md,
    paddingVertical: EditorSpacing.sm,
  },
  optionActive: {
    borderColor: EditorColors.accent,
    backgroundColor: EditorColors.accentSoft,
  },
  optionText: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.xs,
    fontWeight: '800',
  },
  optionTextActive: {
    color: EditorColors.accent,
  },
  warningBox: {
    gap: EditorSpacing.xs,
    borderRadius: EditorRadius.md,
    borderWidth: 1,
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb',
    padding: EditorSpacing.md,
  },
  warningTitle: {
    color: '#92400e',
    fontSize: EditorTypography.sm,
    fontWeight: '900',
  },
  warningText: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.xs,
    fontWeight: '700',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: EditorColors.border,
    paddingTop: EditorSpacing.md,
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
