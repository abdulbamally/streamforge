import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { TimelineClip } from '../../types/clip.types'
import { SliderControl } from '../controls'
import { useEditorStore } from '../../store/editorStore'
import { EditorColors, EditorSpacing, EditorTypography } from '../../theme/editorTokens'

type Props = {
  clip: TimelineClip
  muted?: boolean
}

export function AudioInspector({ clip, muted }: Props) {
  const updateVolume = useEditorStore((state) => state.updateSelectedClipVolume)

  return (
    <View style={styles.root}>
      <SliderControl
        label="Volume"
        value={clip.volume ?? 1}
        min={0}
        max={2}
        step={0.05}
        format={(value) => `${Math.round(value * 100)}%`}
        onChange={updateVolume}
      />
      <Text style={styles.placeholder}>{muted ? 'Track is muted' : 'Track is audible'}</Text>
      <Text style={styles.placeholder}>Fade in/out placeholders are ready for Phase 7 rendering.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    gap: EditorSpacing.md,
  },
  placeholder: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.xs,
    fontWeight: '700',
  },
})
