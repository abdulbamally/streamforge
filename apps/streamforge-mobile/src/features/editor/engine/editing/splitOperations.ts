import type { TimelineClip } from '../../types/clip.types'
import { getClipEndTime } from './overlapDetection'

export function splitClipAtTime(clip: TimelineClip, splitTime: number): [TimelineClip, TimelineClip] {
  const endTime = getClipEndTime(clip)
  const leftDuration = splitTime - clip.startTime
  const rightDuration = endTime - splitTime
  const rightId = `${clip.id}-split-${Date.now()}`

  return [
    {
      ...clip,
      duration: leftDuration,
    },
    {
      ...clip,
      id: rightId,
      name: `${clip.name} copy`,
      startTime: splitTime,
      duration: rightDuration,
      trimStart: clip.trimStart + leftDuration,
    },
  ]
}

