import type { TimelineClip } from '../../types/clip.types'
import type { TimelineTrack } from '../../types/track.types'
import type { EditValidationResult } from '../../types/editCommand.types'
import { MIN_CLIP_DURATION } from './trimOperations'
import { findClipById } from './clipOperations'
import { canPlaceClipAtTime, getClipEndTime } from './overlapDetection'

export function ok(): EditValidationResult {
  return { valid: true }
}

export function fail(reason: string): EditValidationResult {
  return { valid: false, reason }
}

export function canEditTrack(track: TimelineTrack | null | undefined) {
  if (!track) return fail('Track not found')
  if (track.isLocked) return fail('Track is locked')
  return ok()
}

export function canMoveClip(
  clipId: string,
  trackId: string,
  startTime: number,
  duration: number,
  tracks: TimelineTrack[],
) {
  const lookup = findClipById(tracks, clipId)
  if (!lookup) return fail('Clip not found')
  const track = tracks.find((item) => item.id === trackId)
  const trackValidation = canEditTrack(track)
  if (!trackValidation.valid) return trackValidation
  if (startTime < 0) return fail('Clip cannot start before 0s')
  if (!canPlaceClipAtTime(clipId, trackId, startTime, duration, tracks)) {
    return fail('Cannot overlap another clip')
  }
  return ok()
}

export function canTrimClipStart(
  clip: TimelineClip,
  track: TimelineTrack,
  newStartTime: number,
  tracks: TimelineTrack[],
) {
  const trackValidation = canEditTrack(track)
  if (!trackValidation.valid) return trackValidation
  const endTime = getClipEndTime(clip)
  const duration = endTime - newStartTime
  if (newStartTime < 0) return fail('Clip cannot start before 0s')
  if (duration < MIN_CLIP_DURATION) return fail('Clip is too short')
  if (!canPlaceClipAtTime(clip.id, track.id, newStartTime, duration, tracks)) {
    return fail('Cannot overlap another clip')
  }
  return ok()
}

export function canTrimClipEnd(
  clip: TimelineClip,
  track: TimelineTrack,
  newEndTime: number,
  tracks: TimelineTrack[],
) {
  const trackValidation = canEditTrack(track)
  if (!trackValidation.valid) return trackValidation
  const duration = newEndTime - clip.startTime
  if (duration < MIN_CLIP_DURATION) return fail('Clip is too short')
  if (!canPlaceClipAtTime(clip.id, track.id, clip.startTime, duration, tracks)) {
    return fail('Cannot overlap another clip')
  }
  return ok()
}

export function canSplitClip(clip: TimelineClip, track: TimelineTrack, splitTime: number) {
  const trackValidation = canEditTrack(track)
  if (!trackValidation.valid) return trackValidation
  const leftDuration = splitTime - clip.startTime
  const rightDuration = getClipEndTime(clip) - splitTime
  if (leftDuration < MIN_CLIP_DURATION || rightDuration < MIN_CLIP_DURATION) {
    return fail('Playhead must be inside the clip')
  }
  return ok()
}

export function canDeleteClip(track: TimelineTrack | null | undefined) {
  return canEditTrack(track)
}

export function canAddClip(
  clip: TimelineClip,
  track: TimelineTrack | null | undefined,
  tracks: TimelineTrack[],
) {
  const trackValidation = canEditTrack(track)
  if (!trackValidation.valid) return trackValidation
  if (!track) return fail('Track not found')
  if (clip.duration < MIN_CLIP_DURATION) return fail('Clip is too short')
  if (clip.startTime < 0) return fail('Clip cannot start before 0s')
  if (!canPlaceClipAtTime(clip.id, track.id, clip.startTime, clip.duration, tracks)) {
    return fail('Cannot overlap another clip')
  }
  if (clip.type === 'audio' && track.type !== 'audio') return fail('Audio clips need an audio track')
  if (clip.type !== 'audio' && track.type === 'audio') return fail('Visual clips need a visual track')
  return ok()
}
