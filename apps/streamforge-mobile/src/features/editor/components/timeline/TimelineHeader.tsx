import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useEditorStore } from '../../store/editorStore'
import {
  EditorColors,
  EditorSpacing,
  EditorTypography,
} from '../../theme/editorTokens'
import { formatTimeLabel } from '../../engine/timeline/timelineMath'

export function TimelineHeader() {
  const duration = useEditorStore((state) => state.playback.duration)
  const trackCount = useEditorStore((state) => state.tracks.length)

  return (
    <View style={styles.root}>
      <View>
        <Text style={styles.title}>Timeline</Text>
        <Text style={styles.meta}>{trackCount} tracks · {formatTimeLabel(duration)}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: EditorSpacing.sm,
  },
  title: {
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.sm,
    fontWeight: '800',
  },
  meta: {
    color: EditorColors.textTertiary,
    fontSize: EditorTypography.xs,
    fontWeight: '700',
    marginTop: 2,
  },
})
