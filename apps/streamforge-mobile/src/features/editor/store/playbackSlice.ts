import type { PlaybackStatus } from '../types/playback.types'

export type PlaybackSlice = {
  isPlaying: boolean
  currentTime: number
  duration: number
  playbackRate: number
  isSeeking: boolean
  isScrubbing: boolean
  lastSeekTime: number
  playerReady: boolean
  playbackStatus: PlaybackStatus
}

export const initialPlaybackSlice: PlaybackSlice = {
  isPlaying: false,
  currentTime: 0,
  duration: 60,
  playbackRate: 1,
  isSeeking: false,
  isScrubbing: false,
  lastSeekTime: 0,
  playerReady: false,
  playbackStatus: 'idle',
}
