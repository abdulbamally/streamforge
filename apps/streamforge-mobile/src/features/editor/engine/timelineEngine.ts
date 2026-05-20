// ============================================================
//  Timeline Engine — pure editing math (no React)
// ============================================================

import type { TimelineClip } from './types'
import { SNAP_GRID_SEC } from './types'
import { clipTimelineEnd } from './timeMapping'

export function generateId(prefix = 'clip'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function snapTime(time: number, grid = SNAP_GRID_SEC): number {
  return Math.round(time / grid) * grid
}

export function getTotalDuration(clips: TimelineClip[]): number {
  if (!clips.length) return 0
  return clips.reduce((max, c) => Math.max(max, clipTimelineEnd(c)), 0)
}

export function getClipAtTime(clips: TimelineClip[], time: number): TimelineClip | null {
  return (
    clips.find((c) => time >= c.timelineStart && time < clipTimelineEnd(c)) ?? null
  )
}

export function recalculateTimelineStarts(clips: TimelineClip[]): TimelineClip[] {
  const sorted = [...clips].sort((a, b) => a.timelineStart - b.timelineStart)
  let cursor = 0
  return sorted.map((clip) => {
    const next = { ...clip, timelineStart: cursor }
    cursor += clip.duration
    return next
  })
}

export function splitClipAtPlayhead(
  clips: TimelineClip[],
  clipId: string,
  playhead: number,
): TimelineClip[] {
  const index = clips.findIndex((c) => c.id === clipId)
  if (index < 0) return clips

  const clip = clips[index]
  const end = clipTimelineEnd(clip)
  if (playhead <= clip.timelineStart || playhead >= end) return clips

  const splitOffset = playhead - clip.timelineStart
  const sourceSplit =
    clip.sourceStart + splitOffset * (clip.speed ?? 1)

  const left: TimelineClip = {
    ...clip,
    sourceEnd: sourceSplit,
    duration: splitOffset,
  }

  const right: TimelineClip = {
    ...clip,
    id: generateId(),
    sourceStart: sourceSplit,
    timelineStart: playhead,
    duration: clip.duration - splitOffset,
  }

  const next = [...clips]
  next.splice(index, 1, left, right)
  return next
}

export function trimClipLeft(
  clip: TimelineClip,
  newTimelineStart: number,
): TimelineClip {
  const delta = newTimelineStart - clip.timelineStart
  if (delta <= 0) return clip
  const maxDelta = clip.duration - 0.1
  const applied = Math.min(delta, maxDelta)
  return {
    ...clip,
    timelineStart: clip.timelineStart + applied,
    sourceStart: clip.sourceStart + applied * (clip.speed ?? 1),
    duration: clip.duration - applied,
  }
}

export function trimClipRight(clip: TimelineClip, newEnd: number): TimelineClip {
  const end = clipTimelineEnd(clip)
  if (newEnd >= end) return clip
  const delta = end - newEnd
  const maxDelta = clip.duration - 0.1
  const applied = Math.min(delta, maxDelta)
  return {
    ...clip,
    sourceEnd: clip.sourceEnd - applied * (clip.speed ?? 1),
    duration: clip.duration - applied,
  }
}

export function reorderClips(
  clips: TimelineClip[],
  fromIndex: number,
  toIndex: number,
): TimelineClip[] {
  if (fromIndex === toIndex) return clips
  const sorted = [...clips].sort((a, b) => a.timelineStart - b.timelineStart)
  const [moved] = sorted.splice(fromIndex, 1)
  sorted.splice(toIndex, 0, moved)
  return recalculateTimelineStarts(sorted)
}

export function removeClip(clips: TimelineClip[], clipId: string): TimelineClip[] {
  return recalculateTimelineStarts(clips.filter((c) => c.id !== clipId))
}

export function layoutClips(
  clips: TimelineClip[],
  pixelsPerSecond: number,
): { clip: TimelineClip; left: number; width: number }[] {
  return clips.map((clip) => ({
    clip,
    left: clip.timelineStart * pixelsPerSecond,
    width: Math.max(clip.duration * pixelsPerSecond, 24),
  }))
}
