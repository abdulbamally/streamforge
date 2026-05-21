import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { TimelineClip } from '../../types/clip.types'
import type { FilterType } from '../../types/filter.types'
import { SliderControl, ToggleControl } from '../controls'
import { useEditorStore } from '../../store/editorStore'
import { EditorColors, EditorRadius, EditorSpacing, EditorTypography } from '../../theme/editorTokens'

type Props = {
  clip: TimelineClip
}

const FILTERS: FilterType[] = ['brightness', 'contrast', 'saturation']

export function FilterInspector({ clip }: Props) {
  const addFilter = useEditorStore((state) => state.addFilterToSelectedClip)
  const updateFilter = useEditorStore((state) => state.updateSelectedClipFilter)
  const removeFilter = useEditorStore((state) => state.removeFilterFromSelectedClip)

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        {FILTERS.map((filter) => (
          <Pressable key={filter} style={styles.add} onPress={() => addFilter(filter)}>
            <Text style={styles.addText}>{filter}</Text>
          </Pressable>
        ))}
      </View>
      {(clip.filters ?? []).map((filter) => (
        <View key={filter.id} style={styles.item}>
          <ToggleControl label={filter.type} value={filter.enabled} onChange={(enabled) => updateFilter(filter.id, { enabled })} />
          <SliderControl label="Intensity" value={filter.intensity} min={0} max={1} step={0.05} format={(value) => `${Math.round(value * 100)}%`} onChange={(intensity) => updateFilter(filter.id, { intensity })} />
          <Pressable onPress={() => removeFilter(filter.id)}>
            <Text style={styles.remove}>Remove</Text>
          </Pressable>
        </View>
      ))}
      {clip.filters?.length ? null : <Text style={styles.placeholder}>No filter placeholders yet.</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    gap: EditorSpacing.md,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
