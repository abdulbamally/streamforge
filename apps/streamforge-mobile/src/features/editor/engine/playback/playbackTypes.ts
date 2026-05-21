export type PlaybackController = {
  play: () => void
  pause: () => void
  seek: (time: number) => void
}
