import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import {
  EditorColors,
  EditorSpacing,
  EditorTypography,
} from '../../theme/editorTokens'

type TimelineRulerProps = {
  duration: number
}

export function TimelineRuler({ duration }: TimelineRulerProps) {
  const end = Math.max(30, Math.ceil(duration))

  return (
    <View style={styles.root} pointerEvents="none">
      <Text style={styles.label}>0:00</Text>
      <Text style={styles.label}>{formatShortTime(end / 2)}</Text>
      <Text style={styles.label}>{formatShortTime(end)}</Text>
    </View>
  )
}

function formatShortTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: EditorSpacing.xs,
    left: EditorSpacing.xl,
    right: EditorSpacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: EditorColors.textTertiary,
    fontSize: EditorTypography.micro,
    fontWeight: '700',
  },
})
