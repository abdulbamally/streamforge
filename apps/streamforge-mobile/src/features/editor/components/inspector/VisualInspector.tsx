import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { TimelineClip } from '../../types/clip.types'
import { SliderControl } from '../controls'
import { useEditorStore } from '../../store/editorStore'
import { EditorColors, EditorSpacing, EditorTypography } from '../../theme/editorTokens'

type Props = {
  clip: TimelineClip
}

export function VisualInspector({ clip }: Props) {
  const updateOpacity = useEditorStore((state) => state.updateSelectedClipOpacity)

  return (
    <View style={styles.root}>
      <SliderControl
        label="Opacity"
        value={clip.opacity ?? 1}
        min={0}
        max={1}
        step={0.05}
        format={(value) => `${Math.round(value * 100)}%`}
        onChange={updateOpacity}
      />
      <Text style={styles.placeholder}>Blend mode: normal</Text>
      <Text style={styles.placeholder}>Filters are stored as placeholders until rendering support lands.</Text>
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
