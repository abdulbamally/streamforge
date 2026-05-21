import { formatTimeLabel } from '../timeline/timelineMath'

export function formatPlaybackTime(seconds: number): string {
  return formatTimeLabel(seconds)
}

export function shouldSeek(
  targetTime: number,
  currentPlayerTime: number,
  epsilon: number,
): boolean {
  return Math.abs(targetTime - currentPlayerTime) > epsilon
}
