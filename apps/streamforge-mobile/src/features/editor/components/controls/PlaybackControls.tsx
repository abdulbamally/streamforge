import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Pause, Play } from 'lucide-react-native'
import { useEditorPlayback } from '../../hooks/useEditorPlayback'
import { useEditorStore } from '../../store/editorStore'
import {
  EditorColors,
  EditorRadius,
  EditorSpacing,
  EditorTypography,
} from '../../theme/editorTokens'
import { TimeDisplay } from './TimeDisplay'

export function PlaybackControls() {
  const {
    currentTime,
    duration,
    isPlaying,
    playbackRate,
    playbackStatus,
    togglePlayback,
  } = useEditorPlayback()
  const autoScrollEnabled = useEditorStore((state) => state.timeline.autoScrollEnabled)
  const playerReady = useEditorStore((state) => state.playback.playerReady)
  const setAutoScrollEnabled = useEditorStore((state) => state.setAutoScrollEnabled)
  const canPlay = playerReady && playbackStatus !== 'loading' && playbackStatus !== 'error'

  return (
    <View style={styles.root}>
      <Pressable
        onPress={togglePlayback}
        disabled={!canPlay}
        style={({ pressed }) => [
          styles.play,
          pressed && styles.pressed,
          !canPlay && styles.disabled,
        ]}
      >
        {isPlaying ? (
          <Pause size={18} color={EditorColors.white} />
        ) : (
          <Play size={18} color={EditorColors.white} />
        )}
      </Pressable>
      <TimeDisplay currentTime={currentTime} duration={duration} light />
      <Text style={styles.rate}>{playbackRate.toFixed(1)}x</Text>
      <Pressable
        onPress={() => setAutoScrollEnabled(!autoScrollEnabled)}
        style={[styles.autoScroll, autoScrollEnabled && styles.autoScrollActive]}
      >
        <Text style={[styles.autoScrollText, autoScrollEnabled && styles.autoScrollTextActive]}>
          Follow
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: EditorSpacing.md,
    right: EditorSpacing.md,
    bottom: EditorSpacing.md,
    minHeight: 44,
    borderRadius: EditorRadius.full,
    backgroundColor: 'rgba(17,19,24,0.72)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: EditorSpacing.sm,
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
  disabled: {
    opacity: 0.4,
  },
  rate: {
    color: EditorColors.white,
    fontSize: EditorTypography.xs,
    fontWeight: '800',
  },
  autoScroll: {
    borderRadius: EditorRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: EditorSpacing.sm,
    paddingVertical: EditorSpacing.xs,
  },
  autoScrollActive: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  autoScrollText: {
    color: '#d0d5dd',
    fontSize: EditorTypography.micro,
    fontWeight: '800',
  },
  autoScrollTextActive: {
    color: EditorColors.white,
  },
})
