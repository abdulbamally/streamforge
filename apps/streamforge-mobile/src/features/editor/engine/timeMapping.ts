import type { TimelineClip } from './types'

export function mapTimelineToSource(clip: TimelineClip, timelineTime: number): number {
  const offset = Math.max(0, timelineTime - clip.timelineStart)
  return clip.sourceStart + offset * (clip.speed ?? 1)
}

export function clipTimelineEnd(clip: TimelineClip): number {
  return clip.timelineStart + clip.duration
}

export function formatTimecode(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${m}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`
}
