import React from 'react'
import { AlertCircle } from 'lucide-react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { getExportErrorMessage } from '../../engine/export/exportErrors'
import type { RenderError } from '../../types/export.types'
import { EditorColors, EditorRadius, EditorSpacing, EditorTypography } from '../../theme/editorTokens'

type Props = {
  error?: RenderError | string | null
  onRetry?: () => void
  onDismiss?: () => void
}

export function ExportErrorView({ error, onRetry, onDismiss }: Props) {
  const message = typeof error === 'string' ? error : getExportErrorMessage(error)
  if (!message) return null

  return (
    <View style={styles.root}>
      <AlertCircle size={18} color={EditorColors.danger} />
      <View style={styles.copy}>
        <Text style={styles.title}>Export needs attention</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.action}>
          <Text style={styles.actionText}>Retry</Text>
        </Pressable>
      ) : null}
      {onDismiss ? (
        <Pressable onPress={onDismiss} style={styles.action}>
          <Text style={styles.actionText}>Dismiss</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: EditorSpacing.sm,
    borderRadius: EditorRadius.md,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    padding: EditorSpacing.md,
  },
  copy: {
    flex: 1,
    gap: EditorSpacing.xs,
  },
  title: {
    color: EditorColors.danger,
    fontSize: EditorTypography.sm,
    fontWeight: '800',
  },
  message: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.xs,
    fontWeight: '600',
  },
  action: {
    paddingHorizontal: EditorSpacing.sm,
    paddingVertical: EditorSpacing.xs,
  },
  actionText: {
    color: EditorColors.accent,
    fontSize: EditorTypography.xs,
    fontWeight: '800',
  },
})
