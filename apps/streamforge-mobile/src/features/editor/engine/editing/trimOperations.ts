import type { TimelineClip } from '../../types/clip.types'
import { getClipEndTime } from './overlapDetection'

export const MIN_CLIP_DURATION = 0.25

export function trimClipStart(clip: TimelineClip, newStartTime: number): TimelineClip {
  const endTime = getClipEndTime(clip)
  const nextDuration = Math.max(MIN_CLIP_DURATION, endTime - newStartTime)
  const trimDelta = Math.max(0, newStartTime - clip.startTime)
  return {
    ...clip,
    startTime: endTime - nextDuration,
    duration: nextDuration,
    trimStart: clip.trimStart + trimDelta,
  }
}

export function trimClipEnd(clip: TimelineClip, newEndTime: number): TimelineClip {
  const nextDuration = Math.max(MIN_CLIP_DURATION, newEndTime - clip.startTime)
  const trimDelta = Math.max(0, getClipEndTime(clip) - newEndTime)
  return {
    ...clip,
    duration: nextDuration,
    trimEnd: clip.trimEnd + trimDelta,
  }
}

