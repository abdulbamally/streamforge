import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { TimelineTrack } from '../../types/track.types'
import { EditorColors, EditorRadius, EditorSpacing, EditorTypography } from '../../theme/editorTokens'

type TimelineTrackHeaderProps = {
  track: TimelineTrack
}

export function TimelineTrackHeader({ track }: TimelineTrackHeaderProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.type}>{track.type.toUpperCase()}</Text>
      <Text style={styles.name} numberOfLines={1}>{track.name}</Text>
      <Text style={styles.state}>
        {track.isLocked ? 'locked' : 'editable'}
        {track.type === 'audio' ? ` / ${track.isMuted ? 'muted' : 'audible'}` : ` / ${track.isVisible ? 'visible' : 'hidden'}`}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    minWidth: 120,
    borderRadius: EditorRadius.md,
    borderWidth: 1,
    borderColor: EditorColors.border,
    backgroundColor: EditorColors.surfaceSoft,
    padding: EditorSpacing.sm,
  },
  type: {
    color: EditorColors.accent,
    fontSize: 9,
    fontWeight: '900',
  },
  name: {
    marginTop: 2,
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.xs,
    fontWeight: '900',
  },
  state: {
    marginTop: 2,
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.micro,
    fontWeight: '700',
  },
})
