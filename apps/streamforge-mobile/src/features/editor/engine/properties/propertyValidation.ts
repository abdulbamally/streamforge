import type { TimelineClip } from '../../types/clip.types'
import type { TimelineTrack } from '../../types/track.types'
import { isVisualClipType } from '../media/mediaTypes'

export type PropertyValidationResult = {
  valid: boolean
  reason?: string
}

function ok(): PropertyValidationResult {
  return { valid: true }
}

function fail(reason: string): PropertyValidationResult {
  return { valid: false, reason }
}

function canEdit(track?: TimelineTrack | null): PropertyValidationResult {
  if (!track) return fail('Track not found')
  if (track.isLocked) return fail('Track is locked')
  return ok()
}

export function canUpdateClipTransform(clip: TimelineClip, track?: TimelineTrack | null) {
  const base = canEdit(track)
  if (!base.valid) return base
  if (!isVisualClipType(clip.type) && clip.type !== 'sticker') return fail('Clip has no visual transform')
  return ok()
}

export function canUpdateClipOpacity(clip: TimelineClip, track?: TimelineTrack | null) {
  const base = canEdit(track)
  if (!base.valid) return base
  if (!isVisualClipType(clip.type) && clip.type !== 'sticker') return fail('Only visual clips have opacity')
  return ok()
}

export function canUpdateClipVolume(clip: TimelineClip, track?: TimelineTrack | null) {
  const base = canEdit(track)
  if (!base.valid) return base
  if (clip.type !== 'audio' && clip.type !== 'video') return fail('Only audio and video clips have volume')
  return ok()
}

export function canUpdateTextProperties(clip: TimelineClip, track?: TimelineTrack | null) {
  const base = canEdit(track)
  if (!base.valid) return base
  if (clip.type !== 'text') return fail('Only text clips can edit text properties')
  return ok()
}

export function canAddFilter(clip: TimelineClip, track?: TimelineTrack | null) {
  const base = canEdit(track)
  if (!base.valid) return base
  if (!isVisualClipType(clip.type) && clip.type !== 'sticker') return fail('Only visual clips can use filters')
  return ok()
}

export function canAddTransition(clip: TimelineClip, track?: TimelineTrack | null) {
  const base = canEdit(track)
  if (!base.valid) return base
  if (clip.type === 'audio') return fail('Audio transitions are reserved for a later phase')
  return ok()
}
