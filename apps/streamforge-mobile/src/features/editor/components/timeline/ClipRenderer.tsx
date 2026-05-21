import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { TimelineClip } from '../../engine/types'
import {
  EditorColors,
  EditorRadius,
  EditorSpacing,
  EditorTypography,
} from '../../theme/editorTokens'

type ClipRendererProps = {
  clips: TimelineClip[]
}

export function ClipRenderer({ clips }: ClipRendererProps) {
  return (
    <View pointerEvents="none" style={styles.root}>
      {clips.length === 0 ? (
        <Text style={styles.empty}>No clips</Text>
      ) : (
        <Text style={styles.clipLabel} numberOfLines={1}>
          {clips[0].label ?? 'Video clip'}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 32,
    right: 32,
    top: 58,
  },
  clipLabel: {
    alignSelf: 'flex-start',
    maxWidth: '68%',
    color: EditorColors.textPrimary,
    fontSize: EditorTypography.xs,
    fontWeight: '800',
    backgroundColor: 'rgba(255,255,255,0.64)',
    borderRadius: EditorRadius.full,
    overflow: 'hidden',
    paddingHorizontal: EditorSpacing.sm,
    paddingVertical: EditorSpacing.xs,
  },
  empty: {
    color: EditorColors.textTertiary,
    fontSize: EditorTypography.xs,
    fontWeight: '700',
  },
})
