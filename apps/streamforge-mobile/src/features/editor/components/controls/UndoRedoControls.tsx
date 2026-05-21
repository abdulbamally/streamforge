import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Redo2, Undo2 } from 'lucide-react-native'
import { useUndoRedo } from '../../hooks/useUndoRedo'
import { EditorColors, EditorRadius, EditorSpacing } from '../../theme/editorTokens'

export function UndoRedoControls() {
  const { canRedo, canUndo, redo, undo } = useUndoRedo()

  return (
    <View style={styles.root}>
      <Pressable
        onPress={undo}
        disabled={!canUndo}
        style={[styles.button, !canUndo && styles.disabled]}
      >
        <Undo2 size={16} color={EditorColors.textPrimary} />
      </Pressable>
      <Pressable
        onPress={redo}
        disabled={!canRedo}
        style={[styles.button, !canRedo && styles.disabled]}
      >
        <Redo2 size={16} color={EditorColors.textPrimary} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    gap: EditorSpacing.xs,
  },
  button: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: EditorRadius.full,
    borderWidth: 1,
    borderColor: EditorColors.border,
    backgroundColor: EditorColors.surface,
  },
  disabled: {
    opacity: 0.35,
  },
})

