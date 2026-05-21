export type PlaybackClockState = {
  isPlaying: boolean
  currentTime: number
  duration: number
  playbackRate: number
}

export function clampPlaybackTime(time: number, duration: number): number {
  return Math.max(0, Math.min(time, Math.max(0, duration)))
}
