import React from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import type { TimelineClip } from '../../types/clip.types'
import { SliderControl, ToggleControl } from '../controls'
import { useEditorStore } from '../../store/editorStore'
import { DEFAULT_TEXT_PROPERTIES, type TextAlignment } from '../../types/text.types'
import { EditorColors, EditorRadius, EditorSpacing, EditorTypography } from '../../theme/editorTokens'

type Props = {
  clip: TimelineClip
}

const ALIGNMENTS: TextAlignment[] = ['left', 'center', 'right']

export function TextInspector({ clip }: Props) {
  const updateText = useEditorStore((state) => state.updateSelectedTextProperties)
  const text = { ...DEFAULT_TEXT_PROPERTIES, ...clip.text }

  return (
    <View style={styles.root}>
      <TextInput
        style={styles.input}
        value={text.content}
        onChangeText={(content) => updateText({ content })}
        multiline
      />
      <SliderControl label="Font size" value={text.fontSize} min={8} max={160} step={2} format={(value) => `${Math.round(value)}px`} onChange={(fontSize) => updateText({ fontSize })} />
      <View style={styles.row}>
        {ALIGNMENTS.map((alignment) => (
          <Pressable
            key={alignment}
            style={[styles.segment, text.alignment === alignment && styles.segmentActive]}
            onPress={() => updateText({ alignment })}
          >
            <Text style={[styles.segmentText, text.alignment === alignment && styles.segmentTextActive]}>{alignment}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.swatches}>
        {['#FFFFFF', '#111827', '#FACC15', '#70D7D0', '#F472B6'].map((color) => (
          <Pressable key={color} style={[styles.swatch, { backgroundColor: color }, text.color === color && styles.swatchActive]} onPress={() => updateText({ color })} />
        ))}
      </View>
      <ToggleControl label="Shadow" value={Boolean(text.shadowEnabled)} onChange={(shadowEnabled) => updateText({ shadowEnabled })} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    gap: EditorSpacing.md,
  },
  input: {
    minHeight: 64,
    borderRadius: EditorRadius.md,
    borderWidth: 1,
    borderColor: EditorColors.border,
    backgroundColor: EditorColors.surfaceSoft,
    color: EditorColors.textPrimary,
    padding: EditorSpacing.sm,
    fontSize: EditorTypography.sm,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: EditorSpacing.xs,
  },
  segment: {
    flex: 1,
    borderRadius: EditorRadius.full,
    borderWidth: 1,
    borderColor: EditorColors.border,
    paddingVertical: EditorSpacing.sm,
    alignItems: 'center',
  },
  segmentActive: {
    borderColor: EditorColors.accent,
    backgroundColor: EditorColors.accentSoft,
  },
  segmentText: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.xs,
    fontWeight: '900',
  },
  segmentTextActive: {
    color: EditorColors.accent,
  },
  swatches: {
    flexDirection: 'row',
    gap: EditorSpacing.sm,
  },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: EditorColors.border,
  },
  swatchActive: {
    borderColor: EditorColors.accent,
  },
})
