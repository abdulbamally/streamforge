import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import Video, { type VideoRef } from 'react-native-video'
import { usePlaybackSync } from '../../engine/synchronization/usePlaybackSync'
import { useEditorStore } from '../../store/editorStore'
import {
  EditorColors,
  EditorRadius,
  EditorTypography,
} from '../../theme/editorTokens'

type NativeVideoSurfaceProps = {
  sourceUri: string | null
}

export function NativeVideoSurface({ sourceUri }: NativeVideoSurfaceProps) {
  const videoRef = useRef<VideoRef>(null)
  const [loading, setLoading] = useState(false)
  const playbackStatus = useEditorStore((state) => state.playback.playbackStatus)
  const {
    handleBuffer,
    handleEnd,
    handleError,
    handleLoad,
    handleProgress,
    handleSeek,
    paused,
    rate,
  } = usePlaybackSync(videoRef)

  useEffect(() => {
    setLoading(!!sourceUri)
    const state = useEditorStore.getState()
    state.setPlayerReady(false)
    state.setPlaybackStatus(sourceUri ? 'loading' : 'idle')
  }, [sourceUri])

  const handleLoaded = useCallback(
    (...args: Parameters<typeof handleLoad>) => {
      setLoading(false)
      handleLoad(...args)
    },
    [handleLoad],
  )

  if (!sourceUri) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Import a video to preview</Text>
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <Video
        ref={videoRef}
        source={{ uri: sourceUri }}
        style={styles.video}
        resizeMode="contain"
        paused={paused}
        rate={rate}
        repeat={false}
        onLoad={handleLoaded}
        onProgress={handleProgress}
        onSeek={handleSeek}
        onBuffer={handleBuffer}
        onEnd={handleEnd}
        onError={handleError}
        progressUpdateInterval={100}
      />
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={EditorColors.accent} />
        </View>
      ) : null}
      {playbackStatus === 'error' ? (
        <View style={styles.error}>
          <Text style={styles.errorText}>Unable to load this video</Text>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: EditorColors.stage,
  },
  video: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17,19,24,0.52)',
  },
  empty: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: EditorColors.stage,
    borderRadius: EditorRadius.lg,
  },
  emptyText: {
    color: '#d0d5dd',
    fontSize: EditorTypography.sm,
    fontWeight: '600',
  },
  error: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17,19,24,0.76)',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: EditorTypography.sm,
    fontWeight: '700',
  },
})
