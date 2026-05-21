import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Scissors, SlidersHorizontal } from 'lucide-react-native'
import { useEditorStore } from '../../store/editorStore'
import type { EditorTool } from '../../types/editor.types'
import {
  EditorColors,
  EditorRadius,
  EditorSpacing,
  EditorTypography,
} from '../../theme/editorTokens'

const tools: Array<{ id: EditorTool; label: string; Icon: typeof Scissors }> = [
  { id: 'select', label: 'Select', Icon: SlidersHorizontal },
  { id: 'split', label: 'Split', Icon: Scissors },
  { id: 'trim', label: 'Trim', Icon: SlidersHorizontal },
]

export function ToolModeSelector() {
  const activeTool = useEditorStore((state) => state.selection.activeTool)
  const setActiveTool = useEditorStore((state) => state.setActiveTool)

  return (
    <View style={styles.root}>
      {tools.map(({ Icon, id, label }) => {
        const active = activeTool === id
        return (
          <Pressable
            key={id}
            onPress={() => setActiveTool(id)}
            style={[styles.tool, active && styles.toolActive]}
          >
            <Icon size={14} color={active ? EditorColors.accent : EditorColors.textSecondary} />
            <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    gap: EditorSpacing.xs,
  },
  tool: {
    minHeight: 34,
    borderRadius: EditorRadius.full,
    borderWidth: 1,
    borderColor: EditorColors.border,
    paddingHorizontal: EditorSpacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  toolActive: {
    borderColor: EditorColors.accent,
    backgroundColor: EditorColors.accentSoft,
  },
  label: {
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.micro,
    fontWeight: '800',
  },
  labelActive: {
    color: EditorColors.accent,
  },
})

