import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Scissors, Music2, Type, Sparkles, Gauge } from 'lucide-react-native'
import { Colors, IconSize, Spacing, Typography } from '@shared/theme/tokens'
import { useUiStore, type EditorTool } from '../../store/uiStore'

const TOOLS: { id: EditorTool; label: string; Icon: typeof Scissors }[] = [
  { id: 'cut', label: 'Cut', Icon: Scissors },
  { id: 'audio', label: 'Audio', Icon: Music2 },
  { id: 'text', label: 'Text', Icon: Type },
  { id: 'effects', label: 'Effects', Icon: Sparkles },
  { id: 'speed', label: 'Speed', Icon: Gauge },
]

export function EditorToolBar() {
  const activeTool = useUiStore((s) => s.activeTool)
  const setActiveTool = useUiStore((s) => s.setActiveTool)

  return (
    <View style={styles.row}>
      {TOOLS.map(({ id, label, Icon }) => {
        const active = activeTool === id
        const disabled = id !== 'cut'
        return (
          <TouchableOpacity
            key={id}
            style={[styles.tab, active && styles.tabActive, disabled && styles.tabDisabled]}
            onPress={() => !disabled && setActiveTool(id)}
            disabled={disabled}
          >
            <Icon
              size={IconSize.sm}
              color={active ? Colors.brand : Colors.textTertiary}
            />
            <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bgElevated,
    paddingVertical: Spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    gap: 2,
  },
  tabActive: {
    borderTopWidth: 2,
    borderTopColor: Colors.brand,
  },
  tabDisabled: {
    opacity: 0.35,
  },
  label: {
    fontSize: 10,
    fontFamily: Typography.fontMedium,
    color: Colors.textTertiary,
  },
  labelActive: {
    color: Colors.brand,
  },
})
