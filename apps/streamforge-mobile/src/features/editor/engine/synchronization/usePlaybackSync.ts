import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import type {
  OnBufferData,
  OnLoadData,
  OnProgressData,
  OnSeekData,
  VideoRef,
} from 'react-native-video'
import { createPlaybackController } from '../playback/playbackController'
import { shouldSeek } from '../playback/playbackUtils'
import { useEditorStore } from '../../store/editorStore'
import {
  PROGRESS_UPDATE_EPSILON_SECONDS,
  SEEK_EPSILON_SECONDS,
} from './syncConstants'

export function usePlaybackSync(videoRef: RefObject<VideoRef | null>) {
  const controller = useMemo(() => createPlaybackController(videoRef), [videoRef])
  const isPlaying = useEditorStore((state) => state.playback.isPlaying)
  const lastSeekTime = useEditorStore((state) => state.playback.lastSeekTime)
  const isSeeking = useEditorStore((state) => state.playback.isSeeking)
  const playbackRate = useEditorStore((state) => state.playback.playbackRate)
  const playerReady = useEditorStore((state) => state.playback.playerReady)
  const lastPlayerTime = useRef(0)
  const lastAppliedSeek = useRef<number | null>(null)

  useEffect(() => {
    if (!playerReady) return
    if (isPlaying) {
      controller.play()
      useEditorStore.getState().setPlaybackStatus('playing')
      return
    }
    controller.pause()
    const status = useEditorStore.getState().playback.playbackStatus
    if (status !== 'ended' && status !== 'error' && status !== 'seeking') {
      useEditorStore.getState().setPlaybackStatus('paused')
    }
  }, [controller, isPlaying, playerReady])

  useEffect(() => {
    if (!playerReady || !isSeeking) return
    if (lastAppliedSeek.current === lastSeekTime) return
    if (!shouldSeek(lastSeekTime, lastPlayerTime.current, SEEK_EPSILON_SECONDS)) {
      useEditorStore.getState().setIsSeeking(false)
      return
    }
    lastAppliedSeek.current = lastSeekTime
    controller.seek(lastSeekTime)
  }, [controller, isSeeking, lastSeekTime, playerReady])

  const handleLoad = useCallback((data: OnLoadData) => {
    const state = useEditorStore.getState()
    if (data.duration > 0) {
      state.setDuration(data.duration)
    }
    state.setPlayerReady(true)
    state.setPlaybackStatus('ready')
  }, [])

  const handleProgress = useCallback((data: OnProgressData) => {
    lastPlayerTime.current = data.currentTime
    const state = useEditorStore.getState()
    if (state.playback.isScrubbing || state.playback.isSeeking) return
    if (
      Math.abs(data.currentTime - state.playback.currentTime) <
      PROGRESS_UPDATE_EPSILON_SECONDS
    ) {
      return
    }
    state.setCurrentTime(data.currentTime)
  }, [])

  const handleSeek = useCallback((data: OnSeekData) => {
    lastPlayerTime.current = data.currentTime
    const state = useEditorStore.getState()
    if (state.playback.isScrubbing) {
      state.setIsSeeking(false)
      state.setLastSeekTime(data.currentTime)
      return
    }
    state.setCurrentTime(data.currentTime)
    state.setIsSeeking(false)
    state.setLastSeekTime(data.currentTime)
    state.setPlaybackStatus(state.playback.isPlaying ? 'playing' : 'paused')
  }, [])

  const handleBuffer = useCallback((data: OnBufferData) => {
    const state = useEditorStore.getState()
    if (data.isBuffering) {
      state.setPlaybackStatus('buffering')
      return
    }
    state.setPlaybackStatus(state.playback.isPlaying ? 'playing' : 'paused')
  }, [])

  const handleEnd = useCallback(() => {
    const state = useEditorStore.getState()
    state.setCurrentTime(state.playback.duration)
    state.setIsPlaying(false)
    state.setPlaybackStatus('ended')
  }, [])

  const handleError = useCallback(() => {
    const state = useEditorStore.getState()
    state.setIsPlaying(false)
    state.setPlayerReady(false)
    state.setPlaybackStatus('error')
  }, [])

  return {
    paused: !isPlaying,
    rate: playbackRate,
    handleLoad,
    handleProgress,
    handleSeek,
    handleBuffer,
    handleEnd,
    handleError,
  }
}
