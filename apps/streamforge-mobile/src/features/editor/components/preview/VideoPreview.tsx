import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native'
import Video, { type OnLoadData, type VideoRef } from 'react-native-video'
import { Maximize2, Pause, Play } from 'lucide-react-native'
import { Colors, IconSize, Spacing, Typography } from '@shared/theme/tokens'
import { usePlaybackStore } from '../../store/playbackStore'
import { usePlaybackSync } from '../../hooks/usePlaybackSync'
import { formatTimecode } from '../../engine/timeMapping'

interface VideoPreviewProps {
  sourceUri: string | null
  onFullscreen?: () => void
}

export function VideoPreview({ sourceUri, onFullscreen }: VideoPreviewProps) {
  const videoRef = useRef<VideoRef>(null)
  const [loading, setLoading] = useState(true)
  const {
    isPlaying,
    setPlaying,
    currentTime,
    duration,
    sourceTimeForPlayhead,
    commitTime,
  } = usePlaybackSync()

  const seekToPlayhead = useCallback(() => {
    if (!sourceUri) return
    const t = sourceTimeForPlayhead(usePlaybackStore.getState().currentTime)
    videoRef.current?.seek(Math.max(0, t))
  }, [sourceUri, sourceTimeForPlayhead])

  useEffect(() => {
    seekToPlayhead()
  }, [currentTime, sourceUri, seekToPlayhead])

  useEffect(() => {
    setLoading(true)
  }, [sourceUri])

  const onLoad = useCallback(
    (_data: OnLoadData) => {
      setLoading(false)
    },
    [],
  )

  if (!sourceUri) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Import a video to preview</Text>
      </View>
    )
  }

  return (
    <View style={styles.wrap}>
      <Video
        ref={videoRef}
        source={{ uri: sourceUri }}
        style={styles.video}
        resizeMode="contain"
        paused={!isPlaying}
        onLoad={onLoad}
        onEnd={() => setPlaying(false)}
        progressUpdateInterval={250}
        repeat={false}
      />
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={Colors.brand} />
        </View>
      ) : null}

      <View style={styles.controls}>
        <TouchableOpacity
          onPress={() => {
            if (currentTime >= duration && duration > 0) {
              commitTime(0)
            }
            setPlaying(!isPlaying)
          }}
          style={styles.playBtn}
        >
          {isPlaying ? (
            <Pause size={IconSize.md} color={Colors.textPrimary} />
          ) : (
            <Play size={IconSize.md} color={Colors.textPrimary} />
          )}
        </TouchableOpacity>
        <Text style={styles.time}>
          {formatTimecode(currentTime)} / {formatTimecode(duration)}
        </Text>
        {onFullscreen ? (
          <TouchableOpacity onPress={onFullscreen} hitSlop={8}>
            <Maximize2 size={IconSize.md} color={Colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: Colors.bg,
    overflow: 'hidden',
  },
  video: {
    flex: 1,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.overlay30,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgSurface,
  },
  emptyText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
    backgroundColor: Colors.overlay50,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    flex: 1,
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
  },
})
