import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Button } from '@shared/components/Button'
import { Spacing } from '@shared/theme/tokens'
import { useTimelineSplit } from '../timeline/SkiaTimeline'
import { useEditorStore } from '../../store/editorStore'
import { DeleteClipCommand } from '../../engine/commands'

export function CutToolPanel() {
  const split = useTimelineSplit()
  const selectedClipId = useEditorStore((s) => s.selectedClipId)
  const runCommand = useEditorStore((s) => s.runCommand)

  return (
    <View style={styles.row}>
      <Button
        label="Split at playhead"
        variant="secondary"
        size="sm"
        onPress={split}
        disabled={!selectedClipId}
      />
      <Button
        label="Delete clip"
        variant="ghost"
        size="sm"
        onPress={() => {
          if (selectedClipId) {
            runCommand(new DeleteClipCommand(selectedClipId))
          }
        }}
        disabled={!selectedClipId}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
})
