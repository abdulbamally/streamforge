import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import {
  Gauge,
  Layers3,
  Music2,
  Scissors,
  Sparkles,
  Type,
  type LucideIcon,
} from 'lucide-react-native'
import { useEditorStore, type EditorTool } from '../../store/editorStore'
import {
  EditorColors,
  EditorRadius,
  EditorShadows,
  EditorSpacing,
  EditorTypography,
} from '../../theme/editorTokens'
import { EditorControlButton } from './EditorControlButton'

const TOOLS: { id: EditorTool; label: string; Icon: LucideIcon; disabled?: boolean }[] = [
  { id: 'select', label: 'Select', Icon: Layers3 },
  { id: 'split', label: 'Split', Icon: Scissors, disabled: true },
  { id: 'audio', label: 'Audio', Icon: Music2, disabled: true },
  { id: 'text', label: 'Text', Icon: Type, disabled: true },
  { id: 'effects', label: 'Effects', Icon: Sparkles, disabled: true },
  { id: 'trim', label: 'Trim', Icon: Gauge, disabled: true },
]

export function BottomToolDock() {
  const activeTool = useEditorStore((state) => state.selection.activeTool)
  const setActiveTool = useEditorStore((state) => state.setActiveTool)

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.label}>Tools</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {TOOLS.map(({ id, label, Icon, disabled }) => (
          <EditorControlButton
            key={id}
            Icon={Icon}
            label={label}
            active={activeTool === id}
            disabled={disabled}
            onPress={() => setActiveTool(id)}
            variant="filled"
          />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: EditorColors.surface,
    borderRadius: EditorRadius.lg,
    borderWidth: 1,
    borderColor: EditorColors.border,
    padding: EditorSpacing.md,
    ...EditorShadows.panel,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: EditorSpacing.sm,
  },
  label: {
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.sm,
    fontWeight: '800',
  },
  row: {
    gap: EditorSpacing.sm,
    paddingRight: EditorSpacing.md,
  },
})
