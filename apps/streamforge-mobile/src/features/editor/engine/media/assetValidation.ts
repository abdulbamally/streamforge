import type { MediaAsset } from '../../types/media.types'
import type { TimelineTrack } from '../../types/track.types'
import { isCompatibleTrackType } from './mediaTypes'

export type MediaValidationResult = {
  valid: boolean
  reason?: string
}

function ok(): MediaValidationResult {
  return { valid: true }
}

function fail(reason: string): MediaValidationResult {
  return { valid: false, reason }
}

export function validateMediaAsset(asset: MediaAsset | null | undefined): MediaValidationResult {
  if (!asset) return fail('Media asset not found')
  if (!asset.uri) return fail('Media asset is missing a URI')
  if (!asset.type) return fail('Media type could not be inferred')
  if (asset.type !== 'image' && asset.duration !== undefined && asset.duration <= 0) {
    return fail('Media duration is invalid')
  }
  return ok()
}

export function validateAssetForTrack(
  asset: MediaAsset,
  track: TimelineTrack | null | undefined,
): MediaValidationResult {
  const assetValidation = validateMediaAsset(asset)
  if (!assetValidation.valid) return assetValidation
  if (!track) return fail('Compatible track not found')
  if (track.isLocked) return fail('Track is locked')
  if (!isCompatibleTrackType(asset.type, track.type)) {
    return fail(`${asset.type} assets cannot be added to ${track.type} tracks`)
  }
  return ok()
}
