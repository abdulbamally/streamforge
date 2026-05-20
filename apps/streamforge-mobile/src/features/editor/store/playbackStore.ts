import { create } from 'zustand'

interface PlaybackState {
  currentTime: number
  duration: number
  isPlaying: boolean
  playbackRate: number
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setPlaying: (playing: boolean) => void
  setPlaybackRate: (rate: number) => void
  reset: () => void
}

const initial = {
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  playbackRate: 1,
}

export const usePlaybackStore = create<PlaybackState>((set) => ({
  ...initial,
  setCurrentTime: (time) => set({ currentTime: Math.max(0, time) }),
  setDuration: (duration) => set({ duration: Math.max(0, duration) }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  reset: () => set({ ...initial }),
}))
