import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { TimelineClip } from '../../types/clip.types'
import { SliderControl, ToggleControl } from '../controls'
import { useEditorStore } from '../../store/editorStore'
import { EditorColors, EditorRadius, EditorSpacing, EditorTypography } from '../../theme/editorTokens'

type Props = {
  clip: TimelineClip
}

export function TransitionInspector({ clip }: Props) {
  const addTransition = useEditorStore((state) => state.addTransitionToSelectedClip)
  const updateTransition = useEditorStore((state) => state.updateSelectedClipTransition)
  const removeTransition = useEditorStore((state) => state.removeTransitionFromSelectedClip)

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <Pressable style={styles.add} onPress={() => addTransition('fade', 'in')}>
          <Text style={styles.addText}>Fade in</Text>
        </Pressable>
        <Pressable style={styles.add} onPress={() => addTransition('fade', 'out')}>
          <Text style={styles.addText}>Fade out</Text>
        </Pressable>
      </View>
      {(clip.transitions ?? []).map((transition) => (
        <View key={transition.id} style={styles.item}>
          <ToggleControl label={`${transition.type} ${transition.side}`} value={transition.enabled} onChange={(enabled) => updateTransition(transition.id, { enabled })} />
          <SliderControl label="Duration" value={transition.duration} min={0.1} max={3} step={0.1} format={(value) => `${value.toFixed(1)}s`} onChange={(duration) => updateTransition(transition.id, { duration })} />
          <Pressable onPress={() => removeTransition(transition.id)}>
            <Text style={styles.remove}>Remove</Text>
          </Pressable>
        </View>
      ))}
      {clip.transitions?.length ? null : <Text style={styles.placeholder}>No transition placeholders yet.</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    gap: EditorSpacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: EditorSpacing.xs,
  },
  add: {
    borderRadius: EditorRadius.full,
    borderWidth: 1,
    borderColor: EditorColors.border,
    paddingHorizontal: EditorSpacing.md,
    paddingVertical: EditorSpacing.sm,
  },
  addText: {
    color: EditorColors.accent,
    fontSize: EditorTypography.xs,
    fontWeight: '900',
  },
  item: {
    gap: EditorSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: EditorColors.border,
    paddingTop: EditorSpacing.sm,
  },
  remove: {
    color: EditorColors.danger,
    fontSize: EditorTypography.xs,
    fontWeight: '900',
  },
  placeholder: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.xs,
    fontWeight: '700',
  },
})
