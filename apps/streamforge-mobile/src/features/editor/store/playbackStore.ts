import { useEditorStore, type EditorState } from './editorStore'
import type { PlaybackStatus } from '../types/playback.types'

interface PlaybackState {
  currentTime: number
  duration: number
  isPlaying: boolean
  playbackRate: number
  isSeeking: boolean
  isScrubbing: boolean
  lastSeekTime: number
  playerReady: boolean
  playbackStatus: PlaybackStatus
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setPlaying: (playing: boolean) => void
  setPlaybackRate: (rate: number) => void
  seekTo: (time: number) => void
  reset: () => void
}

function playbackFacade(state: EditorState): PlaybackState {
  return {
    ...state.playback,
    setCurrentTime: state.setCurrentTime,
    setDuration: state.setDuration,
    setPlaying: state.setPlaying,
    setPlaybackRate: state.setPlaybackRate,
    seekTo: state.seekTo,
    reset: state.resetPlayback,
  }
}

type PlaybackStoreHook = {
  <T>(selector: (state: PlaybackState) => T): T
  getState: () => PlaybackState
}

export const usePlaybackStore = ((selector) =>
  useEditorStore((state) => selector(playbackFacade(state)))) as PlaybackStoreHook

usePlaybackStore.getState = () => playbackFacade(useEditorStore.getState())
