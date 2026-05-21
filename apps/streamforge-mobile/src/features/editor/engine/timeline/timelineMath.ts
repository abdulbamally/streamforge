import type { TimelineClip } from '../../types/clip.types'

export function timeToX(
  time: number,
  pixelsPerSecond: number,
  scrollOffsetX: number,
): number {
  return time * pixelsPerSecond - scrollOffsetX
}

export function xToTime(
  x: number,
  pixelsPerSecond: number,
  scrollOffsetX: number,
): number {
  if (pixelsPerSecond <= 0) return 0
  return (x + scrollOffsetX) / pixelsPerSecond
}

export function durationToWidth(duration: number, pixelsPerSecond: number): number {
  return Math.max(0, duration * pixelsPerSecond)
}

export function clampTime(time: number, min: number, max: number): number {
  return Math.max(min, Math.min(time, max))
}

export function calculateVisibleRange(
  scrollOffsetX: number,
  viewportWidth: number,
  pixelsPerSecond: number,
): { start: number; end: number } {
  return {
    start: Math.max(0, xToTime(0, pixelsPerSecond, scrollOffsetX)),
    end: Math.max(0, xToTime(viewportWidth, pixelsPerSecond, scrollOffsetX)),
  }
}

export function snapTimeToGrid(time: number, gridSize: number): number {
  if (gridSize <= 0) return time
  return Math.round(time / gridSize) * gridSize
}

export function getClipEndTime(clip: TimelineClip): number {
  return clip.startTime + clip.duration
}

export function isTimeInsideClip(time: number, clip: TimelineClip): boolean {
  return time >= clip.startTime && time <= getClipEndTime(clip)
}

export function formatTimeLabel(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(safeSeconds / 60)
  const secs = safeSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}
