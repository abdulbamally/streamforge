import { useCallback, useRef } from 'react'
import { useEditorStore } from '../../store/editorStore'
import type { TimelineMetrics } from '../../types/timeline.types'
import { clampTime, xToTime } from '../timeline/timelineMath'
import { SCRUB_SEEK_THROTTLE_MS } from './syncConstants'

export function useScrubbingSync(metrics: TimelineMetrics) {
  const wasPlayingBeforeScrub = useRef(false)
  const lastSeekAt = useRef(0)

  const pointToTime = useCallback(
    (x: number) => {
      const state = useEditorStore.getState()
      return clampTime(
        xToTime(x, metrics.pixelsPerSecond, metrics.scrollOffsetX),
        0,
        state.playback.duration,
      )
    },
    [metrics.pixelsPerSecond, metrics.scrollOffsetX],
  )

  const beginScrub = useCallback(
    (x: number) => {
      const state = useEditorStore.getState()
      const time = pointToTime(x)
      wasPlayingBeforeScrub.current = state.playback.isPlaying
      state.setIsPlaying(false)
      state.beginScrub(time, x)
      state.seekTo(time)
      lastSeekAt.current = Date.now()
    },
    [pointToTime],
  )

  const updateScrub = useCallback(
    (x: number) => {
      const state = useEditorStore.getState()
      const time = pointToTime(x)
      state.updateScrub(time, x)
      const now = Date.now()
      if (now - lastSeekAt.current >= SCRUB_SEEK_THROTTLE_MS) {
        state.seekTo(time)
        lastSeekAt.current = now
      }
    },
    [pointToTime],
  )

  const endScrub = useCallback(
    (x?: number) => {
      const state = useEditorStore.getState()
      const finalTime = typeof x === 'number' ? pointToTime(x) : state.playback.currentTime
      state.updateScrub(finalTime, x ?? state.gestures.scrubCurrentX)
      state.seekTo(finalTime)
      state.endScrub()
      if (wasPlayingBeforeScrub.current) {
        state.setIsPlaying(true)
      }
      wasPlayingBeforeScrub.current = false
    },
    [pointToTime],
  )

  const cancelScrub = useCallback(() => {
    const state = useEditorStore.getState()
    state.cancelScrub()
    if (wasPlayingBeforeScrub.current) {
      state.setIsPlaying(true)
    }
    wasPlayingBeforeScrub.current = false
  }, [])

  return {
    beginScrub,
    updateScrub,
    endScrub,
    cancelScrub,
    pointToTime,
  }
}
