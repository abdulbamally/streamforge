import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { TimelineClip } from '../../types/clip.types'
import { SliderControl } from '../controls'
import { useEditorStore } from '../../store/editorStore'
import { EditorColors, EditorRadius, EditorSpacing, EditorTypography } from '../../theme/editorTokens'

type Props = {
  clip: TimelineClip
}

export function TransformInspector({ clip }: Props) {
  const update = useEditorStore((state) => state.updateSelectedClipTransform)
  const reset = useEditorStore((state) => state.resetSelectedClipTransform)
  const transform = clip.transform ?? { x: 0, y: 0, scale: 1, rotation: 0 }

  return (
    <View style={styles.root}>
      <SliderControl label="Position X" value={transform.x} min={-1} max={1} step={0.05} onChange={(x) => update({ x })} />
      <SliderControl label="Position Y" value={transform.y} min={-1} max={1} step={0.05} onChange={(y) => update({ y })} />
      <SliderControl label="Scale" value={transform.scale} min={0.1} max={5} step={0.1} onChange={(scale) => update({ scale })} />
      <SliderControl label="Rotation" value={transform.rotation} min={-180} max={180} step={5} format={(value) => `${Math.round(value)} deg`} onChange={(rotation) => update({ rotation })} />
      <Pressable style={styles.reset} onPress={reset}>
        <Text style={styles.resetText}>Reset transform</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    gap: EditorSpacing.md,
  },
  reset: {
    alignSelf: 'flex-start',
    borderRadius: EditorRadius.full,
    borderWidth: 1,
    borderColor: EditorColors.border,
    paddingHorizontal: EditorSpacing.md,
    paddingVertical: EditorSpacing.sm,
  },
  resetText: {
    color: EditorColors.accent,
    fontSize: EditorTypography.xs,
    fontWeight: '900',
  },
})
