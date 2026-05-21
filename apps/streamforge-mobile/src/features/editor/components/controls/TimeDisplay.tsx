import React from 'react'
import { StyleSheet, Text } from 'react-native'
import { formatPlaybackTime } from '../../engine/playback/playbackUtils'
import { EditorColors, EditorTypography } from '../../theme/editorTokens'

type TimeDisplayProps = {
  currentTime: number
  duration: number
  light?: boolean
}

export function TimeDisplay({ currentTime, duration, light = false }: TimeDisplayProps) {
  return (
    <Text style={[styles.time, light && styles.light]} numberOfLines={1}>
      {formatPlaybackTime(currentTime)} / {formatPlaybackTime(duration)}
    </Text>
  )
}

const styles = StyleSheet.create({
  time: {
    flex: 1,
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.sm,
    fontWeight: '700',
  },
  light: {
    color: EditorColors.white,
  },
})
