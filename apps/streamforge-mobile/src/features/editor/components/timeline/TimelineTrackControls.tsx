import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Eye, EyeOff, Lock, Unlock, Volume2, VolumeX } from 'lucide-react-native'
import { useEditorStore } from '../../store/editorStore'
import {
  EditorColors,
  EditorRadius,
  EditorSpacing,
  EditorTypography,
} from '../../theme/editorTokens'

export function TimelineTrackControls() {
  const tracks = useEditorStore((state) => state.tracks)
  const executeEditCommand = useEditorStore((state) => state.executeEditCommand)

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.root}
    >
      {tracks.map((track) => {
        const visualTrack = track.type !== 'audio'
        return (
          <View key={track.id} style={styles.track}>
            <Text style={styles.name} numberOfLines={1}>{track.name.replace(' Track ', ' ')}</Text>
            <Pressable
              style={[styles.icon, track.isLocked && styles.iconActive]}
              onPress={() =>
                executeEditCommand(track.isLocked ? 'UNLOCK_TRACK' : 'LOCK_TRACK', {
                  trackId: track.id,
                })
              }
            >
              {track.isLocked ? (
                <Lock size={13} color={EditorColors.accent} />
              ) : (
                <Unlock size={13} color={EditorColors.textSecondary} />
              )}
            </Pressable>
            <Pressable
              disabled={track.type !== 'audio'}
              style={[styles.icon, track.isMuted && styles.iconActive, track.type !== 'audio' && styles.disabled]}
              onPress={() =>
                executeEditCommand(track.isMuted ? 'UNMUTE_TRACK' : 'MUTE_TRACK', {
                  trackId: track.id,
                })
              }
            >
              {track.isMuted ? (
                <VolumeX size={13} color={EditorColors.accent} />
              ) : (
                <Volume2 size={13} color={EditorColors.textSecondary} />
              )}
            </Pressable>
            <Pressable
              disabled={!visualTrack}
              style={[styles.icon, !track.isVisible && styles.iconActive, !visualTrack && styles.disabled]}
              onPress={() =>
                executeEditCommand(track.isVisible ? 'HIDE_TRACK' : 'SHOW_TRACK', {
                  trackId: track.id,
                })
              }
            >
              {track.isVisible ? (
                <Eye size={13} color={EditorColors.textSecondary} />
              ) : (
                <EyeOff size={13} color={EditorColors.accent} />
              )}
            </Pressable>
          </View>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    marginBottom: EditorSpacing.sm,
  },
  content: {
    gap: EditorSpacing.xs,
    paddingRight: EditorSpacing.md,
  },
  track: {
    minHeight: 36,
    borderRadius: EditorRadius.full,
    borderWidth: 1,
    borderColor: EditorColors.border,
    backgroundColor: EditorColors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: EditorSpacing.xs,
    paddingLeft: EditorSpacing.sm,
    paddingRight: EditorSpacing.xs,
  },
  name: {
    maxWidth: 82,
    color: EditorColors.textSecondary,
    fontSize: EditorTypography.micro,
    fontWeight: '800',
  },
  icon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: EditorColors.surfaceSoft,
  },
  iconActive: {
    backgroundColor: EditorColors.accentSoft,
  },
  disabled: {
    opacity: 0.32,
  },
})

