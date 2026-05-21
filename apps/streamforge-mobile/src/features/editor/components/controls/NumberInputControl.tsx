import React from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { EditorColors, EditorRadius, EditorSpacing, EditorTypography } from '../../theme/editorTokens'

type NumberInputControlProps = {
  label: string
  value: number
  onChange: (value: number) => void
}

export function NumberInputControl({ label, value, onChange }: NumberInputControlProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={String(Number(value.toFixed(2)))}
        onChangeText={(text) => {
          const next = Number(text)
          if (!Number.isNaN(next)) onChange(next)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    gap: EditorSpacing.xs,
  },
  label: {
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.xs,
    fontWeight: '800',
  },
  input: {
    minHeight: 36,
    borderRadius: EditorRadius.md,
    borderWidth: 1,
    borderColor: EditorColors.border,
    backgroundColor: EditorColors.surfaceSoft,
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.sm,
    fontWeight: '800',
    paddingHorizontal: EditorSpacing.sm,
  },
})
