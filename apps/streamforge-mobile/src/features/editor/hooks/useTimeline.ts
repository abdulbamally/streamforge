// ============================================================
//  useTimeline — Layout + controls (playback in playbackStore)
// ============================================================

import { useCallback } from 'react'
import { useEditorStore } from '../store/editorStore'
import { usePlaybackStore } from '../store/playbackStore'
import { useUiStore } from '../store/uiStore'
import { getClipAtTime } from '../engine/timelineEngine'

export function useTimeline() {
  const clips = useEditorStore((s) => s.clips)
  const selectedClipId = useEditorStore((s) => s.selection.selectedClipId)
  const selectClip = useEditorStore((s) => s.selectClip)

  const currentTime = usePlaybackStore((s) => s.currentTime)
  const duration = usePlaybackStore((s) => s.duration)
  const isPlaying = usePlaybackStore((s) => s.isPlaying)
  const playbackRate = usePlaybackStore((s) => s.playbackRate)
  const setCurrentTime = usePlaybackStore((s) => s.setCurrentTime)
  const setPlaying = usePlaybackStore((s) => s.setPlaying)

  const zoom = useUiStore((s) => s.zoom)
  const scrollOffsetPx = useUiStore((s) => s.scrollOffsetPx)
  const setZoom = useUiStore((s) => s.setZoom)
  const setScrollOffsetPx = useUiStore((s) => s.setScrollOffsetPx)

  const play = useCallback(() => setPlaying(true), [setPlaying])
  const pause = useCallback(() => setPlaying(false), [setPlaying])

  const togglePlay = useCallback(() => {
    const { isPlaying: playing, currentTime: ct, duration: dur } =
      usePlaybackStore.getState()
    if (playing) {
      setPlaying(false)
    } else {
      if (ct >= dur) setCurrentTime(0)
      setPlaying(true)
    }
  }, [setPlaying, setCurrentTime])

  const seekTo = useCallback(
    (time: number) => {
      setCurrentTime(Math.max(0, Math.min(time, duration)))
    },
    [setCurrentTime, duration],
  )

  const seekBySeconds = useCallback(
    (delta: number) => {
      seekTo(usePlaybackStore.getState().currentTime + delta)
    },
    [seekTo],
  )

  const zoomIn = useCallback(() => setZoom(Math.min(zoom * 1.5, 10)), [zoom, setZoom])
  const zoomOut = useCallback(() => setZoom(Math.max(zoom / 1.5, 0.25)), [zoom, setZoom])

  const PIXELS_PER_SECOND = 50 * zoom
  const timeToX = useCallback((t: number) => t * PIXELS_PER_SECOND, [PIXELS_PER_SECOND])
  const xToTime = useCallback((x: number) => x / PIXELS_PER_SECOND, [PIXELS_PER_SECOND])
  const totalWidth = duration * PIXELS_PER_SECOND

  const activeClips = clips.filter(
    (c) => currentTime >= c.timelineStart && currentTime < c.timelineStart + c.duration,
  )

  const activeClip = getClipAtTime(clips, currentTime)

  return {
    clips,
    currentTime,
    duration,
    isPlaying,
    playbackRate,
    zoom,
    scrollOffset: scrollOffsetPx,
    selectedClipId,
    activeClips,
    activeClip,
    play,
    pause,
    togglePlay,
    seekTo,
    seekBySeconds,
    zoomIn,
    zoomOut,
    setScrollOffset: setScrollOffsetPx,
    selectClip,
    timeToX,
    xToTime,
    totalWidth,
    PIXELS_PER_SECOND,
    progress: duration > 0 ? currentTime / duration : 0,
  }
}
