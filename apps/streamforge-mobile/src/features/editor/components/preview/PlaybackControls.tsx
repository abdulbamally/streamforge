import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Pause, Play } from 'lucide-react-native'
import { useEditorStore } from '../../store/editorStore'
import { formatTimecode } from '../../engine/timeMapping'
import {
  EditorColors,
  EditorRadius,
  EditorSpacing,
  EditorTypography,
} from '../../theme/editorTokens'

export function PlaybackControls() {
  const { currentTime, duration, isPlaying } = useEditorStore((state) => state.playback)
  const setPlaying = useEditorStore((state) => state.setPlaying)

  return (
    <View style={styles.root}>
      <Pressable
        onPress={() => setPlaying(!isPlaying)}
        style={({ pressed }) => [styles.play, pressed && styles.pressed]}
      >
        {isPlaying ? (
          <Pause size={18} color={EditorColors.white} />
        ) : (
          <Play size={18} color={EditorColors.white} />
        )}
      </Pressable>
      <Text style={styles.time} numberOfLines={1}>
        {formatTimecode(currentTime)} / {formatTimecode(duration)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: EditorSpacing.md,
    right: EditorSpacing.md,
    bottom: EditorSpacing.md,
    height: 44,
    borderRadius: EditorRadius.full,
    backgroundColor: 'rgba(17,19,24,0.72)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: EditorSpacing.md,
    paddingHorizontal: EditorSpacing.sm,
  },
  play: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: EditorColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  time: {
    flex: 1,
    color: EditorColors.white,
    fontSize: EditorTypography.sm,
    fontWeight: '700',
  },
})
