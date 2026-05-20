// ============================================================
//  useTimeline — Timeline playback and scrubbing logic
// ============================================================

import { useCallback, useEffect, useRef } from 'react'
import { useEditorStore } from '../store/editorStore'

export function useTimeline() {
  const {
    currentTime,
    duration,
    isPlaying,
    playbackRate,
    zoom,
    scrollOffset,
    selectedClipId,
    clips,
    setCurrentTime,
    setPlaying,
    setZoom,
    setScrollOffset,
    selectClip,
  } = useEditorStore()

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Playback ticker ────────────────────────────────────────
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const next = useEditorStore.getState().currentTime + (0.1 * playbackRate)
        if (next >= duration) {
          useEditorStore.getState().setPlaying(false)
          useEditorStore.getState().setCurrentTime(duration)
        } else {
          useEditorStore.getState().setCurrentTime(next)
        }
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, playbackRate, duration])

  // ── Controls ───────────────────────────────────────────────
  const play  = useCallback(() => setPlaying(true),  [setPlaying])
  const pause = useCallback(() => setPlaying(false), [setPlaying])

  const togglePlay = useCallback(() => {
    const { isPlaying: playing, currentTime: ct, duration: dur } = useEditorStore.getState()
    if (playing) {
      setPlaying(false)
    } else {
      // If at end, restart from beginning
      if (ct >= dur) setCurrentTime(0)
      setPlaying(true)
    }
  }, [setPlaying, setCurrentTime])

  const seekTo = useCallback((time: number) => {
    setCurrentTime(Math.max(0, Math.min(time, duration)))
  }, [setCurrentTime, duration])

  const seekBySeconds = useCallback((delta: number) => {
    const ct = useEditorStore.getState().currentTime
    seekTo(ct + delta)
  }, [seekTo])

  const zoomIn  = useCallback(() => setZoom(Math.min(zoom * 1.5, 10)),   [zoom, setZoom])
  const zoomOut = useCallback(() => setZoom(Math.max(zoom / 1.5, 0.25)), [zoom, setZoom])

  // ── Timeline pixel calculations ────────────────────────────
  // How many pixels = 1 second at current zoom
  const PIXELS_PER_SECOND = 50 * zoom

  const timeToX    = useCallback((t: number) => t * PIXELS_PER_SECOND,    [PIXELS_PER_SECOND])
  const xToTime    = useCallback((x: number) => x / PIXELS_PER_SECOND,    [PIXELS_PER_SECOND])
  const totalWidth = duration * PIXELS_PER_SECOND

  // ── Clip at current playhead ───────────────────────────────
  const activeClips = clips.filter(
    c => c.startTime <= currentTime && c.endTime >= currentTime
  )

  return {
    // State
    currentTime,
    duration,
    isPlaying,
    playbackRate,
    zoom,
    scrollOffset,
    selectedClipId,
    clips,
    activeClips,

    // Controls
    play,
    pause,
    togglePlay,
    seekTo,
    seekBySeconds,
    zoomIn,
    zoomOut,
    setScrollOffset,
    selectClip,

    // Layout helpers
    timeToX,
    xToTime,
    totalWidth,
    PIXELS_PER_SECOND,

    // Progress 0-1
    progress: duration > 0 ? currentTime / duration : 0,
  }
}
