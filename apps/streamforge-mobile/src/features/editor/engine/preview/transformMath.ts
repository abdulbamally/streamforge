import type { TimelineClip } from '../../types/clip.types'

export function isClipActiveAtTime(clip: TimelineClip, currentTime: number): boolean {
  return currentTime >= clip.startTime && currentTime <= clip.startTime + clip.duration
}
