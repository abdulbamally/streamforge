// ============================================================
//  ClipItem — A single clip on the timeline track
// ============================================================

import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { Colors, Typography, Spacing, Radius } from '@shared/theme/tokens'
import type { Clip } from '@streamforge/api-contract'

interface ClipItemProps {
  clip:             Clip
  isSelected:       boolean
  pixelsPerSecond:  number
  onPress:          () => void
  onLongPress?:     () => void
}

export function ClipItem({
  clip,
  isSelected,
  pixelsPerSecond,
  onPress,
  onLongPress,
}: ClipItemProps) {
  const clipDuration = clip.endTime - clip.startTime
  const width        = Math.max(clipDuration * pixelsPerSecond, 40)

  const isVideo = clip.assetUrl.match(/\.(mp4|mov|webm|mkv)$/i)
  const isAudio = clip.assetUrl.match(/\.(mp3|aac|wav)$/i)

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.85}
      style={[
        styles.clip,
        { width },
        isAudio   && styles.clipAudio,
        isSelected && styles.clipSelected,
      ]}
    >
      {/* Thumbnail strip for video clips */}
      {isVideo && (
        <View style={styles.thumbnailStrip}>
          {/* In a real implementation, generate thumbnail frames here */}
          <View style={styles.thumbnailPlaceholder} />
        </View>
      )}

      {/* Clip label */}
      <View style={styles.labelRow}>
        <Text style={styles.label} numberOfLines={1}>
          {isAudio ? '♪ ' : ''}{clipDuration.toFixed(1)}s
        </Text>
      </View>

      {/* Selection handles */}
      {isSelected && (
        <>
          <View style={[styles.handle, styles.handleLeft]}  />
          <View style={[styles.handle, styles.handleRight]} />
        </>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  clip: {
    height:          56,
    borderRadius:    Radius.sm,
    backgroundColor: Colors.brand,
    overflow:        'hidden',
    borderWidth:     2,
    borderColor:     'transparent',
    position:        'relative',
  },
  clipAudio: {
    backgroundColor: Colors.success,
    height:          36,
  },
  clipSelected: {
    borderColor: Colors.textPrimary,
  },
  thumbnailStrip: {
    position:   'absolute',
    top:        0,
    left:       0,
    right:      0,
    bottom:     0,
    opacity:    0.4,
  },
  thumbnailPlaceholder: {
    flex:            1,
    backgroundColor: Colors.brandDark,
  },
  labelRow: {
    position:  'absolute',
    bottom:    Spacing.xxs,
    left:      Spacing.xs,
    right:     Spacing.xs,
  },
  label: {
    fontSize:   Typography.xs,
    fontFamily: Typography.fontSemiBold,
    color:      Colors.textPrimary,
  },
  handle: {
    position:        'absolute',
    top:             4,
    bottom:          4,
    width:           4,
    borderRadius:    2,
    backgroundColor: Colors.textPrimary,
  },
  handleLeft:  { left:  2 },
  handleRight: { right: 2 },
})
