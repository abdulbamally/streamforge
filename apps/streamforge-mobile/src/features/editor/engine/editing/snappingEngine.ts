import type { TimelineTrack } from '../../types/track.types'
import { SNAP_GRID_SECONDS } from '../timeline/timelineConstants'
import { getClipEndTime } from './overlapDetection'

export type SnapType = 'none' | 'grid' | 'playhead' | 'clip-start' | 'clip-end'

export type SnapGuide = {
  time: number
  type: Exclude<SnapType, 'none'>
}

export type SnapResult = {
  snappedTime: number
  snapType: SnapType
  snapTargetTime: number | null
  shouldShowSnapGuide: boolean
}

export const SNAP_THRESHOLD_SECONDS = 0.15

type SnapInput = {
  proposedTime: number
  currentTime: number
  tracks: TimelineTrack[]
  activeTrackId: string
  snappingEnabled: boolean
  snapThresholdSeconds?: number
  gridSizeSeconds?: number
  ignoreClipId?: string
}

function candidateResult(
  proposedTime: number,
  targetTime: number,
  snapType: SnapType,
  threshold: number,
): SnapResult | null {
  if (Math.abs(proposedTime - targetTime) > threshold) return null
  return {
    snappedTime: targetTime,
    snapType,
    snapTargetTime: targetTime,
    shouldShowSnapGuide: true,
  }
}

export function snapTimelineTime({
  proposedTime,
  currentTime,
  tracks,
  activeTrackId,
  snappingEnabled,
  snapThresholdSeconds = SNAP_THRESHOLD_SECONDS,
  gridSizeSeconds = SNAP_GRID_SECONDS,
  ignoreClipId,
}: SnapInput): SnapResult {
  if (!snappingEnabled) {
    return {
      snappedTime: proposedTime,
      snapType: 'none',
      snapTargetTime: null,
      shouldShowSnapGuide: false,
    }
  }

  const candidates: SnapResult[] = []
  const gridTime = Math.round(proposedTime / gridSizeSeconds) * gridSizeSeconds
  const gridSnap = candidateResult(proposedTime, gridTime, 'grid', snapThresholdSeconds)
  if (gridSnap) candidates.push(gridSnap)

  const playheadSnap = candidateResult(
    proposedTime,
    currentTime,
    'playhead',
    snapThresholdSeconds,
  )
  if (playheadSnap) candidates.push(playheadSnap)

  const track = tracks.find((item) => item.id === activeTrackId)
  track?.clips.forEach((clip) => {
    if (clip.id === ignoreClipId) return
    const startSnap = candidateResult(
      proposedTime,
      clip.startTime,
      'clip-start',
      snapThresholdSeconds,
    )
    if (startSnap) candidates.push(startSnap)
    const endSnap = candidateResult(
      proposedTime,
      getClipEndTime(clip),
      'clip-end',
      snapThresholdSeconds,
    )
    if (endSnap) candidates.push(endSnap)
  })

  const best = candidates.sort(
    (a, b) => Math.abs(proposedTime - a.snappedTime) - Math.abs(proposedTime - b.snappedTime),
  )[0]

  return (
    best ?? {
      snappedTime: proposedTime,
      snapType: 'none',
      snapTargetTime: null,
      shouldShowSnapGuide: false,
    }
  )
}
