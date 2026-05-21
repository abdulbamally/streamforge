import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { ExportFormat } from '../../types/export.types'
import { EditorColors, EditorRadius, EditorSpacing, EditorTypography } from '../../theme/editorTokens'

const OPTIONS: ExportFormat[] = ['mp4', 'mov']

type Props = {
  value: ExportFormat
  onChange: (value: ExportFormat) => void
}

export function ExportFormatSelector({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => (
        <Pressable
          key={option}
          onPress={() => onChange(option)}
          style={[styles.option, value === option && styles.active]}
        >
          <Text style={[styles.label, value === option && styles.activeLabel]}>{option}</Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: EditorSpacing.xs,
  },
  option: {
    borderRadius: EditorRadius.full,
    borderWidth: 1,
    borderColor: EditorColors.border,
    backgroundColor: EditorColors.surface,
    paddingHorizontal: EditorSpacing.md,
    paddingVertical: EditorSpacing.sm,
  },
  active: {
    borderColor: EditorColors.accent,
    backgroundColor: EditorColors.accentSoft,
  },
  label: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  activeLabel: {
    color: EditorColors.accent,
  },
})
