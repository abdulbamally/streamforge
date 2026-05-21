import type { TimelineTrack } from '../../types/track.types'

export type EditorPerformanceBudget = {
  maxRenderedClips: number
  maxWaveformSamplesPerClip: number
  maxThumbnailSegmentsPerClip: number
}

export const DEFAULT_EDITOR_PERFORMANCE_BUDGET: EditorPerformanceBudget = {
  maxRenderedClips: 80,
  maxWaveformSamplesPerClip: 120,
  maxThumbnailSegmentsPerClip: 12,
}

export function countTimelineClips(tracks: TimelineTrack[]): number {
  return tracks.reduce((total, track) => total + track.clips.length, 0)
}

export function shouldEnableHeavyTimelineDebug(
  tracks: TimelineTrack[],
  budget: EditorPerformanceBudget = DEFAULT_EDITOR_PERFORMANCE_BUDGET,
): boolean {
  return countTimelineClips(tracks) <= budget.maxRenderedClips
}

export function clampSampleCount(samples: number[], maxSamples = DEFAULT_EDITOR_PERFORMANCE_BUDGET.maxWaveformSamplesPerClip): number[] {
  if (samples.length <= maxSamples) return samples
  const step = samples.length / maxSamples
  return Array.from({ length: maxSamples }, (_, index) => samples[Math.floor(index * step)] ?? 0)
}
