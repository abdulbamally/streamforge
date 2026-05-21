import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { ExportResolution } from '../../types/export.types'
import { EditorColors, EditorRadius, EditorSpacing, EditorTypography } from '../../theme/editorTokens'

const OPTIONS: ExportResolution[] = ['720p', '1080p', '1440p', '4k', 'source']

type Props = {
  value: ExportResolution
  onChange: (value: ExportResolution) => void
}

export function ExportResolutionSelector({ value, onChange }: Props) {
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
    textTransform: 'uppercase',
  },
  activeLabel: {
    color: EditorColors.accent,
  },
})
