import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { RenderJob } from '../../types/export.types'
import { EditorColors, EditorRadius, EditorSpacing, EditorTypography } from '../../theme/editorTokens'

type Props = {
  job: RenderJob | null
}

export function ExportJobCard({ job }: Props) {
  if (!job) return null

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{job.status}</Text>
      <Text style={styles.meta}>{Math.round(job.progress * 100)}% · {job.currentStep ?? 'Waiting'}</Text>
      <Text style={styles.meta}>
        {job.renderPlan?.instructions.length ?? 0} instructions · {job.renderPlan?.unsupportedFeatures.length ?? 0} warnings
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    borderRadius: EditorRadius.md,
    borderWidth: 1,
    borderColor: EditorColors.border,
    backgroundColor: EditorColors.surfaceSoft,
    padding: EditorSpacing.md,
    gap: EditorSpacing.xs,
  },
  title: {
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.sm,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  meta: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.xs,
    fontWeight: '700',
  },
})
