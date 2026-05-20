import { useCallback, useEffect } from 'react'
import { useSharedValue } from 'react-native-reanimated'
import { usePlaybackStore } from '../store/playbackStore'
import { useEditorStore } from '../store/editorStore'
import { getClipAtTime } from '../engine/timelineEngine'
import { mapTimelineToSource } from '../engine/timeMapping'

export function usePlaybackSync() {
  const playhead = useSharedValue(0)
  const isScrubbing = useSharedValue(false)

  const clips = useEditorStore((s) => s.clips)
  const currentTime = usePlaybackStore((s) => s.currentTime)
  const duration = usePlaybackStore((s) => s.duration)
  const isPlaying = usePlaybackStore((s) => s.isPlaying)
  const setCurrentTime = usePlaybackStore((s) => s.setCurrentTime)
  const setPlaying = usePlaybackStore((s) => s.setPlaying)

  const commitTime = useCallback(
    (t: number) => {
      const clamped = Math.max(0, Math.min(t, duration))
      setCurrentTime(clamped)
      playhead.value = clamped
    },
    [duration, setCurrentTime, playhead],
  )

  useEffect(() => {
    if (!isPlaying) return
    const id = setInterval(() => {
      if (isScrubbing.value) return
      const next = usePlaybackStore.getState().currentTime + 0.033
      if (next >= duration) {
        setPlaying(false)
        commitTime(duration)
      } else {
        commitTime(next)
      }
    }, 33)
    return () => clearInterval(id)
  }, [isPlaying, duration, commitTime, setPlaying, isScrubbing])

  const activeClip = getClipAtTime(clips, currentTime)

  const sourceTimeForPlayhead = useCallback(
    (timelineTime: number) => {
      const clip = getClipAtTime(clips, timelineTime)
      if (!clip) return 0
      return mapTimelineToSource(clip, timelineTime)
    },
    [clips],
  )

  return {
    playhead,
    isScrubbing,
    commitTime,
    activeClip,
    sourceTimeForPlayhead,
    currentTime,
    duration,
    isPlaying,
    setPlaying,
  }
}

export function useSyncPlayheadFromStore() {
  const currentTime = usePlaybackStore((s) => s.currentTime)
  const playhead = useSharedValue(currentTime)

  useEffect(() => {
    playhead.value = currentTime
  }, [currentTime, playhead])

  return playhead
}
