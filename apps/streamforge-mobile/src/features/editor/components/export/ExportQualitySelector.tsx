import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { ExportQuality } from '../../types/export.types'
import { EditorColors, EditorRadius, EditorSpacing, EditorTypography } from '../../theme/editorTokens'

const OPTIONS: ExportQuality[] = ['draft', 'standard', 'high', 'maximum']

type Props = {
  value: ExportQuality
  onChange: (value: ExportQuality) => void
}

export function ExportQualitySelector({ value, onChange }: Props) {
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
    flexWrap: 'wrap',
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
    textTransform: 'capitalize',
  },
  activeLabel: {
    color: EditorColors.accent,
  },
})
