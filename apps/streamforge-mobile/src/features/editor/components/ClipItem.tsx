// ============================================================
//  ClipItem — A single clip on the timeline track
// ============================================================

import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Colors, Typography, Spacing, Radius } from '@shared/theme/tokens'
import type { TimelineClip } from '../engine/types'

interface ClipItemProps {
  clip: TimelineClip
  isSelected: boolean
  pixelsPerSecond: number
  onPress: () => void
  onLongPress?: () => void
}

export function ClipItem({
  clip,
  isSelected,
  pixelsPerSecond,
  onPress,
  onLongPress,
}: ClipItemProps) {
  const width = Math.max(clip.duration * pixelsPerSecond, 40)
  const isVideo = clip.sourceUri.match(/\.(mp4|mov|webm|mkv)/i)
  const isAudio = clip.sourceUri.match(/\.(mp3|aac|wav)/i)

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.85}
      style={[
        styles.clip,
        { width },
        isSelected && styles.clipSelected,
        isVideo && styles.clipVideo,
        isAudio && styles.clipAudio,
      ]}
    >
      <Text style={styles.label} numberOfLines={1}>
        {clip.label ?? (isVideo ? 'Video' : isAudio ? 'Audio' : 'Clip')}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  clip: {
    height: '100%',
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.xs,
    justifyContent: 'center',
  },
  clipSelected: {
    borderColor: Colors.brand,
    backgroundColor: Colors.white10,
  },
  clipVideo: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.brand,
  },
  clipAudio: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
  },
  label: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
  },
})
