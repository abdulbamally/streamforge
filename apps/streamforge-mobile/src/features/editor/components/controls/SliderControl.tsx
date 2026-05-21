import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Minus, Plus } from 'lucide-react-native'
import { EditorColors, EditorRadius, EditorSpacing, EditorTypography } from '../../theme/editorTokens'

type SliderControlProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  format?: (value: number) => string
  onChange: (value: number) => void
}

export function SliderControl({ label, value, min, max, step, format, onChange }: SliderControlProps) {
  const next = (delta: number) => Math.max(min, Math.min(max, value + delta))
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{format ? format(value) : value.toFixed(2)}</Text>
      </View>
      <View style={styles.controls}>
        <Pressable style={styles.button} onPress={() => onChange(next(-step))}>
          <Minus size={14} color={EditorColors.textPrimary} />
        </Pressable>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${((value - min) / Math.max(step, max - min)) * 100}%` }]} />
        </View>
        <Pressable style={styles.button} onPress={() => onChange(next(step))}>
          <Plus size={14} color={EditorColors.textPrimary} />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    gap: EditorSpacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.xs,
    fontWeight: '800',
  },
  value: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.xs,
    fontWeight: '800',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EditorSpacing.sm,
  },
  button: {
    width: 30,
    height: 30,
    borderRadius: EditorRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: EditorColors.surfaceSoft,
    borderWidth: 1,
    borderColor: EditorColors.border,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: EditorColors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: EditorColors.accent,
  },
})
