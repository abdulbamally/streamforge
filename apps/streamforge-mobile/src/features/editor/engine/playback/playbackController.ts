import type { RefObject } from 'react'
import type { VideoRef } from 'react-native-video'
import type { PlaybackController } from './playbackTypes'

export function createPlaybackController(
  videoRef: RefObject<VideoRef | null>,
): PlaybackController {
  return {
    play: () => videoRef.current?.resume(),
    pause: () => videoRef.current?.pause(),
    seek: (time) => videoRef.current?.seek(Math.max(0, time)),
  }
}
