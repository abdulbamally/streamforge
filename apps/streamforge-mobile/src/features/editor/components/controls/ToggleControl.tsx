import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { EditorColors, EditorRadius, EditorSpacing, EditorTypography } from '../../theme/editorTokens'

type ToggleControlProps = {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}

export function ToggleControl({ label, value, onChange }: ToggleControlProps) {
  return (
    <Pressable style={styles.root} onPress={() => onChange(!value)}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.toggle, value && styles.toggleOn]}>
        <View style={[styles.knob, value && styles.knobOn]} />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: EditorSpacing.md,
  },
  label: {
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.xs,
    fontWeight: '800',
  },
  toggle: {
    width: 42,
    height: 24,
    borderRadius: EditorRadius.full,
    backgroundColor: EditorColors.borderStrong,
    padding: 3,
  },
  toggleOn: {
    backgroundColor: EditorColors.accent,
  },
  knob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: EditorColors.white,
  },
  knobOn: {
    transform: [{ translateX: 18 }],
  },
})
